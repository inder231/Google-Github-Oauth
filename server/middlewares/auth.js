const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
/// protected route => this middleware will run
// we don't have the accesskey from google
// how to check
// Two the two ways
// 1. use user details from profile(google) => new jwt token (your own key);
// 2. use accessTOken provided by google to access google resources like user profile
        // if we are able to get the data from google 
        // it the token valid or invalid => valid
const authenticate = async (req, res, next) => {
  try {
    const accessToken = req.headers.authorization.split(" ")[1];

    const isTokenValid = jwt.verify(accessToken, process.env.JWT_ACCESS_KEY);
    if (!isTokenValid) throw new Error("Unauthorized access token");

    req.userId = isTokenValid.userId;
    req.email = isTokenValid.email;
    next();
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};
module.exports = {authenticate};