import Kernel from "./app";
import dotenv from "dotenv";
import path from "path";
//import { path as rootPath } from 'app-root-path';
import Config from "./config";
import wsock from "websocket-stream";
import through from "through2";
import http from 'http';
const { finished } = require('stream');


const loud = () => {
    return through((buf, enc, next) => {
        next(null, buf.toString().toUpperCase());
    })
}


const config = new Config();

//On uncaught exception we must restart our server to clean stack
process.on("uncaughtException", err => {
  console.error(err.name, err.message);
  process.exit(1);
});

//https://www.natours.dev
//console.log("PATH", path.join(rootPath, "config.env"));
dotenv.config({ path: path.resolve(config.getRootPath(), "config.env") });

//const app = require("./app");

//console.log("NODE ENV", process.env.NODE_ENV);
//console.log("NODE PASS", process.env.PASS);


const kernel = new Kernel(config);

const server = http.createServer(kernel.app);

server.listen(8080);

/* const server = kernel.app.listen(process.env.PORT, () =>
  console.log(`App running on port ${process.env.PORT}`)
); */

wsock.createServer({server: server}, (stream: any) => {
    stream.pipe(loud()).pipe(stream);

    finished(stream, (err: Error) => {
        if (err) {
          console.error('Stream failed.', err);
        } else {
          console.log('Stream is done reading.');
        }
      });
});