import UserController from "./UserController";
import mongoose from 'mongoose';
import {users, addUsers} from "./../../utils/Test/mongoose";
import UserModel from "../../entity/mongoose/UserModel/UserModel";

describe("UserController", () => {

    let mongooseCon = undefined;
    let controller = undefined;

    beforeAll( async () => {

        mongooseCon = await mongoose
            .connect("mongodb://localhost:27017", {
                useNewUrlParser: true,
                useCreateIndex: true,
                useFindAndModify: false,
                useUnifiedTopology: true,
                dbName: "test_db"
        });

        controller = new UserController(UserModel);

        await addUsers(controller.userModel);
    });

    afterAll(async () => {
        await controller.userModel.collection.drop();
        await mongooseCon.disconnect();
    });

    test("Connection", () => {

        expect(mongooseCon.version).toEqual("5.9.3");
    });

    describe("getAllUsers", () => {

        test("It must call response status and json with users in data prop", async () => {

            const response = {
                cookie: jest.fn(),
                status: jest.fn(),
                json: jest.fn().mockImplementation((json) => {
                    expect(json.status).toEqual("success");
                    expect(json.results).toEqual(users.length);
                })
            }
            response.status.mockReturnValue(response);

            const next = jest.fn();

            await controller.getAllUsers({}, response, next);

            expect(response.status).toHaveBeenCalledTimes(1);
            expect(response.status).toHaveBeenCalledWith(200);

            expect(next).toHaveBeenCalledTimes(0);

            /* expect(response.json).toHaveBeenCalledTimes(1);
            expect(response.json).toHaveBeenCalledWith({
                status: "success",
                results: users.length,
                data: {
                    users
                }
            }); */

        });

    })

    describe("filterObj", () => {
        test("It must return object with only name and emai properties", () => {

            const object = {
                name: "Sia",
                email: "sia@mail.ru",
                password: "12334saf",
                secret: "secret"
            }

            const filteredBody = controller.filterObj(object, "name", "email");

            expect(filteredBody).not.toHaveProperty("secret");
            expect(filteredBody).not.toHaveProperty("password");
            expect(filteredBody.name).toEqual("Sia");
            expect(filteredBody.email).toEqual("sia@mail.ru");
        })
    })

})