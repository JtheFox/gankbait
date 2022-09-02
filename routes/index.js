const router = require('express').Router();
const axios = require('axios');
require('dotenv');

router.get('/', async (req, res) => {
  res.render('index');
});

router.get('/login', async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) return res.status(401).json({ message: "Invalid authorization" });

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
    const userResult = await axios.get('https://discord.com/api/users/@me', {
      headers: {
        authorization: `${data.token_type} ${data.access_token}`,
      },
    });

    console.log(userResult.data);

    return res.redirect('/');
  } catch (err) {
    // NOTE: An unauthorized token will not throw an error
    // tokenResponseData.statusCode will be 401
    console.error(err.stack);
    return res.status(500).json({ message: "An internal server error occurred" });
  }
});

router.get('*', (req, res) => res.redirect('/'));

module.exports = router;