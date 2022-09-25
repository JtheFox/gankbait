require('dotenv').config();
const functions = require("firebase-functions");
const express = require('express');
const cookieParser = require('cookie-parser');

const routes = require('./routes');
const app = express();

app.set('views', './views');
app.set('view engine', 'pug');

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(routes);

exports.app = functions.https.onRequest(app);