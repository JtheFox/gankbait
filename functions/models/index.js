const mongoose = require('./connection');

const StatsSchema = new mongoose.Schema({
  "games": Number,
  "killsFromGanks": Number,
  "deathsFromGanks": Number
})

const UserSchema = new mongoose.Schema({
  "_id": {
    type: String,
    required: true
  },
  "summonerName": String,
  "summonerId": String,
  "summonerPuuid": String,
  "region": String,
  "queue": String,
  "stats": {
    "summonerName": String,
    "lane": StatsSchema,
    "jungle": StatsSchema
  }
});

const User = mongoose.model("GbUser", UserSchema);

module.exports = { User };

