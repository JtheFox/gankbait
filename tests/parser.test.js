const { parseMatchData, parseTimelineData } = require('../utils/parser');
const { compareShallowObjects } = require('../utils/helpers');
const matchData = require('./exampleData/matchData');
const timelineData = require('./exampleData/timelineData');
const summonerId = 'LxX5R76anqiiD9zGBEJtd2Lzgg2IQUFWu6XAz6CaRE6L7ro';
let parsedMatch;

test('parses match data from Riot Match-v5 API', () => {
  parsedMatch = parseMatchData(matchData, summonerId);
  const { blue, red } = parsedMatch;
  expect(blue.win).toBe(true);
  expect(red.win).toBe(false);
  expect(blue.participants.length).toBe(5);
  expect(red.participants.length).toBe(5);
  const origin = [...blue.participants, ...red.participants].find(s => s.searchOrigin);
  const expected = {
    "summoner": "TiddyBongo",
    "puuid": "HaRBje9KHYHSixzs9louvCODlRS0GsR0QChK2vChlTrbLVt-SEKC1Ksy3FhW6msgPco24YBmbxJqxw",
    "champion": "Aphelios",
    "icon": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/523.png",
    "kills": 5,
    "deaths": 15,
    "assists": 13,
    "kda": "1.20",
    "pos": 4,
    "lane": "BOT",
    "searchOrigin": "red"
  }
  expect(compareShallowObjects(origin, expected)).toBe(true);
});

test('parses match timeline data from Riot Match-v5 API', () => {
  const parsedTimeline = parseTimelineData(timelineData, parsedMatch);
  const expected = {
    "jungler": false,
    "killsFromGanks": 1,
    "deathsFromGanks": 1
  }
  expect(compareShallowObjects(parsedTimeline, expected)).toBe(true);
});
