const { buildSchema } = require("graphql");

module.exports = buildSchema(`
    type User {
        _id : ID
        name : String!
        email : String!
        password : String
        token : String
        profilePicture : String
        createdAt : String
        updatedAt  : String
    }
    input UserLoginInputData {
        email : String!
        password : String!
        rememberMe : Boolean
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
        searchUsers(query : String) : [User]
        jwtUser : User!
    }
    schema {
        query : rootQuery
        mutation : rootMutation
    }
`);
