var validator = require("validator");
/**
 * User Input Validations
 * @param {*} data
 * @returns
 */
module.exports = function userRules(data) {
  let errors = {};
  //name validations
  if (data.hasOwnProperty("name")) {
    errors.name = [];
    if (validator.isEmpty(data.name, { ignore_whitespace: false })) {
      errors.name.push("Name is required.");
    }
    if (data.name && data.name.length < 4) {
      errors.name.push("Name is too short.");
    }
  }
  //email validations
  if (data.hasOwnProperty("email")) {
    errors.email = [];
    if (validator.isEmpty(data.email, { ignore_whitespace: false })) {
      errors.email.push("Email is required.");
    }
    if (!validator.isEmail(data.email)) {
      errors.email.push("Email is invalid.");
    }
  }
  //password validations
  if (data.hasOwnProperty("password")) {
    errors.password = [];
    if (validator.isEmpty(data.password, { ignore_whitespace: false })) {
      errors.password.push("Password is required.");
    }
    if (data.password && data.password.length < 6) {
      errors.password.push("Password is too short.");
    }
  }
  if (data.password && data.confirmPassword) {
    errors.password = [];
    if (data.password !== data.confirmPassword) {
      errors.password.push("Password and Password confirmation not matched.");
    }
  }
  //confirmPassword validations
  if (data.hasOwnProperty("confirmPassword")) {
    errors.confirmPassword = [];
    if (validator.isEmpty(data.confirmPassword, { ignore_whitespace: false })) {
      errors.confirmPassword.push("Password Confirmation is required.");
    }
  }
  //clear errors if nothing there.
  if (errors.name && errors.name.length === 0) delete errors.name;
  if (errors.email && errors.email.length === 0) delete errors.email;
  if (errors.password && errors.password.length === 0) delete errors.password;
  if (errors.confirmPassword && errors.confirmPassword.length === 0) delete errors.confirmPassword;
  //return  bundle of errors
  return errors;
};
