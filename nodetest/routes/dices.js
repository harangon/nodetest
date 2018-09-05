const express = require('express');
const router = express.Router();

const dice = require('../dice');

router.post('/', dice);

router.get('/', (req, res, next) => {
    res.render('index', { title: 'Dice' });
});

module.exports = router;