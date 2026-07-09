const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');

router.post('/chat', chatController.sendMessage);
router.get('/history', chatController.getHistory);
router.delete('/history', chatController.clearHistory);
router.get('/models', chatController.getModels);

module.exports = router;
