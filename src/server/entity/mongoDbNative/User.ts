const User =  {

    required: [ "name", "email" ],

    properties: {

       name: { 
           bsonType: "string",
           pattern: "/[a-zA-ZА-Яа-я\s]*/u",
           minLength: 2,
           maxLength: 100,
           description: "Uncorrect symbols in name..."
        },

       email: { 
           bsonType: "string",
           pattern: '^[a-zA-Z0-9.!#$%&\'*+\\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$',
           maxLength: 255,
           description: "Email not valid..."
        }
    }
}

export default User;