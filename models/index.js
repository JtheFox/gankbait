const dynamoose = require('./connection');

const UserSchema = new dynamoose.Schema({
  "id": {
    type: String,
    required: true
  },
  "summonerName": String,
  "summonerId": String,
});

const User = dynamoose.model("GbUser", UserSchema);

module.exports = { User };

