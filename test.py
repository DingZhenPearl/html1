import mysql.connector
import json
import decimal  # 新增导入用于处理 Decimal 类型
import io


import sys
import os
# 设置标准输出编码为 UTF-8
# sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
# sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')


print("Python解释器路径:", sys.executable)
print("模块搜索路径:", sys.path)

# 连接到MySQL服务器
conn = mysql.connector.connect(
    host='localhost',       
    user='root',            
    password='sushiding'    
)
cursor = conn.cursor()

# 创建数据库
cursor.execute('CREATE DATABASE IF NOT EXISTS my_database')
cursor.execute('USE my_database')



# 创建新表
cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_name VARCHAR(255) NOT NULL,
        coding_accuracy DECIMAL(5, 2) NOT NULL,
        coding_time INT NOT NULL
    )
''')

# 插入数据
#cursor.execute(
#    "INSERT IGNORE INTO users (student_name, coding_accuracy, coding_time) VALUES (%s, %s, %s)",
#    ("Kim jongUn", 60.00, 50)
#)
#conn.commit()

# 查询数据
cursor.execute("SELECT * FROM users")
users = cursor.fetchall()

# 打印原始数据（验证）
print("原始数据库数据:")
for student in users:
    print(student)

# 将数据转换为 JSON 格式（处理 Decimal 类型）
users_list = []
for row in users:
    users_list.append({
        "id": row[0],
        "student_name": row[1],
        "coding_accuracy": float(row[2]),  # 关键修复点：Decimal → float
        "coding_time": row[3]
    })
users_json = json.dumps(users_list)

# 调用分析函数
from ai import analyze_data
analyze_data(users_json)

# 关闭连接
cursor.close()
conn.close()

#print("数据库已保存")