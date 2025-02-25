import mysql.connector
import json
import decimal  # 新增导入用于处理 Decimal 类型
import io


import sys
import os

# 连接到MySQL服务器
conn = mysql.connector.connect(
    host='localhost',       
    user='root',            
    password='sushiding',
    database='education_platform'   
)
cursor = conn.cursor()

# # 创建数据库
# cursor.execute('CREATE DATABASE IF NOT EXISTS education_platform')


cursor.execute("""
CREATE TABLE if not exists question_followups (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question_id INT NOT NULL,
    content TEXT NOT NULL,
    is_teacher BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);""")

# 关闭连接
cursor.close()
conn.close()
