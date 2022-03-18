const User = require("../models/User");
const bcrypt = require("bcryptjs");
const userDataValidations = require("../validations/user");
const jwt = require("jsonwebtoken");
module.exports = {
  hello() {
    return "hello world";
  },
  /**
   *
   * @param {*} { userInput }
   * @param {*} req
   */
  loginUser: async function ({ userLoginInput }, req) {
    try {
      //validate user input
      const { email, password } = userLoginInput;
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
            email : ['User not exists to the provided email.']
        };
        error.code = 404;
        throw error;
      }
      let isValidPassword = await bcrypt.compare(password, userExist.password);
      //match password
      if (!isValidPassword) {
        let error = new Error("User Credentials Invalid.");
        error.data = {
            email : ['Password and Email combination not matched.']
        };
        error.code = 401;
        throw error;
      }
      const token = jwt.sign(
        { userId: userExist._id },
        process.env.JWT_SECRET,
        {
          expiresIn: "2h",
        }
      );
      return {
        token: token,
        ...userExist._doc,
        _id: userExist._doc._id.toString(),
        createdAt: userExist._doc.createdAt.toISOString(),
        createdAt: userExist._doc.createdAt.toISOString(),
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
