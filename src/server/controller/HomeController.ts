import express from "express";
import BaseMiddleware from "./BaseMiddleware/BaseMiddleware";

class HomeController extends BaseMiddleware{

    homepage = this.catchAsync(async (request: express.Request, response: express.Response, next: express.NextFunction) => {

        //console.log("renderSsrDiPage path", request.path);

        //const page = await dynamicImportSsr.renderHtmlPage(routes.get(request.path) as IRoute);
  
        response.status(200).send("Hello");

    });

}

export default HomeController;