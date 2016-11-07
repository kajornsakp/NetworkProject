var express = require('express');
var router = express.Router();

module.exports = function(passport){
	router.get('/success', function(req, res){
        console.log('success path');
		res.send({state: 'success', user: req.user ? req.user : null});
	});

    router.get('/failure', function(req, res){
        console.log('failure path');
        res.send({state: 'failure', user: null, message: "Invalid username or password"});
    });

    router.get('/failure/signup', function(req, res){
        console.log('failure path');
        res.send({state: 'failure', user: null, message: "username is already exist"});
    });

    router.post('/login', passport.authenticate('login', {
        successRedirect: '/auth/success',
        failureRedirect: '/auth/failure'
    }));

    router.post('/signup', passport.authenticate('signup', {
        successRedirect: '/auth/success',
        failureRedirect: '/auth/failure/signup'
    }));

    router.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    return router;

}