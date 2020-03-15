import ErrorController from "./ErrorController";

describe("ErrorController", () => {

    describe("errorHandler", () => {

        test("What if we pass standard Error", () => {
    
            const error = new ErrorController();

            const response = {
                status: jest.fn(() => { return response; }),
                json: jest.fn(() => { return response; }),
            };
    
            const request = {};
            const next = jest.fn();
    
            error.globalErrorHandler(new Error("Hello error"), request, response, next);
    
            expect(process.env.NODE_ENV).toEqual("test");
    
            expect(response.status).toHaveBeenNthCalledWith(1, 500);
    
            expect(response.json).toHaveBeenCalledTimes(1);
        })
    })
})

