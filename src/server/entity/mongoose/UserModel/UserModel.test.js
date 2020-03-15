import mongoose, {Mongoose} from 'mongoose';
import UserModel from './UserModel';


describe("UserModel", () => {

    let mongooseCon = undefined;

    beforeAll( async () => {

        mongooseCon = await mongoose
            .connect("mongodb://localhost:27017", {
                useNewUrlParser: true,
                useCreateIndex: true,
                useFindAndModify: false,
                useUnifiedTopology: true,
                dbName: "test_db"
        });

        await UserModel.collection.drop();
    })

    afterAll(async () => {
        await UserModel.collection.drop();
        await mongoose.disconnect();
    })

    test("Connection", () => {

        expect(mongooseCon.version).toEqual("5.9.3");

    })

    describe("createUser", () => {

        test("It must throw an error on not valid name and confirm password", async () => {

            try{
                const user = await UserModel.create({
                    name: "N",
                    email: "example@mail.ru",
                    role: "admin",
                    password: "12345678",
                    passwordConfirm: "12345"
                });
            }catch(error){
                expect(error.message).toEqual("User validation failed: name: Too short name, passwordConfirm: Password is not the same");
            }

        })
    })


})