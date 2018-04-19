var express = require('express');
var router = express.Router();

// router.use(function(req,res,next){
//   if(req.session.username){
//       next();
//   }else{
//       res.send("<script>alert('您还未登录');location.href='/users/login';</script>")
//   }
// })
router.get('/', function(req, res, next) {
  res.redirect("/orders/show_orders");
});





module.exports = router;
