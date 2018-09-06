const express = require('express');
const router = express.Router();

const antibug = require('../antibug');

router.post('/', antibug);

router.get('/', (req, res, next) => {
    res.render('index', { title: 'AntiBug' });
});

module.exports = router;