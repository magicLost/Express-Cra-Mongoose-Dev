import crypto from "crypto";
import { promisify } from "util";
import {sign, verify} from "jsonwebtoken";
import { IUserModel} from "./../../entity/mongoose/UserModel/UserModel";
import {Model} from "mongoose";
import AppError from "./../../utils/AppError";
import {Request, Response, NextFunction, RequestHandler} from "express";
import BaseMiddleware from "../BaseMiddleware/BaseMiddleware";
//import sendEmail from "./../../utils/email";

export interface IUserRequest extends Request{
    user: IUserModel;
}

export interface IAuthController{

    jwtSecret: string;
    jwtVerify: (token: string, secret: string) => Promise<{id: string, iat: string}>;

    signup: (req: IUserRequest, res: Response, next: NextFunction) => RequestHandler;
    login: (req: IUserRequest, res: Response, next: NextFunction) => RequestHandler;

    protect: (req: IUserRequest, res: Response, next: NextFunction) => RequestHandler;
    restrictTo: (...roles: string []) => RequestHandler;

    forgotPassword: (req: IUserRequest, res: Response, next: NextFunction) => RequestHandler;
    updatePassword: (req: IUserRequest, res: Response, next: NextFunction) => RequestHandler;
    resetPassword: (req: IUserRequest, res: Response, next: NextFunction) => RequestHandler;

}


class AuthController extends BaseMiddleware implements IAuthController{

    //process.env.JWT_SECRET
    jwtSecret: string;
    jwtCookieExpiresAt: string;
    jwtExpiresAt: string;
    jwtVerify: (token: string, secret: string) => Promise<{id: string, iat: string}>;

    userModel: Model<IUserModel>;

    constructor(userModel: Model<IUserModel>, jwtSecret: string, jwtCookieExpiresAt: string, jwtExpiresAt: string) {
        super();
        this.jwtCookieExpiresAt = jwtCookieExpiresAt;
        this.jwtExpiresAt = jwtExpiresAt;
        this.jwtSecret = jwtSecret;
        this.jwtVerify = (promisify(verify) as any);
        this.userModel = userModel;
    }

    signup = this.catchAsync(async (req: IUserRequest, res: Response, next: NextFunction) => {
        const user = await this.userModel.create({
          name: req.body.name,
          email: req.body.email,
          role: req.body.role,
          password: req.body.password,
          passwordConfirm: req.body.passwordConfirm
        });
      
        this.createAndSendToken(user, 201, req, res);
    });

    login = this.catchAsync(async (req: IUserRequest, res: Response, next: NextFunction) => {
        const { email, password } = req.body;
        if (!email || !password) {
          return next(new AppError("No passwor or email", 400));
        }
      
        const user = await this.userModel.findOne({ email }).select("+password");
      
        if (!user || !(await user.correctPassword(password, user.password))) {
          return next(new AppError("Incorrect email or password", 401));
        }
      
        this.createAndSendToken(user, 200, req, res);
    });

    protect = this.catchAsync(async (req: IUserRequest, res: Response, next: NextFunction) => {
        /* GET TOKEN */
        let token: string;
        if (
          req.headers.authorization &&
          req.headers.authorization.startsWith("Bearer")
        ) {
          token = req.headers.authorization.split(" ")[1];
        }
      
        if (!token) return next(new AppError("You are not logged in.", 401));
      
        /* VERIFY TOKEN */
        const decoded = await this.jwtVerify(token, this.jwtSecret);
      
        /* CHECK IF USER EXISTS */
        const user = await this.userModel.findById(decoded.id);
      
        if (!user)
          return next(
            new AppError("The user belonging to this token does not exists.", 401)
          );
      
        /* CHECK IF USER CHANGED PASSWORD AFTER THE TOKEN WAS ISSUED */
        if (user.changedPasswordAfter(decoded.iat)) {
          return next(
            new AppError("User recently changed password. Please login again", 401)
          );
        }
      
        /* GRANT ACCESS TO PROTECTED ROUTE */
        req.user = user;
      
        next();
    });

