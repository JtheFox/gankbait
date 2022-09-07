const dynamoose = require('./connection');

const StatsSchema = new dynamoose.Schema({
  "games": Number,
  "killsFromGanks": Number,
  "deathsFromGanks": Number
})

const UserSchema = new dynamoose.Schema({
  "id": {
    type: String,
    required: true
  },
  "summonerName": String,
  "summonerId": String,
  "summonerPuuid": String,
  "region": String,
  "stats": {
    type: Object,
    schema: {
      "summonerName": String,
      "lane": {
        type: Object,
        schema: StatsSchema
      },
      "jungle": {
        type: Object,
        schema: StatsSchema
      }
    }
  }
});

const User = dynamoose.model("GbUser", UserSchema);

module.exports = { User };

