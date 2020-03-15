import BaseMiddleware from "../BaseMiddleware/BaseMiddleware";
import {Request, Response, NextFunction} from "express";
import {Model} from "mongoose";
import {IUserModel} from "./../../entity/mongoose/UserModel/UserModel";
import {IUserRequest} from "./../AuthController/AuthController";
import AppError from "../../utils/AppError";


class UserController extends BaseMiddleware {

    userModel: Model<IUserModel>;

    constructor(userModel: Model<IUserModel>){
        super();
        this.userModel = userModel;
    }

    getAllUsers = this.catchAsync(async (req: IUserRequest, res: Response, next: NextFunction) => {

        const users = await this.userModel.find(
            {}, 
            null, 
            {limit: 100}
        );
    
        res.status(200).json({
            status: "success",
            results: users.length,
            data: {
                users
            }
        });
    });

    getUserById = this.catchAsync(async (req: IUserRequest, res: Response, next: NextFunction) => {

        const user = await this.userModel.findById(req.params.id);
    
        res.status(200).json({
            status: "success",
            data: {
                user
            }
        });
    });

    getMe = (req: IUserRequest, res: Response, next: NextFunction) => {
        
        if(req.user){

            const user = req.user;
            user.password = undefined;
            user.passwordConfirm = undefined;

            res.status(200).json({
                status: "success",
                data: {
                    user
                }
            });
        }else{
            res.status(404).json({
                status: "fail",
                message: "You must login first..."
            });
        }
    };

    updateMe = this.catchAsync(async (req: IUserRequest, res: Response, next: NextFunction) => {
        // 1 Create error if user post password
        if (req.body.password || req.body.passwordConfirm) {
          return next(
            new AppError(
              "This route is not for password updates. Please use /update-password",
              400
            )
          );
        }

        // 2 Update user document
        const filteredBody = this.filterObj(req.body, "name", "email");

        const updatedUser = await this.userModel.findByIdAndUpdate(req.user.id, filteredBody, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            status: "success",
            data: {
                user: updatedUser
            }
        });
    });

    deleteMe = this.catchAsync(async (req: IUserRequest, res: Response, next: NextFunction) => {
        await this.userModel.findByIdAndUpdate(req.user.id, { active: false });
      
        res.status(204).json({
          status: "success",
          data: null
        });
    });

    createUser = (req, res) => {
        res.status(501).json({
          status: "fail",
          message: "Not implemented"
        });
    };

    updateUser = this.catchAsync(async (req: IUserRequest, res: Response, next: NextFunction) => {
        //new: true - says that in tour it was updated tour
        const doc = await this.userModel.findByIdAndUpdate(req.params.id, req.body, {
          new: true,
          runValidators: true
        });
    
        if (!doc) {
          return next(new AppError("No document found", 404));
        }
    
        res.status(201).json({
          status: "success",
          data: {
            doc
          }
        });
    });

    deleteUser = this.catchAsync(async (req: IUserRequest, res: Response, next: NextFunction) => {
        //new: true - says that in tour it was updated tour
        const doc = await this.userModel.findByIdAndDelete(req.params.id);
    
        if (!doc) {
          return next(new AppError("No document found", 404));
        }
    
        res.status(204).json({
          status: "success",
          data: null
        });
    });

    filterObj = (obj: Object, ...allowedFields: string[]) => {

        const newObj = {};

        Object.keys(obj).forEach((element: string) => {

          if (allowedFields.includes(element)) newObj[element] = obj[element];
        });

        return newObj;
    };
}

export default UserController;