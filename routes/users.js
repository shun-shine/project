var express = require('express');
var router = express.Router();

// 引入连接数据库模块
const connection = require('./conn');

// 调用连接方法
connection.connect(() => {
  console.log('数据库连接成功!');  
});

/* 接收添加用户账号的请求 */
router.post('/userAdd', (req, res) => {
  // 接收前端用户账号的数据
  // let {username, password, group} = req.body;
  /*console.log('接收到的数据:',username, password, group)  // 这里要测试 */

  // 构造sql语句
  const sqlStr = 'insert into users(username, password, groups) values(?,?,?)';
  // 接收到的数据参数
  const sqlParams = [username, password, group];

  // 执行sql语句(插入数据-添加账号)
  connection.query(sqlStr, sqlParams, (err, data) => {
    // 如有有错 抛出错误
    if (err) {
      throw err;
    } else {
      // 否则 检查是否插入成功
      // 判断 如果受影响的行数 > 0 就是插入成功了
      if (data.affectedRows > 0) {
        // 响应一个成功的数据对象回去
        res.send({"errcode": 1, "msg":"添加成功!"})
      } else {
        // 否则 就是插入失败 响应一个失败的数据对象回去
        res.send({"errcode": 0, "msg":"添加失败!"})
      }
    }
  })
});


/* 接收显示所有用户账号的请求 */
router.get('/userList', (req, res) => {
  // 构造sql (查询所有用户账号)
  const sqlStr = 'select * from users order by ctime desc';

  // 执行sql （执行查询所有用户账号数据）
  connection.query(sqlStr, (err, data) => {
    // 如果有错 抛出错误
    if (err) {
      throw err;
    } else {
      // 否则  直接把查询的所有数据 响应给前端
      res.send(data);
    }
  })
});

/* 接收单条删除的请求 */
router.get('/userDeleteOne', (req, res) => {
  // 接收前端发送过来的id
  // let {id} = req.query;

  // 构造根据id删除指定数据的sql语句
  const sqlStr = `delete from users where id = ${id}`;

  // 执行sql语句（根据id单条删除）
  connection.query(sqlStr, (err, data) => {
    // 如果有错 抛出错误
    if (err) {
      throw err;
    } else {
      // 判断 如果受影响的行数 > 0 返回给前端删除成功的数据对象
      if (data.affectedRows > 0) {
        res.send({"errcode":1, "msg":"删除成功！"})
      } else {
        // 否则 返回给前端删除失败的数据对象
        res.send({"errcode":0, "msg":"删除失败！"})
      }
    }
  })
})



module.exports = router;
