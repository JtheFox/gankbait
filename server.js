const express = require('express');
const path = require('path');

const routes = require('./routes');
const app = express();
const port = process.env.PORT || 3000;

app.set('views', './views');
app.set('view engine', 'pug');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(routes);

app.listen(port, function () {
  console.log('Now listening at', process.env.NODE_ENV === 'production' ? `port ${port}` : `http://localhost:${port}`);
});