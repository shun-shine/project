var express = require('express');
var router = express.Router();

// 引入连接数据库模块
const connection = require('./conn');

// 调用连接方法
connection.connect(() => {
  console.log('数据库连接成功!');
});

/* 获取当前登录用户的用户名 */
router.get('/getusers', (req, res) => {
  //获取当前登录的用户名
  let users = req.cookies.username;
  res.send(users);
})

/* 检查用户名和密码的请求 */
router.post('/checklogin', (req, res) => {
  // 接受用户和密码
  let {username, password} = req.body;

  // 构造sql 
  const sqlStr = `select * from users where username='${username}' and password='${password}'`;
 
  // 执行sql语句 查询用户名和密码是否存在
  connection.query(sqlStr, (err,data) => {
    if(err){
      throw err;
    }else{
      // 如果存在 返回成功的数据对象
      if(data.length){
        // 登录成功 设置cookie
        res.cookie('username', data[0].username);
        res.cookie('password', data[0].password);
        res.cookie('groups', data[0].groups);
        res.cookie('userId', data[0].id);

        res.send({'errcode': 1, 'msg': '恭喜你，登录成功！'});
      }else{
        res.send({'errcode': 0, 'msg': '请检查用户名和密码！'});
      }
    }
  })
})

/* 检测用户是否登录的请求 */
router.get('/checkIsLogin', (req, res) => {
  // 从浏览器获取cookie
  let username = req.cookies.username;
  // 如果存在 响应一下
  if (username) {
    res.send('console.log("")')
  } else {
    // 否则 弹出提示 跳到登录页面
    res.send('alert("请登录以后再操作"); location.href="./login.html";')
  }
})

/* 退出登录的请求 */
router.get('/loginout', (req, res) => {
  // 清除cookie
  res.clearCookie('username');
  res.clearCookie('password');
  res.clearCookie('groups');

  res.send('<script>alert("欢迎下次再来！"); location.href="http://localhost:999/login.html"</script>')
})

/* 接收添加用户账号的请求 */
router.post('/userAdd', (req, res) => {

  let { username, password, group } = req.body;

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
        res.send({ "errcode": 1, "msg": "添加成功!" })
      } else {
        // 否则 就是插入失败 响应一个失败的数据对象回去
        res.send({ "errcode": 0, "msg": "添加失败!" })
      }
    }
  })
});

/* 接收显示所有用户账号的请求 */
router.get('/userList', (req, res) => {
  // 接收前端参数请求 
  let { pageSize, currentPage } = req.query;

  // 构造sql (查询所有用户账号)
  let sqlStr = 'select * from users';

  // 执行sql （执行查询所有用户账号数据）
  connection.query(sqlStr, (err, data) => {
    // 如果有错 抛出错误
    if (err) {
      throw err;
    } else {
      // 计算数据总条数
      let totalCount = data.length;

      // 计算跳过多少条
      let n = (currentPage - 1) * pageSize;

      // 构造sql语句
      sqlStr += ` order by ctime desc limit ${n}, ${pageSize}`;

      // 执行sql语句
      connection.query(sqlStr, (err, data) => {
        if (err) {
          throw err;
        } else {
          // 把数据总条数 和当前页码对应的数据 发给前端
          res.send({'totalCount': totalCount, 'pageData': data})
        }
      })
    }
  })
});

/* 修改密码的请求 */
router.get('/checkpwd', (req, res) => {
  // 接收旧密码
  let { password } = req.query;
  // 从cookie里取出当前登录用户id
  const id = req.cookies.userId
  // 根据id 构造sql查询语句
  const sqlStr = `select * from users where id=${id}`;

  // 执行sql语句
  connection.query(sqlStr, (err, data) => {
    // 如果有错 抛出错误
    if (err) {
      throw err;
    } else {
      if (data[0].password === password) {
        res.send({'errcode':1, 'msg':'旧密码输入正确！'})
      } else {
        res.send({'errcode':0, 'msg':'旧密码输入错误！'})
      }
    }
  })
})

/* 保存新密码的请求 */
router.post('/savepwd', (req, res) => {
  // 接收新密码
  let { newPassword } = req.body;
  // 从cookie里取出当前登录用户id
  let id = req.cookies.userId

  let sqlStr = `update users set password='${newPassword}' where id=${id}`;
  // 根据id 构造sql更新语句
  connection.query(sqlStr, (err, data) => {
    if (err) {
      throw err;
    } else {
      // 清除cookie
      res.clearCookie('username');
      res.clearCookie('password');
      res.clearCookie('groups');
      res.send({'errcode':1, 'msg': '密码修改成功！'});
    }
  })
})

/* 接收单条删除的请求 */
router.get('/userDeleteOne', (req, res) => {
  // 接收前端发送过来的id
  let { id } = req.query;

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
        res.send({ "errcode": 1, "msg": "删除成功！" })
      } else {
        // 否则 返回给前端删除失败的数据对象
        res.send({ "errcode": 0, "msg": "删除失败！" })
      }
    }
  })
})

/* 修改用户账号的请求 */
router.get('/useredit', (req, res) => {
  // 接收id
  let { id } = req.query;
  // 根据id 构造sql查询语句
  const sqlStr = `select * from users where id=${id}`;

  // 执行sql语句
  connection.query(sqlStr, (err, data) => {
    // 如果有错 抛出错误
    if (err) {
      throw err;
    } else {
      res.send(data);
    }
  })
})


/* 接收用户账号的请求 */
router.post('/edit', (req, res) => {
  // 接收前端发过来的数据
  let { username, password, group, id } = req.body;

  // 构造sql语句
  const sqlStr = `update users set username='${username}',password='${password}',groups='${group}' where id=${id}`;

  // 执行sql修改语句
  connection.query(sqlStr, (err, data) => {
    // 如果有错 抛出错误
    if (err) {
      throw err;
    } else {
      // 判断 如果受影响的行数 > 0 返回给前端删除成功的数据对象
      if (data.affectedRows > 0) {
        res.send({ "errcode": 1, "msg": "修改成功！" })
      } else {
        // 否则 返回给前端删除失败的数据对象
        res.send({ "errcode": 0, "msg": "修改失败！" })
      }
    }
  })
})


/* 接收批量删除的数组的请求 */
router.post('/batchesdel', (req, res) => {
  // 接收前端选中的数据 批量删除
  let idArr = req.body['idArr[]']

  // 构造sql 根据id删除选中的数据全部被干掉
  const sqlStr = `delete from users where id in (${idArr})`;

  // 执行sql语句
  connection.query(sqlStr, (err, data) => {
    // 如有有错 抛出错误
    if (err) {
      throw err;
    } else {
      // 判断 如果受影响的行数 > 0 就是插入成功了
      if (data.affectedRows > 0) {
        // 响应一个成功的数据对象回去
        res.send({ "errcode": 1, "msg": "批量删除成功!" })
      } else {
        // 否则 就是插入失败 响应一个失败的数据对象回去
        res.send({ "errcode": 0, "msg": "批量删除失败!" })
      }
    }
  })
  
})

module.exports = router;
