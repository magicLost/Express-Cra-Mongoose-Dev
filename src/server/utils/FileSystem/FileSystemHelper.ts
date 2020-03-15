import rimraf from "rimraf";
import { ncp } from "ncp";
const fs = require("fs");
const { promisify } = require("util");

export interface IFileSystemHelper{
    deleteDir: (path: string, isAsync?: boolean,) => Promise<any>;
    copyDir: (pathToCopy: string, pathDestination: string, isAsync?: boolean,) => Promise<any>;
    makeDir: (path: string, isAsync?: boolean,) => Promise<any>;
    writeFile: (path: string, data: string, isAsync?: boolean, utf?: string) => Promise<any>;
    readFile: (path: string, isAsync?: boolean, utf?: string) => Promise<any>;
    isFileExists: (path: string) => boolean;
}

class FileSystemHelper implements IFileSystemHelper {

    //fs.readdir
    isFileExists = (path: string) => fs.existsSync(path);

    makeDir = (path: string, isAsync: boolean = false) => {

        return promisify(fs.mkdir)(path)
            .catch((error: Error) => this.catchError(error, isAsync));

    };

    deleteDir = (path: string, isAsync: boolean = false) => {
        return promisify(rimraf)(path)
            .catch((error: Error) => this.catchError(error, isAsync));
        //return await this.rimrafPromisify(path);
        /* rimraf(path, err => {
            if (err) {
            return console.error(err);
            }
            console.log(`${path} - successfully deleted.`);
        }); */
    };

    copyDir = (pathToCopy: string, pathDestination: string, isAsync: boolean = false) => {
        //ncp.limit = 16;
        return promisify(ncp)(pathToCopy, pathDestination)
            .catch((error: Error) => this.catchError(error, isAsync));

        /* ncp(pathToCopy, pathDestination, err => {
            if (err) {
            return console.error(err);
            }
            console.log("Copy dir done!");
        }); */
    };

    writeFile = (path: string, data: string, isAsync: boolean = false, utf: string = "utf-8") => {
        return promisify(fs.writeFile)(path, data, utf)
            .catch((error: Error) => this.catchError(error, isAsync));
    }

    //fs.readFile('/etc/passwd', 'utf8', callback);
    readFile = (path: string, isAsync: boolean = false, utf: string = "utf-8") => {
        return promisify(fs.readFile)(path, utf)
            .catch((error: Error) => this.catchError(error, isAsync));
    }

    catchError = (error: Error, isAsync: boolean) => {

        if(isAsync){
            console.log(`[ASYNC] ${error.message}`);
        }else{
            throw(error);
        } 
    }

}

export default FileSystemHelper;