const axios = require('axios');
const cdn = 'http://ddragon.leagueoflegends.com/cdn/';

const version = async () => {
  let version = process.env.DDRAGON_LATEST_VERSION;
  if (version) return version;
  const res = await axios('https://ddragon.leagueoflegends.com/api/versions.json');
  return process.env.DDRAGON_LATEST_VERSION = res.data[0];
}

const getChampionId = async (key) => {
  const v = await version();
  const err = new TypeError('Invalid champion identifier');

  let type;
  if (typeof key === 'string') type = 'name';
  else if (typeof key === 'number') type = 'key';
  else throw err;

  const res = await axios(cdn + v + '/data/en_US/champion.json');
  const champions = Object.values(res.data.data)
  const { id } = champions.find(c => new RegExp(key, 'i').test(c[type]));

  if (!id) throw err;
  return id;
}

const getChampionAvatar = async (key, type) => {
  const v = await version();
  const id = type === 'id' ? key : await getChampionId(key);
  return cdn + v + '/img/champion/' + id + '.png';
}

module.exports = { version, getChampionId, getChampionAvatar }