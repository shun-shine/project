var express = require('express');
var router = express.Router();

// 引入连接数据库模块
const connection = require('./conn');

// 调用连接方法
connection.connect(() => {
  console.log('数据库连接成功!');
});


/* 商品添加 */
router.post('/goodsAdd', (req, res) => {
  // 接收前端商品的数据
  let { cateName, barCode, goodsName, salePrice, marketPrice, costPrice, goodsNum, goodsWeight, unit, discount, promotion, goodsDesc } = req.body;

  // 构造sql语句
  const sqlStr = 'insert into goods(cateName, barCode, goodsName, salePrice,marketPrice, costPrice, goodsNum, goodsWeight, unit, discount, promotion, goodsDesc) values(?,?,?,?,?,?,?,?,?,?,?,?)';
  
  // 接收到的数据参数
  const sqlParams = [cateName, barCode, goodsName, salePrice, marketPrice, costPrice, goodsNum, goodsWeight, unit, discount, promotion, goodsDesc]

  // 执行sql语句
  connection.query(sqlStr, sqlParams, (err, data) => {
    // 如有有错 抛出错误
    if (err) {
      throw err;
    } else {
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

/* 商品列表 */
router.get('/goodsList', (req, res) => {
  // 接收请求 接收前端传过来的参数
  let { pageSize, currentPage, searchCateName, searchKeyWord } = req.query;

  // 构造sql (查询所有用户账号)
  let sqlStr = 'select * from goods where 1=1';
  
  // 执行sql 
  connection.query(sqlStr, (err, data) => {
    // 如果有错 抛出错误
    if (err) {
      throw err;
    } else {
      // 计算数据总条数
      let totalCount = data.length;

      // 如果有分类名 就拼接上 分类的条件
      if (searchCateName !== '' && searchCateName != '全部') {
        sqlStr += ` and cateName='${searchCateName}'`;
      }

      // 如果有关键字 就按照关键字模糊查询
      if (searchKeyWord != '') {
        sqlStr += ` and (barCode like '%${searchKeyWord}%' or goodsName like '%${searchKeyWord}%')`
      }

      // 再次查询 重新计算数据总条数
      connection.query(sqlStr, (err, data) => {
        if (err) {
          throw err;
        } else {
          // 根据查询的结果 重新计算总条数
          totalCount = data.length;
        }
      })

      // 计算跳过多少条
      let n = (currentPage - 1) * pageSize;
      // 构造sql 按条件查询 对应页码的数据
      sqlStr += ` order by ctime desc limit ${n}, ${pageSize}`;
      // 执行sql语句
      connection.query(sqlStr, (err, data) => {
        if (err) {
          throw err;
        } else {
          // 把数据的总条数 和 当前页码对应的数据 一起发送给前端
          res.send({ "totalCount": totalCount, "pageData": data });
        }
      })
    }
  })
});


/* 查询 */
router.get('/search', (req, res) => {
  // 接收查询关键字
  let { searchCateName, searchKeyWord } = req.query;
  
  // 构造sql语句
  let sqlStr = 'select * from goods where 1=1';

  // 如果有分类名 就拼接上 分类的条件
  if (searchCateName !== '' && searchCateName != '全部') {
    sqlStr += ` and cateName='${searchCateName}'`;
  }

  // 如果有关键字 就按照关键字模糊查询
  if (searchKeyWord != '') {
    sqlStr += ` and (barCode like '%${searchKeyWord}%' or goodsName like '%${searchKeyWord}%')`
  }

  // 执行sql
  connection.query(sqlStr, (err, data) => {
    if (err) {
      throw err;
    } else {
      // 把查询结果 返回给前端
      res.send(data);
    }
  })
});


/* 接收单条删除的请求 */
router.get('/goodsDeleteOne', (req, res) => {
  // 接收前端发送过来的id
  let { id } = req.query;

  // 构造根据id删除指定数据的sql语句
  const sqlStr = `delete from goods where id = ${id}`;

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
});


/* 接收批量删除的数组的请求 */
router.post('/batchesdel', (req, res) => {
  // 接收前端选中的数据 批量删除
  let idArr = req.body['idArr[]']

  // 构造sql 根据id删除选中的数据全部被干掉
  const sqlStr = `delete from goods where id in (${idArr})`;

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
  
});


/* 添加库存 */
router.post('/inventoryAdd', (req, res) => {
  // 接收前端商品的数据
  let { barCode, goodsNum, costPrice } = req.body;

  // 构造sql语句
  const sqlStr = 'insert into goods( barCode, goodsNum, costPrice ) values(?,?,?)';
  
  // 接收到的数据参数
  const sqlParams = [ barCode, goodsNum, costPrice ]

  // 执行sql语句
  connection.query(sqlStr, sqlParams, (err, data) => {
    // 如有有错 抛出错误
    if (err) {
      throw err;
    } else {
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


/* 库存列表 */
router.get('/inventoryList', (req, res) => {
  // 接收请求 接收前端传过来的参数
  let { pageSize, currentPage, searchCateName, searchKeyWord } = req.query;

  // 构造sql (查询所有用户账号)
  let sqlStr = 'select * from goods where 1=1';
  
  // 执行sql 
  connection.query(sqlStr, (err, data) => {
    // 如果有错 抛出错误
    if (err) {
      throw err;
    } else {
      // 计算数据总条数
      let totalCount = data.length;

      // 如果有分类名 就拼接上 分类的条件
      if (searchCateName !== '' && searchCateName != '全部') {
        sqlStr += ` and cateName='${searchCateName}'`;
      }

      // 如果有关键字 就按照关键字模糊查询
      if (searchKeyWord != '') {
        sqlStr += ` and (barCode like '%${searchKeyWord}%' or goodsName like '%${searchKeyWord}%')`
      }

      // 再次查询 重新计算数据总条数
      connection.query(sqlStr, (err, data) => {
        if (err) {
          throw err;
        } else {
          // 根据查询的结果 重新计算总条数
          totalCount = data.length;
        }
      })

      // 计算跳过多少条
      let n = (currentPage - 1) * pageSize;
      // 构造sql 按条件查询 对应页码的数据
      sqlStr += ` order by ctime desc limit ${n}, ${pageSize}`;
      // 执行sql语句
      connection.query(sqlStr, (err, data) => {
        if (err) {
          throw err;
        } else {
          // 把数据的总条数 和 当前页码对应的数据 一起发送给前端
          res.send({ "totalCount": totalCount, "pageData": data });
        }
      })
    }
  })
});


module.exports = router;
