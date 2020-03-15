import {Request, Response, NextFunction, RequestHandler} from "express";

class BaseMiddleware{
    catchAsync = (requestHandler: RequestHandler): RequestHandler => {
  
        return async (req: Request, res: Response, next: NextFunction) => {
        
          //requestHandler(req, res, next).catch((error: Error) => { console.log("CATCH ASYNC ERROR", error); next(error)});
      
          try{
      
            await requestHandler(req, res, next);
      
          }catch(error){
      
            console.log("CATCH ASYNC ERROR", error.message); 
            next(error);
          }
        }
    };
}

export default BaseMiddleware;
