const router = require('express').Router();
const axios = require('axios');
const { generateToken, checkToken } = require('../utils/auth');
const { User } = require('../models');

const apiRoutes = require('./api');
router.use('/api', apiRoutes);

router.get('*', checkToken, async (req, res) => {
  console.log(req.cookies)
  const { code, action } = req.query;
  const domain = req.get('host');
  const redirectURL =
    (/localhost/i.test(domain) ? 'http' : 'https')
    + '://' + req.get('host') + '/' +
    (/localhost/i.test(domain) ? process.env.APP_URL : '');
  const oauthURL = `https://discord.com/api/oauth2/authorize?client_id=1016791443739779072&redirect_uri=${encodeURIComponent(redirectURL)}&response_type=code&scope=identify`;

  try {
    if (req.userData && action === 'logout') {
      return res
        .clearCookie('__session')
        .redirect(redirectURL);
    }

    if (!req.userData && !code || req.query.error === 'access_denied') {
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
      console.log(data)
      const user = await axios.get('https://discord.com/api/users/@me', {
        headers: {
          authorization: `${data.token_type} ${data.access_token}`,
        },
      });
      const token = generateToken(user.data);

      const existingUser = await User.findById(user.data.id);
      if (!existingUser) await User.create({ _id: user.data.id })
      console.log((existingUser ? 'Existing' : 'New') + ' user has logged in')

      return res
        .set('Set-Cookie', `__session=${token}`)
        .setHeader('Cache-Control', 'private')
        .redirect(redirectURL);
    }

    const { id, username, avatar } = req.userData;
    const dbUser = await User.findById(id);
    const user = {
      ...dbUser,
      username,
      avatar: `https://cdn.discordapp.com/avatars/${id}/${avatar}`,
    }

    return res.render('dashboard', { user, loggedIn: true });
  } catch (err) {
    console.error(err.stack || err.response.data);
    if (err.response?.data?.error_description === 'Invalid "redirect_uri" in request.') console.info(redirectURL, oauthURL);
    return res.redirect(redirectURL);
  }
});

module.exports = router;