    restrictTo = (...roles: string[]) => {
        return (req: IUserRequest, res: Response, next: NextFunction) => {
          if (!roles.includes(req.user.role)) {
            return next(
              new AppError("You do not have permission to perform this action", 403)
            );
          }
      
          next();
        };
    };

    forgotPassword = this.catchAsync(async (req: IUserRequest, res: Response, next: NextFunction) => {
        const user = await this.userModel.findOne({ email: req.body.email });
      
        if (!user) {
          return next(new AppError("There is no user with email address.", 404));
        }
      
        const resetToken = user.createPasswordResetToken();
      
        await user.save({ validateBeforeSave: false });
      
        const resetUrl = `${req.protocol}://${req.get(
          "host"
        )}/api/v1/users/reset-password/${resetToken}`;
      
        const message = `Forgot your password? Submit a request with your new password and passwordConfirm to: ${resetUrl}`;
      
        try {
          /* await sendEmail({
            email: user.email,
            subject: "Your password reset token (valid for 10 minutes)",
            message
          }); */
      
          res.status(200).json({
            status: "success",
            message: "Token sent to email"
          });
        } catch (err) {
          user.createPasswordResetToken = undefined;
          user.passwordResetExpires = undefined;
          await user.save({ validateBeforeSave: false });
      
          return next(
            //"There was an error sending the email. Try again later!"
            new AppError(err.message, 500)
          );
        }
    });

    resetPassword = this.catchAsync(async (req: IUserRequest, res: Response, next: NextFunction) => {
        //get user based on token
        const hashedToken = crypto
          .createHash("sha256")
          .update(req.params.token)
          .digest("hex");
      
        const user = await this.userModel.findOne({
          passwordResetToken: hashedToken,
          passwordResetExpires: { $gt: Date.now() }
        });
      
        if (!user) {
          return next(new AppError("Token is invalid or expired", 400));
        }
      
        //set new password
        user.password = req.body.password;
        user.passwordConfirm = req.body.passwordConfirm;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
      
        //update user
        await user.save();
      
        //login user
        this.createAndSendToken(user, 200, req, res);
    });
      
    updatePassword = this.catchAsync(async (req: IUserRequest, res: Response, next: NextFunction) => {
        // 1 Get user from collection
        const user = await this.userModel.findById(req.user.id).select("+password");
      
        const { currentPassword, password, passwordConfirm } = req.body;
      
        if (!user)
          return next(
            new AppError("Some error. Please log in and try again...", 401)
          );
      
        // 2 Check if posted password correct
        if (!(await user.correctPassword(currentPassword, user.password))) {
          return next(new AppError("Wrong password. Please try again...", 401));
        }
      
        // 3 Update password
        user.password = password;
        user.passwordConfirm = passwordConfirm;
      
        await user.save();
      
        // 4 Log user in
        this.createAndSendToken(user, 201, req, res);
    });

    signToken = (id: string) => {
        return sign(
            { id: id }, 
            this.jwtSecret, 
            { expiresIn: this.jwtExpiresAt }
        );
    };

    createAndSendToken = (
        user: IUserModel, 
        statusCode: number, 
        req: IUserRequest, 
        res: Response
    ) => {
        const token = this.signToken(user._id);
      
        //if (process.env.NODE_ENV === "production") cookieOptions.secure = true;
      
        res.cookie("jwt", token, {
          expires: new Date(
            Date.now() + parseInt(this.jwtCookieExpiresAt) * 24 * 60 * 60 * 1000
          ),
          httpOnly: true,
          secure: req.secure || req.headers["x-forwarded-proto"] === "https"
        });
      
        user.password = undefined;
      
        res.status(statusCode).json({
          status: "success",
          token,
          data: {
            user
          }
        });
    };
}

export default AuthController;
