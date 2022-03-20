const User = require("../models/User");
const bcrypt = require("bcryptjs");
const userDataValidations = require("../validations/user");
const jwt = require("jsonwebtoken");
module.exports = {
  /**
   * Searching the user by name
   * @param {*} _
   * @param {*} param1
   */
  searchUsers: async function ({ query }, req) {
    return await User.find({
      name: { $regex: new RegExp("^" + query.toLowerCase(), "i") },
      _id: { $ne: req.authUserId },
    });
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
