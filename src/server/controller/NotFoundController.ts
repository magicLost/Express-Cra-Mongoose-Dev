import {Request, Response, NextFunction} from "express";
//import routes from "../../routes/routes";

class NotFoundController {

  

  checkRouteForExisting = (request: Request, response: Response, next: NextFunction) => {

    /* if(!routes.has(request.path)){
  
      //read file with not found page
      //return not found page
      response.status(404).end(`Страница не найдена... ${request.path}`);
    }else{
      next();
    }
   */
  }

}