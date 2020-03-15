import Kernel from "./Kernel";
import dotenv from "dotenv";
import path from "path";
//import { path as rootPath } from 'app-root-path';
import Config from "./config";

/* ERORRS */

//On uncaught exception we must restart our server to clean stack
process.on("uncaughtException", (err: Error) => {
  console.error(err.name, err.message);
  process.exit(1);
});

process.on("uncaughtException", (err: Error) => {
  console.error(err.name, err.message);
  process.exit(1);
});

process.on("unhandledRejection", (err: Error) => {
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on("SIGTERM", () => {
  console.error("SIGTERM received");
  server.close(() => {
    process.exit(1);
  });
});

/* END ERORRS */


const config = new Config();

//On uncaught exception we must restart our server to clean stack


//https://www.natours.dev
//console.log("PATH", path.join(rootPath, "config.env"));
dotenv.config({ path: path.resolve(config.getRootPath(), "config.env") });

//const app = require("./app");

//console.log("NODE ENV", process.env.NODE_ENV);
//console.log("NODE PASS", process.env.PASS);


const kernel = new Kernel(config);

const server = kernel.app.listen(process.env.PORT, () =>
  console.log(`App running on port ${process.env.PORT}`)
);
