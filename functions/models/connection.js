const mongoose = require('mongoose');

mongoose.connect(process.env.DB_CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

module.exports = mongoose;