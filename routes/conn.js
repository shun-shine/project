
/* 创建数据库连接的代码 */
// 引入mysql
const mysql = require('mysql');

// 创建连接
const connection = mysql.createConnection({
  host     : 'localhost',  // 主机名
  user     : 'root',   // 用户名
  password : 'root', // 密码
  database : 'supermarket'  // 数据库的名字
});

// 把connection暴露出去
module.exports = connection;
