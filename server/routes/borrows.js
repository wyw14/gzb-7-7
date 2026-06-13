const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { readJSON, writeJSON } = require('../utils/storage');

const router = express.Router();

const buildFeeDetail = (borrow, instrument) => {
  if (borrow.feeDetail) return borrow.feeDetail;
  
  const deposit = borrow.depositPaid || (instrument ? instrument.deposit : 0);
  const dailyFee = instrument ? instrument.dailyFee : 0;
  let borrowDays = 0;
  if (borrow.startDate && borrow.endDate) {
    const s = new Date(borrow.startDate);
    const e = new Date(borrow.endDate);
    borrowDays = Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1;
  }
  const feeTotal = borrow.feeTotal != null ? borrow.feeTotal : borrowDays * dailyFee;
  const estimatedTotal = deposit + feeTotal;
  
  let returnedAmount = 0;
  if (borrow.status === 'returned') {
    returnedAmount = deposit;
  }
  
  let feeNote = '押金在归还完好后退还；租金按实际借用天数结算';
  if (borrow.status === 'returned') {
    feeNote = '乐器已完好归还，押金已退还';
  }
  
  return {
    deposit,
    dailyFee,
    borrowDays,
    estimatedTotal,
    returnedAmount,
    feeNote
  };
};

router.get('/', (req, res) => {
  const borrows = readJSON('borrows.json', []);
  const instruments = readJSON('instruments.json', []);
  const users = readJSON('users.json', []);
  const reviews = readJSON('reviews.json', []);
  const { borrowerId, ownerId, status, currentUserId } = req.query;
  
  let result = borrows;
  
  if (borrowerId) {
    result = result.filter(b => b.borrowerId === borrowerId);
  }
  if (ownerId) {
    result = result.filter(b => b.ownerId === ownerId);
  }
  if (status) {
    result = result.filter(b => b.status === status);
  }
  
  const enriched = result.map(b => {
    const borrowerReviewed = reviews.some(r => 
      r.targetType === 'borrow' && 
      r.targetId === b.id && 
      r.reviewerId === b.borrowerId
    );
    const ownerReviewed = reviews.some(r => 
      r.targetType === 'borrow' && 
      r.targetId === b.id && 
      r.reviewerId === b.ownerId
    );
    
    let myReviewed = false;
    let canReviewOther = false;
    if (currentUserId) {
      if (currentUserId === b.borrowerId) {
        myReviewed = borrowerReviewed;
        canReviewOther = b.status === 'returned' && !borrowerReviewed;
      } else if (currentUserId === b.ownerId) {
        myReviewed = ownerReviewed;
        canReviewOther = b.status === 'returned' && !ownerReviewed;
      }
    }
    
    const inst = instruments.find(i => i.id === b.instrumentId) || null;
    const feeDetail = buildFeeDetail(b, inst);
    
    return {
      ...b,
      feeDetail,
      borrowerReviewed,
      ownerReviewed,
      myReviewed,
      canReviewOther,
      instrument: inst,
      borrower: users.find(u => u.id === b.borrowerId) || null,
      owner: users.find(u => u.id === b.ownerId) || null
    };
  });
  
  res.json(enriched);
});

router.get('/:id', (req, res) => {
  const borrows = readJSON('borrows.json', []);
  const instruments = readJSON('instruments.json', []);
  const users = readJSON('users.json', []);
  const borrow = borrows.find(b => b.id === req.params.id);
  
  if (!borrow) {
    return res.status(404).json({ error: '借用记录不存在' });
  }
  
  const inst = instruments.find(i => i.id === borrow.instrumentId) || null;
  const feeDetail = buildFeeDetail(borrow, inst);
  
  const result = {
    ...borrow,
    feeDetail,
    instrument: inst,
    borrower: users.find(u => u.id === borrow.borrowerId) || null,
    owner: users.find(u => u.id === borrow.ownerId) || null
  };
  
  res.json(result);
});

router.post('/', (req, res) => {
  const borrows = readJSON('borrows.json', []);
  const instruments = readJSON('instruments.json', []);
  
  const inst = instruments.find(i => i.id === req.body.instrumentId);
  const deposit = inst ? inst.deposit : (req.body.depositPaid || 0);
  const dailyFee = inst ? inst.dailyFee : 0;
  const startDate = req.body.startDate;
  const endDate = req.body.endDate;
  let borrowDays = 0;
  if (startDate && endDate) {
    const s = new Date(startDate);
    const e = new Date(endDate);
    borrowDays = Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1;
  }
  const feeTotal = borrowDays * dailyFee;
  const estimatedTotal = deposit + feeTotal;
  
  const feeDetail = {
    deposit,
    dailyFee,
    borrowDays,
    estimatedTotal,
    returnedAmount: 0,
    feeNote: req.body.feeNote || '押金在归还完好后退还；租金按实际借用天数结算'
  };
  
  const newBorrow = {
    id: 'b' + uuidv4().slice(0, 8),
    ...req.body,
    depositPaid: deposit,
    feeTotal,
    feeDetail,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  borrows.push(newBorrow);
  writeJSON('borrows.json', borrows);
  
  res.json({ success: true, borrow: newBorrow });
});

router.put('/:id', (req, res) => {
  const borrows = readJSON('borrows.json', []);
  const instruments = readJSON('instruments.json', []);
  const idx = borrows.findIndex(b => b.id === req.params.id);
  
  if (idx === -1) {
    return res.status(404).json({ error: '借用记录不存在' });
  }
  
  const newStatus = req.body.status;
  const oldStatus = borrows[idx].status;
  
  borrows[idx] = { ...borrows[idx], ...req.body, id: borrows[idx].id };
  
  if (newStatus === 'confirmed' && oldStatus !== 'confirmed') {
    borrows[idx].confirmedAt = new Date().toISOString();
    borrows[idx].status = 'borrowing';
    const instIdx = instruments.findIndex(i => i.id === borrows[idx].instrumentId);
    if (instIdx !== -1) {
      instruments[instIdx].status = 'borrowed';
      writeJSON('instruments.json', instruments);
    }
  }
  
  if (newStatus === 'borrowing' && oldStatus === 'confirmed') {
    borrows[idx].status = 'borrowing';
  }
  
  if (newStatus === 'returned' && oldStatus !== 'returned') {
    borrows[idx].returnedAt = new Date().toISOString();
    borrows[idx].status = 'returned';
    const inst = instruments.find(i => i.id === borrows[idx].instrumentId);
    borrows[idx].feeDetail = buildFeeDetail(borrows[idx], inst);
    if (inst) {
      inst.status = 'available';
      writeJSON('instruments.json', instruments);
    }
  }
  
  writeJSON('borrows.json', borrows);
  res.json({ success: true, borrow: borrows[idx] });
});

module.exports = router;
