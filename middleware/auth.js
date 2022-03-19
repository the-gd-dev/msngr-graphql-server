const jwt = require("jsonwebtoken");

exports.isAuthenticated = async (req, res, next) => {
  try {
    let jwtToken = req.headers["x-access-token"];
    let jwtVerified = await jwt.verify(jwtToken, process.env.JWT_SECRET);
    req.authUserId = jwtVerified && jwtVerified.userId ? jwtVerified.userId  : null;
  } catch (error) {
    req.authUserId = null;
  }
  next();
};
