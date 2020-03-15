import AuthController from "./AuthController";
import {sign} from "jsonwebtoken";

jest.mock("jsonwebtoken", () => {
    return {
        __esModule: true,
        sign: jest.fn(),
        verify: jest.fn()
    }
});

describe("AuthController", () => {

    let controller = null;

    const req = {
        body: {
            name: "sia",
            email: "email",
            role: "user",
            password: "123",
            passwordConfirm: "123"
        }
    }

    beforeAll(() => {
        controller = new AuthController({}, 'secret', '12', '15', ['admin', 'user']);
    })

    afterAll(() => {
        sign.mockClear();
        verify.mockClear();
    })

    describe("signToken", () => {

        test("We call sign method of JWT lib with id, jwtSecret and jwtExpiresAt", () => {

            controller.signToken("super_id");

            expect(sign).toHaveBeenCalledTimes(1);

            expect(sign).toHaveBeenCalledWith({id: "super_id"}, "secret", { expiresIn: "15" });
        })
    })

    describe("createAndSendToken", () => {

        test("It create token, set cookie, set to Response token, status and user data without pass", () => {

            //sign.mockReturnValue("Token");

            const user = {_id: "id", password: "12345"};

            Date.now = jest.fn();
            Date.now.mockReturnValue(1584111798181);

            const request = {secure: false, headers: []};

            controller.signToken = jest.fn();
            controller.signToken.mockReturnValue("Token");

            const response = {
                cookie: jest.fn(),
                status: jest.fn(),
                json: jest.fn()
            }
            response.status.mockReturnValue(response);

            controller.createAndSendToken(user, 200, request, response);

            /* CREATE TOKEN WITH SIGN TOKEN METHOD */
            expect(controller.signToken).toHaveBeenCalledTimes(1);
            expect(controller.signToken).toHaveBeenCalledWith("id");

            /* SET COOKIE */
            expect(response.cookie).toHaveBeenCalledTimes(1);
            expect(response.cookie).toHaveBeenCalledWith("jwt", "Token", {
                expires: new Date(
                    Date.now() + 12 * 24 * 60 * 60 * 1000
                ),
                httpOnly: true,
                secure: false
            });

            /* SET STATUS AND SEND RESPONSE */
            expect(response.status).toHaveBeenCalledTimes(1);
            expect(response.status).toHaveBeenCalledWith(200);

            expect(response.json).toHaveBeenCalledTimes(1);
            expect(response.json).toHaveBeenCalledWith({
                status: "success",
                token: "Token",
                data: {
                    user: {_id: "id", password: undefined}
                }
            });
        })
    })

    describe("signup", () => {

        test("It must call create on UserModel and call createAndSendToken", async () => {

            

            const res = "res";
            const next = jest.fn();

            controller.userModel = {
                create: jest.fn().mockImplementation((userObject) => {
                    return new Promise((resolve, reject) => {
                        expect(userObject).toEqual(req.body);
                        resolve("user");
                    })
                }),
            }

            controller.createAndSendToken = jest.fn();

            await controller.signup(req, res, next);

            expect(controller.userModel.create).toHaveBeenCalledTimes(1);

            expect(controller.createAndSendToken).toHaveBeenCalledTimes(1);
            expect(controller.createAndSendToken).toHaveBeenCalledWith("user", 201, req, res);
            //expect(controller.userModel.create).toHaveBeenCalledWith()

        });

        test("It must call next function on UserMOdel exception", async () => {

            controller.userModel = {
                create: jest.fn().mockImplementation(() => {
                    return new Promise((resolve, reject) => {
                        //expect(userObject).toEqual(req.body);
                        reject("User validation failed: name: Too short name");
                    })
                }),
            }
            
            
            const res = "res";
            const next = jest.fn();

            await controller.signup(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            expect(next).toHaveBeenCalledWith("User validation failed: name: Too short name");

        })
    })
})