import {path as rootPath} from "app-root-path";
import path from "path";
import FileSystemHelper from "./utils/FileSystem/FileSystemHelper";

export interface IConfig {
    getRootPath: () => string;
    getPathToIndexHtml: () => string;
    getFileSystemHelper: () => FileSystemHelper;
    getUserRoles: () => string[];
}

class Config implements IConfig{

    private rootPath: string = "";
    private pathToIndexHtml: string = "";
    private fileSystemHelper: FileSystemHelper | undefined = undefined;
    private userRoles: string[];

    constructor(){
        this.rootPath = rootPath;
        this.pathToIndexHtml = path.resolve(this.rootPath, "build", "iiindex.html");
        this.userRoles = ['admin', 'user'];
        //console.log("Create config");
    }

    getRootPath = () => {
        return this.rootPath;
    }

    getPathToIndexHtml = () => {
        return this.pathToIndexHtml;
    }

    getFileSystemHelper = () => {
        if(this.fileSystemHelper === undefined){
            this.fileSystemHelper = new FileSystemHelper();
        }
        return this.fileSystemHelper;
    }

    getUserRoles = () => this.userRoles;

};

export default Config;