const router = require('express').Router();
const axios = require('axios');
const { generateToken, authenticateToken, checkToken } = require('../utils/auth');
const { User } = require('../models');

router.get('/', checkToken, async (req, res) => {
  if (!req.userData) return res.render('index', { loggedIn: false });
  const { id, username, avatar } = req.userData;
  const user = {
    id,
    username,
    avatar: `https://cdn.discordapp.com/avatars/${id}/${avatar}`
  }
  return res.render('index', { user, loggedIn: true });
});

router.get('/login', checkToken, async (req, res) => {
  if (req.userData) return res.redirect('/dashboard')

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

    try {
      await User.create({ "id": user.data.id });
      console.log('New user has logged in');
    } catch {
      console.log('Existing user has logged in');
    }

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
    .redirect('/')
});

router.get('/dashboard', authenticateToken, (req, res) => {
  console.log(req.userData);
  return res.sendStatus(200)
});

router.get('*', (req, res) => res.redirect('/'));

module.exports = router;