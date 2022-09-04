const router = require('express').Router();
const axios = require('axios');
const { authenticateToken } = require('../../utils/auth');
const { User } = require('../../models');

router.put('/summoner', authenticateToken, async ({ userData, body }, res) => {
  const { id } = userData;
  const { name, region } = body;

  try {
    const requestURL = `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${name}`;
    const response = await axios.get(requestURL, { headers: { 'X-Riot-Token': process.env.RIOT_API_KEY } });
    if (response.status === 404) return res.status(404);
    const { data } = response;
    await User.update({
      id,
      summonerName: data.name,
      summonerId: data.id,
      summonerPuuid: data.puuid,
      region
    });
    return res.status(200).json({ name: data.name });
  } catch (err) {
    console.error(err.stack);
    return res.status(404);
  }
});

module.exports = router;