const express = require('express');
const Validator = require('../../middleware/validate');
const User = require('../../controllers/UserController');
const router = express.Router();
const isLoggedIn  = require('../../middleware/AuthenticateUser');
const isAdmin  = require('../../middleware/AuthenticateAdmin');

router.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});


//     
router.post('/login', Validator('loginSchema'), User.login);

router.post('/logout', isLoggedIn, User.logout);

// Admin Updatable Only

router.post('/create-users',[isAdmin, Validator('signup')], User.signup);

router.delete('/user/:id', isAdmin, User.deleteRecord);

router.put('/user-update', [Validator('userUpdate'), isAdmin], User.updateRecord);



router.post("/create-group", [Validator('createGroup'), isLoggedIn], User.createGroup);

router.delete('/group/:id', isLoggedIn, User.deleteGroup);

router.post("/message", [Validator('message'), isLoggedIn ], User.createMessage);

router.get("/groups", isLoggedIn, User.getGroupList);

router.get("/users", isLoggedIn, User.getUsersList);

module.exports = router;
