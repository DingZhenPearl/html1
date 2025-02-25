import sys
import json
import mysql.connector
from datetime import datetime

# 数据库连接配置
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'sushiding',
    'database': 'chat_history'
}

def update_chat(chat_id, messages):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        UPDATE chat_history 
        SET messages = %s
        WHERE id = %s
    ''', (messages, chat_id))
    
    conn.commit()
    cursor.close()
    conn.close()
    
    return json.dumps({
        'success': True,
        'message': '聊天记录更新成功'
    })

def get_db_connection():
    return mysql.connector.connect(**DB_CONFIG)

def create_tables():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 创建聊天历史表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS chat_history (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_email VARCHAR(255) NOT NULL,
            title VARCHAR(255),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            messages JSON NOT NULL,
            INDEX (user_email)
        )
    ''')
    
    conn.commit()
    cursor.close()
    conn.close()

def get_chat_history(email):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute('''
        SELECT id, title, created_at, messages 
        FROM chat_history 
        WHERE user_email = %s 
        ORDER BY created_at DESC
    ''', (email,))
    
    history = cursor.fetchall()
    
    cursor.close()
    conn.close()
    
    # 处理datetime对象的JSON序列化
    for item in history:
        item['created_at'] = item['created_at'].isoformat()
        item['messages'] = json.loads(item['messages'])
    
    return json.dumps(history)

def save_chat(email, messages):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 从消息中提取前20个字符作为标题
    first_message = json.loads(messages)[1]['content']
    title = first_message[:20] + '...' if len(first_message) > 20 else first_message
    
    cursor.execute('''
        INSERT INTO chat_history (user_email, title, messages)
        VALUES (%s, %s, %s)
    ''', (email, title, messages))
    
    conn.commit()
    chat_id = cursor.lastrowid
    
    cursor.close()
    conn.close()
    
    return json.dumps({
        'success': True,
        'id': chat_id,
        'message': '聊天记录保存成功'
    })

def get_chat(chat_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute('''
        SELECT * FROM chat_history WHERE id = %s
    ''', (chat_id,))
    
    chat = cursor.fetchone()
    
    cursor.close()
    conn.close()
    
    if chat:
        chat['created_at'] = chat['created_at'].isoformat()
        chat['messages'] = json.loads(chat['messages'])
        return json.dumps(chat)
    else:
        return json.dumps({
            'success': False,
            'message': '未找到聊天记录'
        })

def delete_chat(chat_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        DELETE FROM chat_history WHERE id = %s
    ''', (chat_id,))
    
    conn.commit()
    cursor.close()
    conn.close()
    
    return json.dumps({
        'success': True,
        'message': '聊天记录删除成功'
    })

def main():
    if len(sys.argv) < 2:
        print(json.dumps({
            'success': False,
            'message': '缺少操作参数'
        }))
        return

    operation = sys.argv[1]
    
    try:
        if operation == 'create_tables':
            create_tables()
            print(json.dumps({
                'success': True,
                'message': '数据表创建成功'
            }))
            
        elif operation == 'get_history':
            if len(sys.argv) < 3:
                raise ValueError('缺少email参数')
            print(get_chat_history(sys.argv[2]))
            
        elif operation == 'save_chat':
            if len(sys.argv) < 4:
                raise ValueError('缺少必要参数')
            print(save_chat(sys.argv[2], sys.argv[3]))
            
        elif operation == 'get_chat':
            if len(sys.argv) < 3:
                raise ValueError('缺少chat_id参数')
            print(get_chat(sys.argv[2]))
            
        elif operation == 'delete_chat':
            if len(sys.argv) < 3:
                raise ValueError('缺少chat_id参数')
            print(delete_chat(sys.argv[2]))
            
        elif operation == 'update_chat':
            if len(sys.argv) < 4:
                raise ValueError('缺少必要参数')
            print(update_chat(sys.argv[2], sys.argv[3]))
            
        else:
            print(json.dumps({
                'success': False,
                'message': '未知操作'
            }))
            
    except Exception as e:
        print(json.dumps({
            'success': False,
            'message': str(e)
        }))

if __name__ == '__main__':
    main()