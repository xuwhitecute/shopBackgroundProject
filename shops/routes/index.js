var express = require('express');
var router = express.Router();
var axios=require("axios");
/* GET home page. */
axios.defaults.baseURL = 'https://localhost:7000';


router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.all('/login', function(req, res, next) {
  var {username,pwd}=req.body;
  if(username&&pwd){
    axios({
      method:'post',
      url:'/shop/login',
      data:{username,pwd},
    }).then(res=>res.data)
      .then(json=>{
          res.send(json);
      })
  }
  res.render('login');
});
router.get('/register', function(req, res, next) {
  res.render('register');
});




module.exports = router;
