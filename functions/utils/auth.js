const jwt = require('jsonwebtoken');

const generateToken = ({ id, username, avatar }) => jwt.sign({ id, username, avatar }, process.env.TOKEN_SECRET);

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

const checkToken = (req, res, next) => {
  const token = req.cookies.access_token;
  if (token) {
    try {
      req.userData = jwt.verify(token, process.env.TOKEN_SECRET);
    } catch (err) {
      console.error(err)
    }
  }
  return next();
}

module.exports = { generateToken, authenticateToken, checkToken };