const dynamoose = require('./connection');

const UserSchema = new dynamoose.Schema({
  "id": {
    type: String,
    required: true
  },
})