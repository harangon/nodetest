var express = require('express');
var router = express.Router();
var { User } = require('../models')

//const dice = require('../dice');


router.get('/', function(req, res, next) {
    User.findAll()
    .then((users) => {
      res.render('sequelize', { title: 'Express', users: users });
    })
    .catch((err) => {
        console.error(err);
        next(err);
    });
});

//router.get('/dice', )
//router.post('/dice', dice);


module.exports = router;
