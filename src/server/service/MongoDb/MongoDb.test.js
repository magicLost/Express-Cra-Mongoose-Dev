import MongoDb from "./MongoDb";

describe("MongoDb", () => {

    let mongoDb = null;

    beforeEach(async () => {
        mongoDb = new MongoDb();
        await mongoDb.init();
    })

    test("We have connection to our db",  () => {

        expect(mongoDb.client.isConnected()).toEqual(true);

    });

})