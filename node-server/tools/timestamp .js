function formatDateToString(){  
    var date = new Date();  
    var year = date.getFullYear();  
    var month = date.getMonth()+1;  
    var day = date.getDate();  
    var hours = date.getHours();  
    var mins = date.getMinutes();  
    var secs = date.getSeconds();  
    if(month<10) month = "0"+month;  
    if(day<10) day = "0"+day;   
    if(hours<10) hours = "0"+hours;  
    if(mins<10) mins = "0"+mins;  
    if(secs<10) secs = "0"+secs;   
    return year+month+day+hours+mins+secs;
}  



exports.formatDateToString=formatDateToString;