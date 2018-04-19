var crypto=require("crypto");
var enc=text=>{
    let md5=crypto.createHash("md5");
    md5.update(text);
    return md5.digest("hex");
}
exports.enc=enc;

var md5=require("md5");

var smallenc=text=>{
    
    return md5(text);
}

exports.smallenc=smallenc;




//  var crtpto=require("crypto");

//  var enc=text=>{
//      var md5=crypto.createHash("md5");
//      md5.update(text);
//      return md5.digest("hex");
//  }
//   module.exports=enc