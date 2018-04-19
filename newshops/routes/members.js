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
//增加渲染列表
router.get('/add_members',(req,res,next)=>{
    res.render('add_members',{username:req.session.username})
})
//增加员工接口
router.post('/add_members_server',(req,res)=>{
    var info=req.body;
    var fieldsarray=[];
    for(var i in info){
        fieldsarray.push(info[i].toString())
    }
   
    //insert into staffinfo (stuffsname,stuffsphone,jointime,sex,stuffjob,status) values (1,3,"2018-7-8",4,4,1)
    var sql=`insert into membersinfo (memberssname,membersphone,jointime,sex,viplevel,province,city,district,addressdetails) values (?,?,?,?,?,?,?,?,?)`
    selectData(sql,fieldsarray)
      .then((result)=>{
        if(result.affectedRows>0){
            res.json({code:1})
        }else{    

        }
      }) 
})
//员工渲染页面
var flag={};
router.get('/show_members',(req,res,next)=>{
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
            var sql=`select * from membersinfo`;
        }else{
            var sql=`select * from membersinfo WHERE memberssname LIKE "%${search}%"`
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
                var sql=`select * from membersinfo  order by ${sort} limit ${(pageNo-1)*pageSize},${pageSize}`;
            }else{  
                var sql=`select * from membersinfo WHERE memberssname LIKE "%${search}%"  order by ${sort} limit ${(pageNo-1)*pageSize},${pageSize}`;
            }
            selectData(sql)
                .then((result)=>{
                    // if(result.length>0){
                    //     res.render('show_goods',{username:req.session.username,result,pageNo,totalPage,showpageNo})
                    // }else{
                        res.render('show_members',{username:req.session.username,result,pageNo,totalPage,showpageNo})
                    // }
            })
        }else{
            res.render('show_members',{username:req.session.username,result:null,totalPage,showpageNo,pageNo})
        }
        
    })
           
})
//员工修改获取信息接口
router.post('/moditfmembers',(req,res)=>{
    var id=req.body.id;
    var sql=`SELECT * from membersinfo WHERE mid=${id}`;
          selectData(sql)
            .then((result)=>{
                result=result[0];
               res.json(result);
            })
})
//修改员工信息
router.post('/updatamembers',(req,res)=>{
    var fields=req.body;
    var id=req.query.id;
    var fieldsarray=[];
    for(var i in fields){
        fieldsarray.push(fields[i]);
    }
    fieldsarray.push(id); 
    console.log(fieldsarray)
    var sql=`UPDATE membersinfo 
            SET   memberssname=?,membersphone=?,jointime=?,sex=?,viplevel=?,province=?,city=?,district=?,addressdetails=?
            WHERE mid = ?`;
            selectData(sql,fieldsarray)
            .then((result)=>{
                if(result.affectedRows>0){
                    res.json({code:1})
                }else{
                    res.json({code:0})
                }
            })
})
router.post('/deletemembers',(req,res)=>{
    console.log(req.body);
    var id=req.body.id;
    var sql=`DELETE FROM membersinfo WHERE mid= ${id}`;
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