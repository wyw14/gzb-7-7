const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { readJSON, writeJSON } = require('../utils/storage');

const router = express.Router();

router.get('/', (req, res) => {
  const checkins = readJSON('checkins.json', []);
  const users = readJSON('users.json', []);
  const { userId, instrument } = req.query;
  
  let result = checkins;
  
  if (userId) {
    result = result.filter(c => c.userId === userId);
  }
  if (instrument) {
    result = result.filter(c => c.instrument === instrument);
  }
  
  result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  const enriched = result.map(c => ({
    ...c,
    user: users.find(u => u.id === c.userId) || null
  }));
  
  res.json(enriched);
});

router.get('/stats/:userId', (req, res) => {
  const checkins = readJSON('checkins.json', []);
  const { userId } = req.params;
  
  const userCheckins = checkins.filter(c => c.userId === userId);
  const totalMinutes = userCheckins.reduce((sum, c) => sum + (c.duration || 0), 0);
  const totalCount = userCheckins.length;
  
  const instrumentStats = {};
  userCheckins.forEach(c => {
    if (!instrumentStats[c.instrument]) {
      instrumentStats[c.instrument] = { count: 0, minutes: 0 };
    }
    instrumentStats[c.instrument].count += 1;
    instrumentStats[c.instrument].minutes += c.duration || 0;
  });
  
  const streak = calculateStreak(userCheckins);
  
  res.json({
    userId,
    totalCount,
    totalMinutes,
    totalHours: Math.round(totalMinutes / 60 * 10) / 10,
    instrumentStats,
    currentStreak: streak
  });
});

function calculateStreak(checkins) {
  if (checkins.length === 0) return 0;
  
  const dates = new Set(
    checkins.map(c => new Date(c.createdAt).toDateString())
  );
  
  let streak = 0;
  let today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);
    if (dates.has(checkDate.toDateString())) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  
  return streak;
}

router.post('/', (req, res) => {
  const checkins = readJSON('checkins.json', []);
  
  const newCheckin = {
    id: 'c' + uuidv4().slice(0, 8),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  
  checkins.push(newCheckin);
  writeJSON('checkins.json', checkins);
  
  res.json({ success: true, checkin: newCheckin });
});

module.exports = router;
