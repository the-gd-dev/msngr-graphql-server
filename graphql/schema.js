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
    type Message {
        _id : ID
        text : String
        image : String
        reaction : String
        createdAt : String
        updatedAt  : String
    }
    type Conversation {
        _id : ID
        participents : [User!]
        unread : Boolean!
        lastMessage : Message!
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
    input messageInputData {
        conversationId : String
        text : String
        image  : String
        sender : String!
        reciever : String!
    }
    type rootMutation {
       createMessage (messageInput : messageInputData) : Message! 
       createUser (userRegInput : UserRegInputData) : User!
       loginUser (userLoginInput : UserLoginInputData) : User!
    }
    type rootQuery {
        searchUsers(query : String) : [User]
        jwtUser : User!
        getConversations : [Conversation]
    }
    schema {
        query : rootQuery
        mutation : rootMutation
    }
`);
