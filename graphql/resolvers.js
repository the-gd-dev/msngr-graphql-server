const User = require("../models/User");
const bcrypt = require("bcryptjs");
const userDataValidations = require("../validations/user");
const jwt = require("jsonwebtoken");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
module.exports = {
  /**
   * create a new message
   * @param {*} param0
   * @param {*} req
   */
  createMessage: async function ({ messageInput }, req) {
    try {
      let { text, image, sender, reciever, replyingMsg } = messageInput;
      //find conversation if exist
      let convo = await Conversation.findOne({
        participents: { $all: [sender, reciever] },
      });
      if (!convo) {
        //create conversation if not exist
        convo = await Conversation.create({
          participents: [sender, reciever],
        });
      }
      //create new message
      let message = await Message.create({
        conversationId: convo._id,
        senderId: sender,
        text: text,
        image: "",
        reaction: "",
        replyToMessage: replyingMsg,
      });

      //update conversation's last time.
      await Conversation.findById(convo._id).updateOne({
        lastMessage: message._id,
      });

      //update conversationIds to User
      let senderUser = await User.findById(sender);
      let receiverUser = await User.findById(reciever);
      if (senderUser) {
        if (!senderUser._doc.conversations.includes(convo._id)) {
          let conversationsUpdated = [
            ...senderUser._doc.conversations,
            convo._id,
          ];
          await User.findById(sender).updateOne({
            conversations: conversationsUpdated,
          });
        }
      }
      if (receiverUser) {
        if (!receiverUser._doc.conversations.includes(convo._id)) {
          let conversationsUpdated = [
            ...receiverUser._doc.conversations,
            convo._id,
          ];
          await User.findById(reciever).updateOne({
            conversations: conversationsUpdated,
          });
        }
      }

      //return created message
      let newMessage = await Message.findById(message._id)
        .populate("replyToMessage")
        .exec();
      return {
        ...newMessage._doc,
        _id: newMessage._doc._id.toString(),
        createdAt: newMessage._doc.createdAt.toISOString(),
        updatedAt: newMessage._doc.updatedAt.toISOString(),
      };
    } catch (error) {
      throw error;
    }
  },
  /**
   * delete a new message
   * @param {*} param0
   * @param {*} req
   */
  deleteMessage: async function ({ messageId }, req) {
    let messageFound = await Message.findById(messageId);
    await messageFound.deleteOne();
    return {
      ...messageFound._doc,
      createdAt: messageFound._doc.createdAt.toISOString(),
    };
  },
  /**
   * Searching the user by name
   * @param {*} _
   * @param {*} param0
   */
  searchUsers: async function ({ query }, req) {
    return await User.find({
      name: { $regex: new RegExp("^" + query.toLowerCase(), "i") },
      _id: { $ne: req.authUserId },
    });
  },
  /**
   * get logged in user conversations
   * @param {*} data
   * @param {*} req
   * @returns
   */
  getConversations: async function (data, req) {
    return await Conversation.find({
      participents: {
        $in: [req.authUserId],
      },
    })
      .populate("lastMessage")
      .populate("participents")
      .exec();
  },
  /**
   * get logged in user conversations
   * @param {*} data
   * @param {*} req
   * @returns
   */
  deleteConversations: async function ({ conversationId }, req) {},
  /**
   * fetch messages for given convesation
   * @param {*} param0
   * @param {*} req
   */
  getMessages: async function ({ conversationId }, req) {
    const msgs = await Message.find({
      conversationId: conversationId,
      deletedBy: { $nin: [req.authUserId] },
    })
      .populate("conversationId")
      .sort({ createdAt: 1 });

    let messages = msgs.map((m) => {
      return {
        ...m._doc,
        createdAt: m._doc.createdAt.toISOString(),
      };
    });
    return messages;
  },
  /**
   * return jwt verified user
   * @param {*} data
   * @param {*} req
   */
  jwtUser: async function (data, req) {
    try {
      if (!req.authUserId) {
        let error = new Error("User Authentication Failed.");
        error.code = 401;
        throw error;
      }
      let authenticatedUser = await User.findOne({ _id: req.authUserId });
      if (!authenticatedUser) {
        let error = new Error("Authenticated User Not Found.");
        error.code = 404;
        throw error;
      }
      return {
        ...authenticatedUser._doc,
        _id: authenticatedUser._doc._id.toString(),
        createdAt: authenticatedUser._doc.createdAt.toISOString(),
        updatedAt: authenticatedUser._doc.updatedAt.toISOString(),
      };
    } catch (error) {
      throw error;
    }
  },
  /**
   *
   * @param {*} { userInput }
   * @param {*} req
   */
  loginUser: async function ({ userLoginInput }, req) {
    try {
      //validate user input
      const { email, password, rememberMe } = userLoginInput;
      const errors = userDataValidations({ email, password });
      const isErrors = Object.keys(errors).length === 0;
      if (!isErrors) {
        let error = new Error("Invalid Inputs.");
        error.data = errors;
        error.code = 422;
        throw error;
      }
      //user existence

      let userExist = await User.findOne({ email: email });
      if (!userExist) {
        let error = new Error("User Does Not Exist.");
        error.data = {
          email: ["User not exists to the provided email."],
        };
        error.code = 404;
        throw error;
      }
      let isValidPassword = await bcrypt.compare(password, userExist.password);
      //match password
      if (!isValidPassword) {
        let error = new Error("User Credentials Invalid.");
        error.data = {
          email: ["Password and Email combination not matched."],
        };
        error.code = 401;
        throw error;
      }
      let userId = userExist._doc._id.toString();
      const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: rememberMe ? "360h" : "2h",
      });
      return {
        token: token,
        ...userExist._doc,
        _id: userExist._doc._id.toString(),
        createdAt: userExist._doc.createdAt.toISOString(),
        updatedAt: userExist._doc.updatedAt.toISOString(),
      };
    } catch (error) {
      throw error;
    }
  },
  /**
   * Create User Resolver
   * @param {*} {userInput}
   * @param {*} req
   * @returns
   */
  createUser: async function ({ userRegInput }, req) {
    try {
      const { name, email, password, confirmPassword } = userRegInput;
      const errors = userDataValidations({
        name,
        email,
        password,
        confirmPassword,
      });
      const isErrors = Object.keys(errors).length === 0;

      if (!isErrors) {
        let error = new Error("Invalid Inputs.");
        error.data = errors;
        error.code = 422;
        throw error;
      }
      let hashedPassword = await bcrypt.hash(password, 16);
      let userExist = await User.findOne({ email: email });
      if (userExist) {
        let error = new Error("User Already Exists. Please login.");
        error.data = {
          email: ["User Already Exists. Please login."],
        };
        error.code = 409;
        throw error;
      }
      let user = new User({
        name,
        email,
        password: hashedPassword,
      });
      const createdUser = await user.save();
      const userId = createdUser._id.toString();
      return {
        ...createdUser._doc,
        _id: userId,
        createdAt: createdUser._doc.createdAt.toISOString(),
        createdAt: createdUser._doc.createdAt.toISOString(),
      };
    } catch (error) {
      throw error;
    }
  },
};
