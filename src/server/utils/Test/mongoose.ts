import {Model as MongooseModel} from "mongoose";

export const users = [
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
    {
        name: "Vanna",
        email: "vanna@mail.ru",
        role: "user",
        password: "12345678",
        passwordConfirm: "12345678"
    },
]

export const addUsers = async (Model: MongooseModel<any>) => {

    const createUserPromises = [];

    for(let user of users){
        createUserPromises.push(Model.create(user));
    }

    await Promise.all(createUserPromises);

};