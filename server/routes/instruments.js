const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { readJSON, writeJSON } = require('../utils/storage');

const router = express.Router();

router.get('/', (req, res) => {
  const instruments = readJSON('instruments.json', []);
  const users = readJSON('users.json', []);
  const { category, ownerId, status, keyword, city } = req.query;
  
  let result = instruments;
  
  if (category) {
    result = result.filter(i => i.category === category);
  }
  if (ownerId) {
    result = result.filter(i => i.ownerId === ownerId);
  }
  if (status) {
    result = result.filter(i => i.status === status);
  }
  if (city) {
    result = result.filter(i => i.location.includes(city));
  }
  if (keyword) {
    const kw = keyword.toLowerCase();
    result = result.filter(i => 
      i.name.toLowerCase().includes(kw) ||
      i.brand.toLowerCase().includes(kw) ||
      i.category.toLowerCase().includes(kw) ||
      i.description.toLowerCase().includes(kw)
    );
  }
  
  const resultWithOwner = result.map(inst => ({
    ...inst,
    owner: users.find(u => u.id === inst.ownerId) || null
  }));
  
  res.json(resultWithOwner);
});

router.get('/:id', (req, res) => {
  const instruments = readJSON('instruments.json', []);
  const users = readJSON('users.json', []);
  const instrument = instruments.find(i => i.id === req.params.id);
  
  if (!instrument) {
    return res.status(404).json({ error: '乐器不存在' });
  }
  
  const result = {
    ...instrument,
    owner: users.find(u => u.id === instrument.ownerId) || null
  };
  
  res.json(result);
});

router.post('/', (req, res) => {
  const instruments = readJSON('instruments.json', []);
  
  const newInstrument = {
    id: 'i' + uuidv4().slice(0, 8),
    ...req.body,
    status: 'available',
    createdAt: new Date().toISOString()
  };
  
  instruments.push(newInstrument);
  writeJSON('instruments.json', instruments);
  
  res.json({ success: true, instrument: newInstrument });
});

router.put('/:id', (req, res) => {
  const instruments = readJSON('instruments.json', []);
  const idx = instruments.findIndex(i => i.id === req.params.id);
  
  if (idx === -1) {
    return res.status(404).json({ error: '乐器不存在' });
  }
  
  instruments[idx] = { ...instruments[idx], ...req.body, id: instruments[idx].id };
  writeJSON('instruments.json', instruments);
  
  res.json({ success: true, instrument: instruments[idx] });
});

router.delete('/:id', (req, res) => {
  const instruments = readJSON('instruments.json', []);
  const filtered = instruments.filter(i => i.id !== req.params.id);
  
  if (filtered.length === instruments.length) {
    return res.status(404).json({ error: '乐器不存在' });
  }
  
  writeJSON('instruments.json', filtered);
  res.json({ success: true });
});

module.exports = router;
