const router = require('express').Router();
const { request } = require('undici');
require('dotenv');

router.get('/', async ({ query }, res) => {
  const { code } = query;
  console.log(code)

  if (code) {
    try {
      const tokenResponseData = await request('https://discord.com/api/oauth2/token', {
        method: 'POST',
        body: new URLSearchParams({
          client_id: process.env.DISCORD_CLIENT_ID,
          client_secret: process.env.DISCORD_CLIENT_SECRET,
          code,
          grant_type: 'authorization_code',
          redirect_uri: `http://localhost:3000`,
          scope: 'identify',
        }),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const oauthData = await tokenResponseData.body.json();
      console.log(oauthData);
    } catch (error) {
      // NOTE: An unauthorized token will not throw an error
      // tokenResponseData.statusCode will be 401
      console.error(error);
    }
  }
  res.render('index');
});

router.get('/login', (req, res) => {

});

router.get('*', (req, res) => res.redirect('/'));

module.exports = router;