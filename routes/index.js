const router = require('express').Router();

router.get('/', (req, res) => {
  res.render('index');
});

router.get('/login', (req, res) => {
  
});

router.get('*', (req, res) => res.redirect('/'));

module.exports = router;