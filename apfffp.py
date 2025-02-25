# from flask import Flask, render_template, request, jsonify
# import mysql.connector

# app = Flask(__name__)





# # 连接到MySQL服务器
# conn = mysql.connector.connect(
#     host='localhost',       
#     user='root',            
#     password='sushiding'    
# )
# cursor = conn.cursor()

# # 创建数据库
# cursor.execute('CREATE DATABASE IF NOT EXISTS mydb')
# cursor.execute('USE mydb')



# # 创建新表
# cursor.execute('''
# CREATE TABLE  IF NOT EXISTS users (
#     id INT AUTO_INCREMENT PRIMARY KEY,
#     name VARCHAR(50),
#     email VARCHAR(50)
# )
# ''')








# # 数据库配置
# db_config = {
#     'host': 'localhost',
#     'user': 'root',
#     'password': 'sushiding',
#     'database': 'mydb'
# }

# @app.route('/')
# def index():
#     """
#     主路由函数，响应根路径请求
    
#     此函数没有参数
#     返回: 渲染后的index.html模板
#     """
#     return render_template('index.html')

# @app.route('/submit', methods=['POST'])
# def submit_form():
#     try:
#         # 获取前端数据
#         name = request.form['name']
#         email = request.form['email']

#         # 连接数据库
#         conn = mysql.connector.connect(**db_config)
#         cursor = conn.cursor()

#         # 执行插入操作（使用参数化查询防止SQL注入）
#         query = "INSERT INTO users (name, email) VALUES (%s, %s)"
#         cursor.execute(query, (name, email))
#         conn.commit()

#         return jsonify({'status': 'success', 'message': 'Data saved successfully'})
    
#     except Exception as e:
#         return jsonify({'status': 'error', 'message': str(e)})
    
#     finally:
#         if 'conn' in locals() and conn.is_connected():
#             cursor.close()
#             conn.close()

# @app.route('/users')
# def get_users():
#     """
#     获取所有用户信息的API端点。
    
#     此函数尝试连接到数据库，执行SQL查询以获取所有用户的信息，
#     并以JSON格式返回查询结果。如果过程中遇到任何错误，将返回错误信息。
#     """
#     try:
#         # 连接到数据库
#         conn = mysql.connector.connect(**db_config)
#         # 创建一个字典光标，允许结果以字典形式返回
#         cursor = conn.cursor(dictionary=True)
        
#         # 执行SQL查询，获取所有用户信息
#         cursor.execute("SELECT * FROM users")
#         users = cursor.fetchall()
        
#         # 返回所有用户信息的JSON响应
#         return jsonify(users)
    
#     except Exception as e:
#         # 如果发生错误，返回错误信息的JSON响应
#         return jsonify({'error': str(e)})
    
#     finally:
#         # 确保在执行完毕后关闭数据库连接和光标
#         if 'conn' in locals() and conn.is_connected():
#             cursor.close()
#             conn.close()

# if __name__ == '__main__':
#     # 启动Flask应用程序
#     app.run(debug=True, port=3000)