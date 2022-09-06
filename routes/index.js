const router = require('express').Router();
const axios = require('axios');
const { generateToken, authenticateToken, checkToken } = require('../utils/auth');
const { User } = require('../models');

const apiRoutes = require('./api');
router.use('/api', apiRoutes);

router.get('/', checkToken, async (req, res) => {
  const oauthURL = process.env.NODE_ENV === 'production' ?
    'https://discord.com/api/oauth2/authorize?client_id=1016791443739779072&redirect_uri=https%3A%2F%2Fgankbait.jthefox.com%2Flogin&response_type=code&scope=identify ' :
    'https://discord.com/api/oauth2/authorize?client_id=1016791443739779072&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Flogin&response_type=code&scope=identify'
  if (!req.userData) return res.render('index', { oauthURL, loggedIn: false });
  const { id, username, avatar } = req.userData;
  const dbUser = await User.get({ id });
  const user = {
    ...dbUser,
    username,
    avatar: `https://cdn.discordapp.com/avatars/${id}/${avatar}`,
  }
  return res.render('dashboard', { user, loggedIn: true });
});

router.get('/login', checkToken, async (req, res) => {
  if (req.userData) return res.redirect('/')

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
        redirect_uri: process.env.NODE_ENV === 'production' ? `https://gankbait.jthefox.com/login` : 'http://localhost:3000/login',
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
    console.error(err.stack || err);
    return res.status(500).json({ message: 'An internal server error occurred' });
  }
});

router.get('/logout', authenticateToken, (req, res) => {
  return res
    .clearCookie('access_token')
    .status(200)
    .redirect('/')
});

router.get('*', (req, res) => res.redirect('/'));

module.exports = router;