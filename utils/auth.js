const jwt = require('jsonwebtoken');

const generateToken = (userId) => jwt.sign({ userId }, process.env.TOKEN_SECRET);

const authenticateToken = (req, res, next) => {
  const token = req.cookies.access_token;
  console.log(req.cookies)
  if (!token) {
    return res.sendStatus(403);
  }
  try {
    const data = jwt.verify(token, process.env.TOKEN_SECRET);
    req.userId = data.userId;
    return next();
  } catch {
    return res.sendStatus(403);
  }
}

module.exports = { generateToken, authenticateToken };