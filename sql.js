const mysql = require('mysql2');

// 创建连接池
const connection = mysql.createConnection({
  host: 'localhost', // 数据库主机地址
  user: 'root', // 数据库用户名
  password: 'sushiding' // 数据库密码
});

// 连接到MySQL服务器
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err.stack);
    return;
  }
  console.log('Connected to MySQL as id ' + connection.threadId);

  // 创建数据库
  const createDatabaseQuery = 'CREATE DATABASE IF NOT EXISTS my_database';
  connection.query(createDatabaseQuery, (err, results) => {
    if (err) {
      console.error('Error creating database:', err.stack);
      return;
    }
    console.log('Database created or already exists.');

    // 选择数据库
    connection.query('USE my_database', (err) => {
      if (err) {
        console.error('Error selecting database:', err.stack);
        return;
      }
      console.log('Database selected.');

      // 创建表
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL
        )
      `;
      connection.query(createTableQuery, (err, results) => {
        if (err) {
          console.error('Error creating table:', err.stack);
          return;
        }
        console.log('Table created or already exists.');

        // 插入数据
        const insertDataQuery = 'INSERT INTO users (name, email) VALUES (?, ?)';
        const data = ['John Doe', 'john.doe@example.com'];
        connection.query(insertDataQuery, data, (err, results) => {
          if (err) {
            console.error('Error inserting data:', err.stack);
            return;
          }
          console.log('Data inserted successfully.');

          // 查询数据
          const selectDataQuery = 'SELECT * FROM users';
          connection.query(selectDataQuery, (err, results) => {
            if (err) {
              console.error('Error selecting data:', err.stack);
              return;
            }
            console.log('Data retrieved:', results);

            // 关闭连接
            connection.end((err) => {
              if (err) {
                console.error('Error closing connection:', err.stack);
                return;
              }
              console.log('Connection closed.');
            });
          });
        });
      });
    });
  });
});