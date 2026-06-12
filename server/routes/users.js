const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { readJSON, writeJSON } = require('../utils/storage');

const router = express.Router();

router.get('/', (req, res) => {
  const users = readJSON('users.json', []);
  const { skillLevel, instrument, city, keyword } = req.query;
  
  let result = users;
  
  if (skillLevel) {
    result = result.filter(u => u.skillLevel === skillLevel);
  }
  if (instrument) {
    result = result.filter(u => u.instruments.includes(instrument));
  }
  if (city) {
    result = result.filter(u => u.city.includes(city));
  }
  if (keyword) {
    const kw = keyword.toLowerCase();
    result = result.filter(u => 
      u.username.toLowerCase().includes(kw) ||
      u.bio.toLowerCase().includes(kw) ||
      u.instruments.some(i => i.toLowerCase().includes(kw))
    );
  }
  
  res.json(result);
});

router.get('/:id', (req, res) => {
  const users = readJSON('users.json', []);
  const user = users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: '用户不存在' });
  }
  res.json(user);
});

router.post('/login', (req, res) => {
  const { username, phone } = req.body;
  const users = readJSON('users.json', []);
  
  let user = users.find(u => u.phone === phone);
  
  if (!user) {
    user = {
      id: 'u' + uuidv4().slice(0, 8),
      username: username || '音乐爱好者' + Math.floor(Math.random() * 1000),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${uuidv4().slice(0, 6)}`,
      phone: phone || '138' + Math.floor(Math.random() * 100000000),
      city: '北京市',
      district: '海淀区',
      latitude: 39.9042,
      longitude: 116.4074,
      bio: '这个人很懒，什么都没留下...',
      skillLevel: '初级',
      instruments: [],
      favoritePieces: [],
      freeTimes: [],
      rating: 5.0,
      reviewCount: 0,
      createdAt: new Date().toISOString()
    };
    users.push(user);
    writeJSON('users.json', users);
  }
  
  res.json({ success: true, user });
});

router.put('/:id', (req, res) => {
  const users = readJSON('users.json', []);
  const idx = users.findIndex(u => u.id === req.params.id);
  
  if (idx === -1) {
    return res.status(404).json({ error: '用户不存在' });
  }
  
  users[idx] = { ...users[idx], ...req.body, id: users[idx].id };
  writeJSON('users.json', users);
  
  res.json({ success: true, user: users[idx] });
});

module.exports = router;
