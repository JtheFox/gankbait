const pointIn = require('point-in-polygon');

const parseMatchData = ({ info }, summonerId) => {
  const teams = {
    blue: {
      win: false,
      participants: []
    },
    red: {
      win: false,
      participants: []
    }
  }

  const outcome = info.teams.find(({ teamId }) => teamId === 100).win;
  teams['blue'].win = outcome;
  teams['red'].win = !outcome;

  for (let p of info.participants) {
    const getPosition = ({ teamPosition }) => {
      switch (teamPosition) {
        case 'TOP': return [1, 'TOP'];
        case 'JUNGLE': return [2, 'JGL'];
        case 'MIDDLE': return [3, 'MID'];
        case 'BOTTOM': return [4, 'BOT'];
        case 'UTILITY':
        case 'SUPPORT':
        default: return [5, 'BOT'];
      }
    }

    const getKDA = ({ kills, assists, deaths }) => {
      const result = (kills + assists) / deaths;
      return result.toFixed(2);
    }

    const [pos, lane] = getPosition(p);

    const data = {
      summoner: p.summonerName,
      puuid: p.puuid,
      champion: p.championName,
      icon: `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${p.championId}.png`,
      kills: p.kills,
      deaths: p.deaths,
      assists: p.assists,
      kda: getKDA(p),
      pos,
      lane
    }

    if (p.summonerId === summonerId) data.searchOrigin = p.teamId === 100 ? 'blue' : 'red';

    const side = p.teamId === 100 ? 'blue' : 'red';
    teams[side].participants.push(data)
  }

  const compareRole = (a, b) => a.pos - b.pos;
  teams['blue'].participants.sort(compareRole);
  teams['red'].participants.sort(compareRole);

  return teams;
}

const parseTimelineData = ({ info }, teams) => {
  const lanesById = new Map();
  const allParticipants = [...teams['blue'].participants, ...teams['red'].participants];
  const origin = allParticipants.find(({ searchOrigin }) => searchOrigin);
  origin.participantId = info.participants.find(p => p.puuid === origin.puuid).participantId;
  allParticipants.forEach(({ puuid, lane }) => {
    const { participantId } = info.participants.find(p => p.puuid === puuid);
    lanesById.set(participantId, lane)
  });

  const coords = ({ position }) => [position.x, position.y];
  const botRef = [
    [7500, 0],
    [7500, 2500],
    [11000, 2500],
    [11000, 2500],
    [16000, 2500],
    [16000, 0]
  ];
  const topRef = [
    [0, 8000],
    [2000, 8000],
    [3750, 14000],
    [5000, 14000],
    [5000, 16000],
    [0, 16000]
  ]
  const midRef = [
    [5000, 6500],
    [9000, 12000],
    [12000, 9000],
    [6500, 5000]
  ]

  const zones = {
    blue: {
      'TOP': topRef,
      'MID': midRef,
      'BOT': botRef
    },
    red: {
      'TOP': botRef.map(c => c.map(p => 16000 - p)),
      'MID': midRef,
      'BOT': topRef.map(c => c.map(p => 16000 - p))
    }
  }

  const isGank = (kill) => {
    const { lane } = origin;
    const pos = coords(kill);
    const side = zones[origin.searchOrigin]
    const inLane = lane === 'JGL' ?
      pointIn(pos, side['TOP']) || pointIn(pos, side['MID']) || pointIn(pos, side['BOT']) :
      pointIn(pos, side[lane])
    const notLaneOpp = kp(kill).some(id => lanesById.get(id) !== origin.lane);
    return inLane && notLaneOpp;
  }

  const deathTeam = ({ victimId }) => victimId === origin.participantId ? 0 : 1;

  // Return array of all participantIds involved in the kill
  const kp = ({ killerId, victimId, assistingParticipantIds = [] }) => [killerId, victimId, ...assistingParticipantIds]

  // Frame interval = 60000 (1 minute)
  const timeLimit = (60000 * 15) + 1000;

  // Filter timeline into kills occuring in lane during laning phase (pre 15 min)
  const kills = info.frames
    .filter(({ timestamp }) => timestamp < timeLimit)
    .map(({ events }) => events)
    .map(evt => evt.filter(({ type }) => type === 'CHAMPION_KILL'))
    .filter(arr => arr.length > 0)
    .flat()
    .map(({ timestamp, position, killerId, victimId, assistingParticipantIds = [] }) =>
      ({ timestamp, position, killerId, victimId, assistingParticipantIds }))
    .filter(kill => kp(kill).includes(origin.participantId))
    .filter(kill => isGank(kill))
    .map(kill => deathTeam(kill))

  return {
    jungler: origin.lane === 'JGL',
    killsFromGanks: kills.filter(k => k === 1).length,
    deathsFromGanks: kills.filter(k => k === 0).length
  }
}

module.exports = { parseMatchData, parseTimelineData }