const router = require('express').Router();
const axios = require('axios');
const { generateToken, authenticateToken } = require('../utils/auth');

router.get('/', async (req, res) => {
  res.render('index');
});

router.get('/login', async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) return res.sendStatus(401)

    const tokenResponseData = await axios.post(
      'https://discord.com/api/oauth2/token',
      new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: `http://localhost:3000/login`,
        scope: 'identify',
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    );

    const { data } = tokenResponseData;
    const user = await axios.get('https://discord.com/api/users/@me', {
      headers: {
        authorization: `${data.token_type} ${data.access_token}`,
      },
    });

    const token = generateToken(user.data);

    return res
      .cookie('access_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      })
      .redirect('/')
  } catch (err) {
    console.error(err.stack);
    return res.status(500).json({ message: 'An internal server error occurred' });
  }
});

router.get('/logout', authenticateToken, (req, res) => {
  return res
    .clearCookie('access_token')
    .status(200)
    .json({ message: 'Successfully logged out' });
});

router.get('/games', authenticateToken, (req, res) => {
  console.log(req.userData);
  res.sendStatus(200)
});

router.get('*', (req, res) => res.redirect('/'));

module.exports = router;