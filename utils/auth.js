const jwt = require('jsonwebtoken');

const generateToken = ({ userId, username, avatar }) => jwt.sign({ userId, username, avatar }, process.env.TOKEN_SECRET);

const authenticateToken = (req, res, next) => {
  const token = req.cookies.access_token;
  if (!token) {
    return res.status(403);
  }
  try {
    req.userData = jwt.verify(token, process.env.TOKEN_SECRET);
    return next();
  } catch {
    return res.status(403);
  }
}

module.exports = { generateToken, authenticateToken };