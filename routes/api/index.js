const router = require('express').Router();
const { authenticateToken } = require('../../utils/auth');
const { User } = require('../../models');

router.post('/summoner', authenticateToken, async ({ userData, body }, res) => {
  const { id } = userData;
  const { name } = body;

  return res.status(200);
});

module.exports = router;