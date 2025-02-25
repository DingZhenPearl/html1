import mysql.connector
import json
import sys
from datetime import datetime

# 数据库连接配置
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'sushiding',
    'database': 'education_platform'
}

def get_db_connection():
    """建立数据库连接"""
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        return conn
    except mysql.connector.Error as err:
        print(json.dumps({
            'success': False,
            'message': f"数据库连接失败: {str(err)}"
        }))
        sys.exit(1)

def create_tables():
    """创建必要的数据表"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # 创建问题表
# 修改 create_tables 函数中的表结构
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS questions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) NOT NULL,
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                status ENUM('pending', 'answered') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                answer TEXT,
                answered_at TIMESTAMP NULL,
                follow_ups JSON  
            )
        """)
        
        conn.commit()
    except mysql.connector.Error as err:
        print(json.dumps({
            'success': False,
            'message': f"创建表失败: {str(err)}"
        }))
        sys.exit(1)
    finally:
        cursor.close()
        conn.close()

def submit_question(email, title, content):
    """提交新问题"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            INSERT INTO questions (email, title, content)
            VALUES (%s, %s, %s)
        """, (email, title, content))
        
        conn.commit()
        print(json.dumps({
            'success': True,
            'message': "问题提交成功"
        }))
    except mysql.connector.Error as err:
        print(json.dumps({
            'success': False,
            'message': f"提交问题失败: {str(err)}"
        }))
    finally:
        cursor.close()
        conn.close()

def get_student_questions(email):
    """获取特定学生的问题列表"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # 修改 get_student_questions 函数中的查询语句
        cursor.execute("""
            SELECT id, title, content, status, created_at, answer, answered_at, follow_ups
            FROM questions
            WHERE email = %s
            ORDER BY created_at DESC
        """, (email,))
        
        questions = cursor.fetchall()
        
        # 转换时间戳为字符串，以便JSON序列化
        for q in questions:
            q['created_at'] = q['created_at'].isoformat()
            if q['answered_at']:
                q['answered_at'] = q['answered_at'].isoformat()
        
        print(json.dumps({
            'success': True,
            'questions': questions
        }))
    except mysql.connector.Error as err:
        print(json.dumps({
            'success': False,
            'message': f"获取问题列表失败: {str(err)}"
        }))
    finally:
        cursor.close()
        conn.close()

def get_all_questions():
    """获取所有问题（教师用）"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # 修改 get_all_questions 函数中的查询语句
        cursor.execute("""
            SELECT id, email, title, content, status, created_at, answer, answered_at, follow_ups
            FROM questions
            ORDER BY created_at DESC
        """)
        
        questions = cursor.fetchall()
        
        # 转换时间戳为字符串，以便JSON序列化
        for q in questions:
            q['created_at'] = q['created_at'].isoformat()
            if q['answered_at']:
                q['answered_at'] = q['answered_at'].isoformat()
        
        print(json.dumps({
            'success': True,
            'questions': questions
        }))
    except mysql.connector.Error as err:
        print(json.dumps({
            'success': False,
            'message': f"获取问题列表失败: {str(err)}"
        }))
    finally:
        cursor.close()
        conn.close()

def submit_answer(question_id, answer):
    """提交问题的回答"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            UPDATE questions
            SET answer = %s,
                status = 'answered',
                answered_at = CURRENT_TIMESTAMP
            WHERE id = %s
        """, (answer, question_id))
        
        conn.commit()
        print(json.dumps({
            'success': True,
            'message': "回答提交成功"
        }))
    except mysql.connector.Error as err:
        print(json.dumps({
            'success': False,
            'message': f"提交回答失败: {str(err)}"
        }))
    finally:
        cursor.close()
        conn.close()


