const router = require('express').Router();
const axios = require('axios');
const { generateToken, checkToken } = require('../utils/auth');
const { User } = require('../models');

const apiRoutes = require('./api');
router.use('/api', apiRoutes);

router.get('/', checkToken, async (req, res) => {
  const { code, action } = req.query;
  const redirectURL = req.protocol + '://' + req.get('host') + '/';
  const oauthURL =`https://discord.com/api/oauth2/authorize?client_id=1016791443739779072&redirect_uri=${encodeURIComponent(redirectURL)}&response_type=code&scope=identify`;

  try {
    if (req.userData && action === 'logout') {
      return res
        .clearCookie('access_token')
        .status(200)
        .redirect('/');
    }

    if (!req.userData && !code || req.query.error === 'access_denied') {
      console.info('Displaying login page');
      return res.render('index', { oauthURL, loggedIn: false });
    }

    if (!req.userData && code) {
      const tokenResponseData = await axios.post(
        'https://discord.com/api/oauth2/token',
        new URLSearchParams({
          client_id: process.env.DISCORD_CLIENT_ID,
          client_secret: process.env.DISCORD_CLIENT_SECRET,
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: redirectURL,
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
        .status(200)
        .redirect('/');
    }

    const { id, username, avatar } = req.userData;
    const dbUser = await User.get({ id });
    const user = {
      ...dbUser,
      username,
      avatar: `https://cdn.discordapp.com/avatars/${id}/${avatar}`,
    }

    console.info('Welcome', id)
    return res.render('dashboard', { user, loggedIn: true });
  } catch (err) {
    console.error(err.stack || err.response.data || err);
    if (err.response?.data?.error_description === 'Invalid "redirect_uri" in request.') console.info(redirectURL, oauthURL);
    return res.redirect('/');
  }
});

router.get('*', (req, res) => res.redirect('/'));

module.exports = router;