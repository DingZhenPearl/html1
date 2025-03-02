import sys
import json
import mysql.connector
from mysql.connector import Error
import hashlib
import os

# 数据库配置
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'sushiding',
    'database': 'user_auth_db'
}

def get_db_connection():
    """建立数据库连接"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except Error as e:
        print(json.dumps({'success': False, 'message': f'数据库连接错误: {str(e)}'}))
        sys.exit(1)

def hash_password(password):
    """密码加密"""
    salt = os.urandom(32).hex()
    key = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000
    ).hex()
    return salt, key

def verify_password(stored_salt, stored_password, provided_password):
    """验证密码"""
    key = hashlib.pbkdf2_hmac(
        'sha256',
        provided_password.encode('utf-8'),
        stored_salt.encode('utf-8'),
        100000
    ).hex()
    return key == stored_password

def init_database():
    """初始化数据库表"""
    connection = get_db_connection()
    cursor = connection.cursor()
    
    try:
        # 创建学生表
        cursor.execute(''' 
            CREATE TABLE IF NOT EXISTS students (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                salt VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # 创建教师表
        cursor.execute(''' 
            CREATE TABLE IF NOT EXISTS teachers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                salt VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        connection.commit()
    except Error as e:
        print(json.dumps({'success': False, 'message': f'初始化数据库错误: {str(e)}'}))
        sys.exit(1)
    finally:
        cursor.close()
        connection.close()

def register(user_type, email, password):
    """用户注册"""
    connection = get_db_connection()
    cursor = connection.cursor()
    
    try:
        # 根据用户类型选择表
        table = 'students' if user_type == 'student' else 'teachers'
        
        # 检查邮箱是否已存在
        cursor.execute(f"SELECT id FROM {table} WHERE email = %s", (email,))
        if cursor.fetchone():
            print(json.dumps({'success': False, 'message': '该邮箱已被注册'}))
            return

        # 加密密码并存储用户信息
        salt, hashed_password = hash_password(password)
        cursor.execute(
            f"INSERT INTO {table} (email, password, salt) VALUES (%s, %s, %s)",
            (email, hashed_password, salt)
        )
        connection.commit()
        print(json.dumps({'success': True, 'message': '注册成功'}))
        
    except Error as e:
        print(json.dumps({'success': False, 'message': f'注册错误: {str(e)}'}))
    finally:
        cursor.close()
        connection.close()


def login(user_type, email, password):
    """用户登录"""
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        # 根据用户类型选择表
        table = 'students' if user_type == 'student' else 'teachers'

        # 获取用户信息
        cursor.execute(
            f"SELECT password, salt FROM {table} WHERE email = %s",
            (email,)
        )
        result = cursor.fetchone()
        
        if result:
            stored_password, stored_salt = result
            # 验证密码
            if verify_password(stored_salt, stored_password, password):
                print(json.dumps({'success': True, 'message': '登录成功'}))
                return
        
        print(json.dumps({'success': False, 'message': '邮箱或密码错误'}))

    except Error as e:
        print(json.dumps({'success': False, 'message': f'登录错误: {str(e)}'}))
    finally:
        cursor.close()
        connection.close()




if __name__ == "__main__":
    # 确保数据库表已创建
    init_database()
    
    # 解析命令行参数
    if len(sys.argv) < 4:
        print(json.dumps({'success': False, 'message': '参数不足'}))
        sys.exit(1)
        
    action = sys.argv[1]
    user_type = sys.argv[2]  # student or teacher
    email = sys.argv[3]
    password = sys.argv[4] if len(sys.argv) > 4 else None
    
    if action == "register" and password:
        register(user_type, email, password)
    elif action == "login" and password:
        login(user_type, email, password)
    else:
        print(json.dumps({'success': False, 'message': '无效的操作'}))

