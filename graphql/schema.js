const { buildSchema } = require("graphql");

module.exports = buildSchema(`
    type User {
        _id : ID
        name : String!
        email : String!
        password : String
        token : String
        createdAt : String
        updatedAt  : String
    }
    input UserLoginInputData {
        email : String!
        password : String!
    }
    input UserRegInputData {
        email : String!
        name  : String!
        password : String!
        confirmPassword : String!
    }
    type rootMutation {
       createUser (userRegInput : UserRegInputData) : User!
       loginUser (userLoginInput : UserLoginInputData) : User!
    }
    type rootQuery {
        hello : String
    }
    schema {
        query : rootQuery
        mutation : rootMutation
    }
`);
