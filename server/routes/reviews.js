const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { readJSON, writeJSON } = require('../utils/storage');

const router = express.Router();

router.get('/', (req, res) => {
  const reviews = readJSON('reviews.json', []);
  const users = readJSON('users.json', []);
  const { reviewerId, revieweeId, targetType, targetId } = req.query;
  
  let result = reviews;
  
  if (reviewerId) {
    result = result.filter(r => r.reviewerId === reviewerId);
  }
  if (revieweeId) {
    result = result.filter(r => r.revieweeId === revieweeId);
  }
  if (targetType) {
    result = result.filter(r => r.targetType === targetType);
  }
  if (targetId) {
    result = result.filter(r => r.targetId === targetId);
  }
  
  result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  const enriched = result.map(r => ({
    ...r,
    reviewer: users.find(u => u.id === r.reviewerId) || null,
    reviewee: users.find(u => u.id === r.revieweeId) || null
  }));
  
  res.json(enriched);
});

router.get('/check', (req, res) => {
  const reviews = readJSON('reviews.json', []);
  const { reviewerId, targetType, targetId } = req.query;
  
  const exists = reviews.some(r => 
    r.reviewerId === reviewerId &&
    r.targetType === targetType &&
    r.targetId === targetId
  );
  
  res.json({ reviewed: exists });
});

router.post('/', (req, res) => {
  const reviews = readJSON('reviews.json', []);
  const users = readJSON('users.json', []);
  const { reviewerId, targetType, targetId } = req.body;
  
  const exists = reviews.some(r => 
    r.reviewerId === reviewerId &&
    r.targetType === targetType &&
    r.targetId === targetId
  );
  
  if (exists) {
    return res.status(400).json({ 
      success: false, 
      error: '您已对此进行过评价，不能重复评价' 
    });
  }
  
  const newReview = {
    id: 'r' + uuidv4().slice(0, 8),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  
  reviews.push(newReview);
  writeJSON('reviews.json', reviews);
  
  const userIdx = users.findIndex(u => u.id === newReview.revieweeId);
  if (userIdx !== -1) {
    const userReviews = reviews.filter(r => r.revieweeId === newReview.revieweeId);
    const avgRating = userReviews.length > 0 
      ? userReviews.reduce((sum, r) => sum + (r.rating || 5), 0) / userReviews.length
      : 5.0;
    users[userIdx].rating = Math.round(avgRating * 10) / 10;
    users[userIdx].reviewCount = userReviews.length;
    writeJSON('users.json', users);
  }
  
  res.json({ success: true, review: newReview });
});

module.exports = router;
