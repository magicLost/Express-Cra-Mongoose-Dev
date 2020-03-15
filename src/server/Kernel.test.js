import request from "supertest";
import express, {static as staticMiddleware} from "express";
import Kernel from "./Kernel.ts";
import path from 'path';
//import globalErrorHandler from "./service/ErrorHandler/errorHandler";
import { path as pathRoot } from 'app-root-path';


jest.mock("express", () => {

  const originalExpressModule = jest.requireActual("express");

  //https://jestjs.io/docs/en/jest-object 
  //console.log(`ORIGINAL EXPRESS MODULE ${originalExpressModule}`);

  return {
    __esModule: true,
    default: originalExpressModule, 
    static: jest.fn((route, options) => {
      return (req, res, next) => {
        next();
      }
    }),
  }

});  

/* jest.mock("./utils/FileSystem/FileSystemHelper", () => ({
  __esModule: true,
  default: jest
            .fn()
            .mockImplementation(() => {
              return { 
                readFile: jest.fn(() => {
                    return new Promise((resolve, reject) => {
                        resolve("!!!meta-description-content!!! !!!title!!! !!!css!!! !!!js!!! !!!content!!!");
                    })
                })
              } 
            })
})); */

describe("App", () => {

  let kernel = null;
  let fileSystemHelper = {
      isFileExists: jest.fn(() => true),
      writeFile: jest.fn(),
      readFile: jest.fn(() => new Promise((resolve, reject) => {
        resolve("React App");
      }))
    };
  let config = {
    getFileSystemHelper: jest.fn(() => fileSystemHelper),
    getPathToIndexHtml: jest.fn(() => {
      return "path";
    })
  };

  beforeEach(() => {
    kernel = new Kernel(config);
  });

  afterEach(() => {
    staticMiddleware.mockClear();
    config.getFileSystemHelper.mockClear();
    fileSystemHelper.isFileExists.mockClear();
    fileSystemHelper.readFile.mockClear();
    fileSystemHelper.writeFile.mockClear();
  });

  test("spyOn demo", () => {
    const hello = {
      sum: (a, b) => a + b
    };
    const spy = jest.spyOn(hello, "sum");

    const res = hello.sum(2,3);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(res).toEqual(5);
  })

  test("It must return correct root path", () => {
    
    expect(pathRoot).toEqual("/home/nikki/Documents/NodeJs/express-react-dev");
  }); 

  test("It call fileSystemHelper two times on Kernel creation", async () => {

    //const response = await request(kernel.app).get("/");

    expect(config.getFileSystemHelper).toHaveBeenCalledTimes(1);

    expect(fileSystemHelper.isFileExists).toHaveBeenCalledTimes(1);

    expect(fileSystemHelper.readFile).toHaveBeenCalledTimes(1);

    //expect(staticMiddleware).toHaveBeenNthCalledWith(1, path.join(__dirname, "..", "build") );

    //expect(response.statusCode).toEqual(200);

    //expect(response.text.includes("React App")).toEqual(true);

  }); 

  test("It eval code after response send", async () => {

    const response = await request(kernel.app).get("/");

    expect(config.getFileSystemHelper).toHaveBeenCalledTimes(1);

    expect(fileSystemHelper.isFileExists).toHaveBeenCalledTimes(1);

    expect(fileSystemHelper.readFile).toHaveBeenCalledTimes(1);

    expect(fileSystemHelper.writeFile).toHaveBeenCalledTimes(0);

    expect(staticMiddleware).toHaveBeenNthCalledWith(1, path.join(__dirname, "..", "build") );

    expect(response.statusCode).toEqual(200);

    expect(response.text.includes("React App")).toEqual(true);

  }); 

  test("It should response the GET method on /", async () => {

    const response = await request(kernel.app).get("/");

    expect(staticMiddleware).toHaveBeenNthCalledWith(1, path.join(__dirname, "..", "build") );

    expect(response.statusCode).toEqual(200);

    expect(response.text.includes("React App")).toEqual(true);

  });


  /* test("It should show not found page on bad path /no", async () => {
    const response = await request(kernel.app).get("/no");

    expect(response.statusCode).toEqual(404);

    expect(response.text.includes("Страница не найдена...")).toEqual(true);

  }); 

   test("It should show not found page on bad file request /main.13768b.css", async () => {
    const response = await request(kernel.app).get("/main.13768b.css");

    expect(response.statusCode).toEqual(404);

    expect(response.text.includes("Страница не найдена...")).toEqual(true);

  });  

  test("It should show error page if on server Error occure", async () => {

    const response = await request(kernel.app).get("/exception");

    //expect(globalErrorHandler).toHaveBeenCalledTimes(1);

    expect(response.statusCode).toEqual(500);

    //expect(response.text).toEqual("Страница не найдена...");

    expect(response.text.includes("Error")).toEqual(true);

  });    */
 
});  