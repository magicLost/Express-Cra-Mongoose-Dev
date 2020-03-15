//const MongoClient = require('mongodb').MongoClient;
import { MongoClient, Db } from "mongodb";
import User from "./../../entity/mongoDbNative/User";

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'myproject';


class MongoDb{

    //db: 
    client: MongoClient | undefined = undefined;
    url: string;
    dbName: string;
    db: Db;
    userSchema: any;
    userCollection: any;


    constructor(){

        //this.client = client; client must connect in server once
        this.url = process.env.MONGO_URL;
        this.dbName = process.env.MONGO_USER_DB_NAME;
        this.userSchema = User;
    }

    init = async () => {

        try{

            this.client = await MongoClient.connect(url);
            this.db = this.client.db(this.dbName);
            
            this.userCollection = this.db.collection('user');

        }catch(error){

            console.error(error);
        }
    };

    makeUserCollection = async () => {

        return await this.db.createCollection( "user", {
            validator: { $jsonSchema: this.userSchema },
            validationAction: "error"
        });
    };


}

export default MongoDb;