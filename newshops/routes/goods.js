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

router.get('/add_goods',(req,res,next)=>{
    res.render('add_goods',{username:req.session.username})
})
//新增商品数据
router.post('/add_goods_server',(req,res,next)=>{
  var form = new multiparty.Form();
    form.parse(req, function(err, fields, files) {
          var username=req.session.username;
          var fieldsarray=[];
          console.log(fields);
          for(var i in fields){
              if(i!="img"){
                  fieldsarray.push(fields[i].toString())
              }
          }
          fieldsarray.push(username);
          console.log(fieldsarray,"modify");
          var sql=`insert into goodsinfo (goodstitle,goodssellpoint,createtime,Oprice,discount,childspecs,childprice,childcount,count,imgsrc,goodsdetail,publisher) values (?,?,now(),?,?,?,?,?,?,?,?,?)`
          selectData(sql,fieldsarray)
            .then((result)=>{
              if(result.affectedRows>0){
                  res.json({code:1})

              }else{    

              }
            }) 
    })
})

var flag={};
flag.id=true;flag.Oprice=true;flag.count=true;flag.createtime=true;flag.updatatime=true
router.get('/show_goods',(req,res,next)=>{
    var sort=req.query.sort||null;
    var search=req.query.search||null;
    var count = 0;   // 总条数
    var totalPage = 0;   // 总页数
    var showpage=3; //展示页码数
    var pageSize = 5    // 每页显示的条数  
    var showpageNo=0 //显示的页面当前
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
            var sql=`select * from goodsinfo`;
        }else{
            var sql=`select * from goodsinfo WHERE goodstitle LIKE "%${search}%"`
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
                var sql=`select * from goodsinfo  order by ${sort} limit ${(pageNo-1)*pageSize},${pageSize}`;
            }else{  
                var sql=`select * from goodsinfo WHERE goodstitle LIKE "%${search}%"  order by ${sort} limit ${(pageNo-1)*pageSize},${pageSize}`;
            }
            selectData(sql)
                .then((result)=>{
                    // if(result.length>0){
                    //     res.render('show_goods',{username:req.session.username,result,pageNo,totalPage,showpageNo})
                    // }else{
                        res.render('show_goods',{username:req.session.username,result,pageNo,totalPage,showpageNo})
                    // }
            })
        }else{
            res.render('show_goods',{username:req.session.username,result:null,totalPage,showpageNo,pageNo})
        }
        
    })
           
})
//查找修改商品的数据
router.post('/moditfgoods',(req,res)=>{
    var goodsid=req.body.id;
    var sql=`SELECT * from goodsinfo WHERE id=${goodsid}`;
          selectData(sql,[goodsid])
            .then((result)=>{
                result=result[0];
                result.imgsrc=result.imgsrc.split(",");
                result.childspecs=result.childspecs.split(",");
                result.childprice=result.childprice.split(",");
                result.childcount=result.childcount.split(",");
                res.json(result);            
            })
})
//修改后数据提交接口
router.all("/moditfgoodspost",(req,res)=>{
    var username=req.session.username;
    var fields=req.body;
    var goodsid=req.query.goodsid;
    var fieldsarray=[];
    for(var i in fields){
        fieldsarray.push(fields[i].toString())
    }
    fieldsarray.push(username);
    fieldsarray.push(goodsid);    
    var sql=`UPDATE goodsinfo 
            SET   goodstitle=?,goodssellpoint=?,Oprice=?,discount=?,childspecs=?,childprice=?,childcount=?,count=?,imgsrc=?,goodsdetail=?,updatatime=now(),updatasher=?
            WHERE id = ?`;
            selectData(sql,fieldsarray)
            .then((result)=>{
                if(result.affectedRows>0){
                    res.json({code:1})
                }else{
                    res.json({code:0})
                }
            })
})
//删除商品
router.post("/deletegoods",(req,res)=>{
    var goodsid=req.body.goodsid;
    var sql=`DELETE FROM goodsinfo WHERE id= ${goodsid}`;
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
//排序模型
// if(!(req.query['pageNo'])){
//     switch(sort){
//         case "id":
//         sort=flag.id?sort+" desc":sort.replace(/ desc/,"");
//         flag.id=!flag.id;
//         break;
//         case "Oprice":
//         sort=flag.Oprice?sort+" desc":sort.replace(/ desc/,"");
//         flag.Oprice=!flag.Oprice;
//         break;
//         case "count":
//         sort=flag.count?sort+" desc":sort.replace(/ desc/,"");
//         flag.count=!flag.count;
//         break;
//         case "createtime":
//         sort=flag.createtime?sort+" desc":sort.replace(/ desc/,"");
//         flag.createtime=!flag.createtime;
//         break;
//         case "updatatime":
//         sort=flag.updatatime?sort+" desc":sort.replace(/ desc/,"");
//         flag.updatatime=!flag.updatatime;
//         break;
//     }
// }