def delete_question(question_id):
    """删除未回答的问题"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # 先检查问题状态
        cursor.execute("""
            SELECT status FROM questions WHERE id = %s
        """, (question_id,))
        
        result = cursor.fetchone()
        if not result:
            print(json.dumps({
                'success': False,
                'message': "问题不存在"
            }))
            return
            
        if result[0] == 'answered':
            print(json.dumps({
                'success': False,
                'message': "已回答的问题不能删除"
            }))
            return
            
        cursor.execute("""
            DELETE FROM questions WHERE id = %s
        """, (question_id,))
        
        conn.commit()
        print(json.dumps({
            'success': True,
            'message': "问题删除成功"
        }))
    except mysql.connector.Error as err:
        print(json.dumps({
            'success': False,
            'message': f"删除问题失败: {str(err)}"
        }))
    finally:
        cursor.close()
        conn.close()

def update_question(question_id, title, content):
    """更新未回答的问题"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # 先检查问题状态
        cursor.execute("""
            SELECT status FROM questions WHERE id = %s
        """, (question_id,))
        
        result = cursor.fetchone()
        if not result:
            print(json.dumps({
                'success': False,
                'message': "问题不存在"
            }))
            return
            
        if result[0] == 'answered':
            print(json.dumps({
                'success': False,
                'message': "已回答的问题不能修改"
            }))
            return
            
        cursor.execute("""
            UPDATE questions 
            SET title = %s, content = %s
            WHERE id = %s
        """, (title, content, question_id))
        
        conn.commit()
        print(json.dumps({
            'success': True,
            'message': "问题更新成功"
        }))
    except mysql.connector.Error as err:
        print(json.dumps({
            'success': False,
            'message': f"更新问题失败: {str(err)}"
        }))
    finally:
        cursor.close()
        conn.close()

def submit_follow_up(question_id, content, is_teacher=False):
    """提交追问/追答"""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT follow_ups FROM questions WHERE id = %s", (question_id,))
        result = cursor.fetchone()
        follow_ups = []
        if result and result[0] is not None:
            try:
                follow_ups = json.loads(result[0])
            except json.JSONDecodeError:
                follow_ups = []

        new_entry = {
            "content": content,
            "user": "teacher" if is_teacher else "student",
            "time": datetime.now().isoformat()
        }
        follow_ups.append(new_entry)

        # 修复SQL更新语句
        cursor.execute("""
            UPDATE questions 
            SET follow_ups = %s,
                status = IF(%s = 1, 'answered', 'pending')
            WHERE id = %s
        """, (json.dumps(follow_ups), is_teacher, question_id))
        
        conn.commit()
        print(json.dumps({'success': True, 'message': "提交成功"}))
    except Exception as err:
        print(json.dumps({'success': False, 'message': f"操作失败: {str(err)}"}))
    finally:
        cursor.close()
        conn.close()


if __name__ == "__main__":
    # 确保数据表存在
    create_tables()
    
    # 获取命令行参数
    if len(sys.argv) < 2:
        print(json.dumps({
            'success': False,
            'message': "缺少操作参数"
        }))
        sys.exit(1)
    
    operation = sys.argv[1]
    
    # 根据操作类型调用相应的函数
    if operation == "submit_question":
        if len(sys.argv) != 5:
            print(json.dumps({
                'success': False,
                'message': "参数不足"
            }))
            sys.exit(1)
        submit_question(sys.argv[2], sys.argv[3], sys.argv[4])
    
    elif operation == "get_student_questions":
        if len(sys.argv) != 3:
            print(json.dumps({
                'success': False,
                'message': "参数不足"
            }))
            sys.exit(1)
        get_student_questions(sys.argv[2])
    
    elif operation == "get_all_questions":
        get_all_questions()
    
    elif operation == "submit_answer":
        if len(sys.argv) != 4:
            print(json.dumps({
                'success': False,
                'message': "参数不足"
            }))
            sys.exit(1)
        submit_answer(sys.argv[2], sys.argv[3])
    
    
    
    # Add to qa_operations.py main section
    elif operation == "delete_question":
        if len(sys.argv) != 3:
            print(json.dumps({
            'success': False,
            'message': "参数不足"
            }))
            sys.exit(1)
        delete_question(sys.argv[2])

    elif operation == "update_question":
        if len(sys.argv) != 5:
            print(json.dumps({
                'success': False,
                'message': "参数不足"
            }))
            sys.exit(1)
        update_question(sys.argv[2], sys.argv[3], sys.argv[4])
    
    
    
        # 添加到 qa_operations.py 的 main 部分
    elif operation == "submit_follow_up":
        if len(sys.argv) < 4:
            print(json.dumps({
                'success': False,
                'message': "参数不足"
            }))
            sys.exit(1)
        question_id = sys.argv[2]
        content = sys.argv[3]
        is_teacher = False
        if len(sys.argv) >= 5:
            is_teacher = sys.argv[4].lower() == 'true'
        submit_follow_up(question_id, content, is_teacher)
    
    
    
    
    else:
        print(json.dumps({
            'success': False,
            'message': "未知的操作类型"
        }))
        sys.exit(1)