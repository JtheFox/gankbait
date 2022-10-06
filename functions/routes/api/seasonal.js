const router = require('express').Router();

router.post('/', ({ body }, res) => {
  const { key, region, matchIds } = body;
  if (!(key && region && matchIds?.length)) return res.sendStatus(400)
  else res.send('hi')
})

module.exports = router;