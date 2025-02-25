import subprocess
import os
import sys
import io

from flask import Flask, request, jsonify, send_from_directory
# 设置标准输出编码为 UTF-8
# sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
# sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

app = Flask(__name__)
port = 3000

# 允许跨域请求
from flask_cors import CORS
CORS(app)

# 定义根目录路径
static_root = r'd:\Microsoft VS Code\projects\web\html1\pages'



print("Python解释器路径:", sys.executable)
print("模块搜索路径:", sys.path)

# # 获取 server.py 所在目录的绝对路径
# current_dir = os.path.dirname(os.path.abspath(__file__))
# test_script_path = os.path.join(current_dir, 'test.py')





# # 运行Python脚本的路由
# @app.route('/run-script', methods=['POST'])
# def run_script():
#     try:
#         #result = subprocess.run(['python', 'test.py'], capture_output=True, text=True)
#         # 修改 subprocess.run 命令
#         result = subprocess.run(['python', test_script_path], capture_output=True, text=True)
#         if result.returncode != 0:
#             return jsonify({'status': 'error', 'result': result.stderr}), 500
#         else:
#             return jsonify({'status': 'success', 'result': result.stdout.strip()}), 200
#     except Exception as e:
#         return jsonify({'status': 'error', 'result': str(e)}), 500

@app.route('/run-script', methods=['POST'])
def run_script():
    try:
        # 获取 server.py 所在目录的绝对路径
        current_dir = os.path.dirname(os.path.abspath(__file__))
        test_script_path = os.path.join(current_dir, 'test.py')  # 正确路径
        
        # 执行脚本时使用绝对路径
        result = subprocess.run(['python', test_script_path], capture_output=True, text=True)
        
        if result.returncode != 0:
            return jsonify({'status': 'error', 'result': result.stderr}), 500
        else:
            return jsonify({'status': 'success', 'result': result.stdout.strip()}), 200
    except Exception as e:
        return jsonify({'status': 'error', 'result': str(e)}), 500


# 根路径返回特定文件
@app.route('/')
def index():
    return send_from_directory(os.path.join(static_root, 'teacher'), 'teacher.html')

# 通配符路由，处理其他所有路径
@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory(static_root, filename)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=port)
    print(f"Flask服务器运行在 http://localhost:{port}")