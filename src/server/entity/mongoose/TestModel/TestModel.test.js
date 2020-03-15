import mongoose from 'mongoose';
import TestModel from './TestModel';

const users = [
    {
        name: "Nikki",
        email: "example@mail.ru",
        role: "admin",
        password: "12345678",
        passwordConfirm: "12345678"
    },
    {
        name: "Tikki",
        email: "tikki@mail.ru",
        role: "user",
        password: "12345678",
        passwordConfirm: "12345678"
    },
    {
        name: "Sia",
        email: "sia@mail.ru",
        role: "guide",
        password: "12345678",
        passwordConfirm: "12345678"
    },
    {
        name: "Anna",
        email: "anna@mail.ru",
        role: "user",
        password: "12345678",
        passwordConfirm: "12345678"
    },
]

describe("TestModel", () => {

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
    })

    afterAll(async () => {
        await TestModel.collection.drop();
        await mongoose.disconnect();
    })

    test("Connection", () => {

        expect(mongooseCon.version).toEqual("5.9.3");
    })

    /* test("Create collection and add document", async () => {
        const testDocment = await TestModel.create(users[0]);

        const user = await TestModel.findOne({ email: "example@mail.ru" }).select("+password");

        expect(user.get('name')).toEqual("Nikki");

        expect(testDocment.get('name')).toEqual("Nikki");
    })

    test("Do not insert not valid user", async () => {
        try{

            const testDocment = await TestModel.create({
                name: "N",
                email: "new@mail.ru",
                role: "admin",
                password: "12345678",
                passwordConfirm: "12345678"
            });

        }catch(error){

            expect(error.message).toEqual("Test validation failed: name: Too short name.");
        }
    })

    test("Delete document", async () => {

        const testDocment = await TestModel.create(users[1]);

        const result = await TestModel.findOneAndDelete({email: users[1].email});

        expect(result.get('name')).toEqual(users[1].name);

        const user = await TestModel.findOne({email: users[1].email});

        expect(user).toEqual(null);
    }) */

    test("Find", async () => {

        const createUserPromises = [];

        for(let user of users){
            createUserPromises.push(TestModel.create(user));
        }

        await Promise.all(createUserPromises);

        //const testDocment = await TestModel.create(users[0]);
        let usersFromDb = await TestModel.find({}, null, {});

        expect(usersFromDb).toHaveLength(users.length);

        usersFromDb = await TestModel.find({}, null, {limit: 2});

        expect(usersFromDb[0].name).toEqual("Nikki");
        expect(usersFromDb[0].password).toEqual(undefined);
        expect(usersFromDb[0].role).toEqual("admin");
        expect(usersFromDb[1].name).toEqual("Tikki");
        expect(usersFromDb).toHaveLength(2);

        usersFromDb = await TestModel.find({}, "+password -role", {skip: 1, limit: 2});

        expect(usersFromDb[0].name).toEqual("Tikki");
        expect(usersFromDb[0].password).toEqual("12345678");
        expect(usersFromDb[0].role).toEqual(undefined);
        expect(usersFromDb[1].name).toEqual("Sia");
        expect(usersFromDb).toHaveLength(2);  
    })

})