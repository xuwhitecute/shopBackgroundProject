var mysql=require("mysql");

function GetPool(){
    this.flag=true;
    this.pool=mysql.createPool({
        host:"localhost",
        port:3306,
        user:"root",
        password:"root",
        database:"background",
    })
    this.getpool=function(){//避免多次访问链接
        if(this.flag){
            this.pool.on("connect",(conn)=>{
                //mysql 数据库插入缓存
                conn.query("set session auto_increment=1");
            });
            this.flag=false;
        }
        return this.pool;
    }
}

var pool=new GetPool().getpool();

 function selectData(Mysql,params){
    return new Promise((resolve,reject)=>{
        pool.getConnection((err,conn)=>{
            conn.query(Mysql,params,(err,result)=>{
                if(err) throw err;
                resolve(result);
            })
            conn.release();
        })
    })
}







exports.selectData=selectData;
