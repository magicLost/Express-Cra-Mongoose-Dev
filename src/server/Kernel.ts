import React from 'react';
//import { renderToString } from 'react-dom/server';
//import routes from "../client/routes";
//import {renderRoutes} from 'react-router-config';
//import {StaticRouter } from 'react-router-dom';
//import {Provider} from 'react-redux';
//import serialize from 'serialize-javascript';
import path from 'path';
import express, {static as staticMiddleware, Express} from "express";
//import App from '../client/App';

//import FileSystemHelper from './utils/FileSystem/FileSystemHelper';

//import AppError from "./utils/AppError";
import {IConfig} from "./config";

import ErrorController from './controller/ErrorController/ErrorController';
import AuthController from './controller/AuthController/AuthController';

import UserRouter from './routes/UserRouter';
import UserModel from './entity/mongoose/UserModel/UserModel';
import UserController from './controller/UserController/UserController';

//const { PerformanceObserver, performance } = require('perf_hooks');


 
class Kernel{

  //observer: PerformanceObserver;

  app: Express;

  config: IConfig;

  mainHtml: string;

  errorController: ErrorController;

  userRouter: UserRouter;

  constructor(config: IConfig){

    this.init(config);


    this.app.use(staticMiddleware(path.join(__dirname, "..", "build")));

    //app.use(checkRouteForExisting);

    this.app.use("/users", this.userRouter.getRouter());

    this.app.all("*", (request, response, next) => {

      response.send(this.mainHtml);

    }); 

    this.app.use(this.errorController.globalErrorHandler);

  }

  init = (config: IConfig) => {

    this.config = config;

    this.errorController = new ErrorController();

    this.userRouter = new UserRouter(
      new AuthController(
        UserModel,
        process.env.JWT_SECRET,
        process.env.JWT_COOKIE_EXPIRES_AT,
        process.env.JWT_EXPIRES_AT
      ), 
      new UserController(UserModel)
    );

    this.app = express();

    const fs = this.config.getFileSystemHelper();
    const pathToIndexHtml = this.config.getPathToIndexHtml();

    if(!fs.isFileExists(pathToIndexHtml))
      throw new Error(`No index.html file on address - ${pathToIndexHtml}`);

    this.mainHtml = "";

    fs.readFile(pathToIndexHtml, true).then((data: string) => {
      this.mainHtml = data;
    })
  }
}

export default Kernel; 