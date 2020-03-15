import AppError from "./../../utils/AppError";
import {Request, Response, NextFunction} from "express";

export interface IErrorController{
    globalErrorHandler: (err: any, req: Request, res: Response, next: NextFunction) => void;
}

class ErrorController implements IErrorController{

    globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {

        //console.log("Error handler");
      
        err.statusCode = err.statusCode || 500;
        err.status = err.status || "error";
      
        if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {

          this.sendErrorDev(err, res);

        } else if (process.env.NODE_ENV === "production") {

          let error = { ...err };
      
          if (error.name === "CastError") error = this.handleCastErrorDB(err);
      
          if (error.name === "ValidationError")
            error = this.handleValidationErrorDB(error);
      
          if (error.code === 11000) error = this.handleDuplicateFieldsDB(err);
      
          if (error.name === "JsonWebTokenError") error = this.handleJWTError();
      
          if (error.name === "TokenExpiredError") error = this.handleJWTExpiredError();
      
          this.sendErrorProd(error, res);
        }
    };

    handleCastErrorDB = (err: any) => {
        const message = `Invalid ${err.path}: ${err.value}`;
        return new AppError(message, 400);
      };
      
    handleValidationErrorDB = (err: any) => {
        const errors = Object.values(err.errors).map((el: any) => el.message);
        const message = `Invalid input data. ${errors.join(". ")}`;
        return new AppError(message, 400);
      };
      
    handleDuplicateFieldsDB = (err: any) => {
        const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
        const message = `Duplicate field value: ${value}. Please use another value`;
        return new AppError(message, 400);
      };
      
    handleJWTError = () =>
        new AppError(`Invalid token. Please login again`, 401);
      
    handleJWTExpiredError = () =>
        new AppError(`Token has expired. Please login again`, 401);

    sendErrorDev = (err: AppError, res: Response) => {
        res.status(err.statusCode).json({
          status: err.status,
          error: err,
          message: err.message,
          stack: err.stack
        });
    };
      
    sendErrorProd = (err: AppError, res: Response) => {
        if (err.isOperational) {
          res.status(err.statusCode).json({
            status: err.status,
            message: err.message
          });
        } else {
          //console.error("sendErrorProd ", err);
      
          res.status(500).json({
            status: "error",
            message: "Something wrong"
          });
        }
    };
}

export default ErrorController;
