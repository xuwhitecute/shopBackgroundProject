var express = require('express');
var router = express.Router();

router.all('/login', function(req, res, next) {
  res.render('login');
});//渲染登陆
router.get('/register', function(req, res, next) {
  res.render('register');
});//渲染注册
module.exports = router;
