var express = require('express');
var router = express.Router();
var async=require("async");
var fs=require("fs");
var {selectData}=require("../tools/mysql_func");
var multiparty = require("multiparty");
router.use(function(req,res,next){
    if(req.session.username){
        next();
    }else{
        // res.send("<script>alert('您还未登录');location.href='/users/login';</script>")
        res.redirect("/users/login")
    }
})
//增加订单列表
router.get('/add_orders',(req,res,next)=>{
    async.series([
        function(callback){
            var sql="select * from staffinfo";
            selectData(sql)
            .then((result)=>{
                callback(null,result)
            })
        },
        function(callback){
            var sql="select * from membersinfo";
            selectData(sql)
            .then((result)=>{
                callback(null,result)
            })
        },
        function(callback){
            var sql="select * from goodsinfo";
            selectData(sql)
            .then((result)=>{
                callback(null,result)
            })
        },
        function(callback){
            var sql="select * from addressinfo";
            selectData(sql)
            .then((result)=>{
                callback(null,result)
            })
        },
    ],(err,result)=>{
        if(err) throw err;
        var staffinfo=result[0];
        var membersinfo=result[1];
        var goodsinfo=result[2];
        var addressinfo=result[3]
        res.render('add_orders',{username:req.session.username,staffinfo,membersinfo,addressinfo,goodsinfo})
    })
})
router.post('/searchgoodschild',(req,res,next)=>{
    var goodsid=req.body.goodsid;
    var sql=`select childspecs,childprice,goodssellpoint from goodsinfo where id=${goodsid}`;
    selectData(sql)
        .then((result)=>{
            if(result.length>0){
                res.json({code:1,result})
            }else{
                res.json({code:0})
            }
        })
})
//增加订单接口
router.post('/add_orders_server',(req,res)=>{
    var info=req.body;
    var fieldsarray=[];
    for(var i in info){
        fieldsarray.push(info[i].toString())
    }
   console.log(fieldsarray)
    var sql=`insert into ordersinfo (sid,mid,id,goodschild,goodscount,adsid,orderstatus,ordercreatetime) values (?,?,?,?,?,?,?,now())`
    selectData(sql,fieldsarray)
      .then((result)=>{
        if(result.affectedRows>0){
            res.json({code:1})
        }else{    

        }
      }) 
})
//订单渲染页面
var flag={};
router.get('/show_orders',(req,res,next)=>{
    var sort=req.query.sort||null;
    var search=req.query.search||null;
    var count = 0;   // 总条数
    var totalPage = 0;   // 总页数
    var showpage=3; //展示页码数
    var pageSize = 8;    // 每页显示的条数  
    var showpageNo=0 ;//显示的页面当前
    var pageNo = parseInt(req.query['pageNo'])  || 0  // 当前的页数 
    function DESC(item){
        // console.log(flag,"+++++++++",item);
        sort=flag[item.replace(/ desc/,"")]?item+" desc":item.replace(/ desc/,"");
        flag[item.replace(/ desc/,"")]=!flag[item.replace(/ desc/,"")];
        
    }
    if(!(req.query['pageNo'])){
        if(sort!=null){
            DESC(sort)
        }
    }

    async.series([function(callback){
        if(!search){
            var sql=`SELECT  * FROM (SELECT * FROM (SELECT o.oid,o.mid,o.orderstatus,o.goodscount,o.sid,g.* FROM ordersinfo o ,goodsinfo g WHERE o.id=g.id) aall LEFT JOIN  addressinfo a ON a.adsid=aall.sid) ball  LEFT JOIN  membersinfo m ON  ball.mid=m.mid `;
        }else{
            var sql=`SELECT  * FROM (SELECT * FROM (SELECT o.oid,o.mid,o.orderstatus,o.goodscount,o.sid,g.* FROM ordersinfo o ,goodsinfo g WHERE o.id=g.id) aall LEFT JOIN  addressinfo a ON a.adsid=aall.sid) ball  LEFT JOIN  membersinfo m ON  ball.mid=m.mid WHERE memberssname LIKE "%${search}%"`
        }
        selectData(sql)
            .then((result)=>{
                count = result.length;
                if(count){
                    totalPage = Math.ceil(count/pageSize);//总页数
                    pageNo = pageNo<=1?1:pageNo;//当前页数
                    pageNo = pageNo>=totalPage ? totalPage :pageNo;//当前页数判断
                    if(pageNo<showpage){//当前页面小于展示页面
                        showpageNo=Math.ceil(showpage/2);
                    }else if(pageNo>=totalPage-showpage+1){//最后几页
                        showpageNo=totalPage-showpage+Math.ceil(showpage/2);
                    }else{//最后几页
                        showpageNo=pageNo;
                    }
                    callback(null,true);
                }else{
                    callback(null,false);
                }
            })
        }],function(err,results){
        if(err) throw err;
        if(results[0]){
            //select * from goodsinfo WHERE count LIKE "%%"  order by NULL limit 0,120 
            if(!search){
                var sql=`SELECT  * FROM (SELECT * FROM (SELECT o.oid,o.sendtime,o.mid,o.orderstatus,o.goodschild,o.ordercreatetime,o.goodscount,o.sid,g.* FROM ordersinfo o ,goodsinfo g WHERE o.id=g.id) aall LEFT JOIN  addressinfo a ON a.adsid=aall.sid) ball  LEFT JOIN  membersinfo m ON  ball.mid=m.mid  order by ${sort} limit ${(pageNo-1)*pageSize},${pageSize}`;
            }else{  
                var sql=`SELECT  * FROM (SELECT * FROM (SELECT o.oid,o.sendtime,o.mid,o.orderstatus,o.goodschild,o.ordercreatetime,o.goodscount,o.sid,g.* FROM ordersinfo o ,goodsinfo g WHERE o.id=g.id) aall LEFT JOIN  addressinfo a ON a.adsid=aall.sid) ball  LEFT JOIN  membersinfo m ON  ball.mid=m.mid WHERE memberssname LIKE "%${search}%"  order by ${sort} limit ${(pageNo-1)*pageSize},${pageSize}`;
            }
            selectData(sql)
                .then((result)=>{
                    res.render('show_orders',{username:req.session.username,result,pageNo,totalPage,showpageNo})
            })
        }else{
            res.render('show_orders',{username:req.session.username,result:null,totalPage,showpageNo,pageNo})
        }
        
    })
           
})
//发货获取信息接口
router.post('/delivery',(req,res)=>{
    var id=req.body.id;
    var sql=`SELECT  * FROM (SELECT * FROM (SELECT o.oid,o.mid,o.orderstatus,o.goodschild,o.ordercreatetime,o.goodscount,o.sid,g.* FROM ordersinfo o ,goodsinfo g WHERE o.id=g.id) aall LEFT JOIN  addressinfo a ON a.adsid=aall.sid) ball  LEFT JOIN  membersinfo m ON  ball.mid=m.mid   WHERE oid=${id}`;
          selectData(sql)
            .then((result)=>{
                result=result[0];
               res.json(result);
            })
})
//发货信息
router.post('/Courier',(req,res)=>{
    var fields=req.body;
    var id=req.query.id;
    var fieldsarray=[];
    for(var i in fields){
        fieldsarray.push(fields[i]);
    }
    fieldsarray.push(id);  
    var sql=`UPDATE ordersinfo 
            SET   Couriercompany=?,Couriernumber=?,orderstatus=?,sendtime=now()
            WHERE oid = ?`;
            selectData(sql,fieldsarray)
            .then((result)=>{
                if(result.affectedRows>0){
                    res.json({code:1})
                }else{
                    res.json({code:0})
                }
            })
})
router.post('/deletorders',(req,res)=>{
    var id=req.body.id;
    var sql=`DELETE FROM ordersinfo WHERE oid= ${id}`;
    selectData(sql)
            .then((result)=>{
                if(result.affectedRows>0){
                    res.json({code:1})
                }else{
                    res.json({code:0})
                }
            })
})
module.exports = router;