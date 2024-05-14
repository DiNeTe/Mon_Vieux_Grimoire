const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  console.log("Received request with Authorization header:", req.headers.authorization);
  try {
    const token = req.headers.authorization.split(" ")[1];
    console.log("Token extracted:", token);
    const decodedToken = jwt.verify(token, "RANDOM_TOKEN_SECRET");
    console.log("Token decoded:", decodedToken);
    const userId = decodedToken.userId;

    req.auth = {
      userId: userId
    };
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ error});
  }
};
