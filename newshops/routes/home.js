var express = require('express');
var router = express.Router();
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
router.get('/', function(req, res, next) {
  res.render('index',{username:req.session.username});
});
//富文本上传
router.post("/uploadImg",(req,res)=>{
    // console.log("上传图片");
    // formData
    var form = new multiparty.Form();
    // 设置编码
    form.encoding = "UTF-8";
    // 设置文件的临时存储路径
    form.uploadDir = "./public/uploadtemp";
    // 设置上传图片的大小
    form.maxFilesSize =  2*1024*1024     // 2M    bytes  1B  存2个汉字 4个英文字母  // gbk-2313
  
    form.parse(req,(err,fields,files)=>{
        if(err) throw err;
        // fields 文件域 
        // files 对应文件 
        // console.log(fields);
        // console.log(files);
        // var uploadUrl = "/images/upload/"; // 文件的真实路径
        var uploadUrl = "/images/goodsdetail/";
        file  = files["filedata"];  // 富文本编辑对象
        originalFilename = file[0].originalFilename;  // 文件名称  5.jpg 
        tempath = file[0].path    // 文件的临时路径 uploadtemp
  
        var timestamp = new Date().getTime();  //时间戳
        uploadUrl+=timestamp+originalFilename;    // /images/uploda/12332231205.jpg
        newPath = "./public"+uploadUrl;
  
        // 通过文件流读写数据
        var fileReadStream = fs.createReadStream(tempath);
        var fileWriteStream = fs.createWriteStream(newPath);
  
        fileReadStream.pipe(fileWriteStream);  // 通过pipe 管道输送文件 图片
  
        // 监听文件上传  关闭  on('pipe')
        fileWriteStream.on("close",()=>{
            // 删除临时文件夹
            fs.unlinkSync(tempath);
            res.send('{"err":"","msg":"'+uploadUrl+'"}');
        })
    })
    // res.send("上传图片");
  })
//单图片上传
router.post('/uploadImgshow',(req,res,next)=>{
      var form = new multiparty.Form({uploadDir: './public/images/showimg'});
      form.parse(req, function(err, fields, files) {
        var filesTmp = JSON.stringify(files);
        if(err){
          console.log('parse error: ' + err);
        } else {
          testJson = eval("(" + filesTmp+ ")"); 
          res.json({imgSrc:testJson.file[0].path});
          // console.log('rename ok');
        }
      });
  })

module.exports = router;