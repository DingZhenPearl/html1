const mysql = require('mysql2');

// 创建连接池
const pool = mysql.createPool({
  host: 'localhost', // 数据库主机地址
  user: 'root', // 数据库用户名
  password: 'sushiding', // 数据库密码
  database: 'my_database', // 指定数据库名称
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 获取连接并执行操作
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to MySQL:', err.stack);
    return;
  }
  console.log('Connected to MySQL as id ' + connection.threadId);

  // 删除数据
  const deleteDataQuery = 'DELETE FROM users WHERE id IN (?)';
  const deleteData = [12,14,15]; // 假设要删除 id 为 6, 7, 8 的记录
  connection.query(deleteDataQuery, [deleteData], (err, results) => {
    if (err) {
      console.error('Error deleting data:', err.stack);
      return;
    }
    console.log('Data deleted successfully.');

    // 继续执行其他操作，例如查询数据
    const selectDataQuery = 'SELECT * FROM users';
    connection.query(selectDataQuery, (err, results) => {
      if (err) {
        console.error('Error selecting data:', err.stack);
        return;
      }
      console.log('删除Data retrieved:', results);

      // 释放连接
      connection.release();

      // 关闭连接池
      pool.end((err) => {
        if (err) {
          console.error('Error closing connection pool:', err.stack);
          return;
        }
        console.log('Connection pool closed.');
      });
    });
  });
});
