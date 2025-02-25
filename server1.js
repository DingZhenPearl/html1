const express = require('express');
const { spawn } = require('child_process');
const cors = require('cors');
const path = require('path'); // 引入 path 模块

const app = express();
const port = 3000;

// 允许跨域请求（如果前端和 Node.js 不同端口）
app.use(cors());



// 处理按钮点击的 POST 请求
app.post('/run-script', (req, res) => {
    // 执行 Python 脚本（假设脚本在项目根目录，名为 my_script.py）
    const pythonProcess = spawn('python', ['test.py']);

    let result = '';
    let error = '';

    // 捕获 Python 脚本的输出
    pythonProcess.stdout.on('data', (data) => {
        result += data.toString();
    });

    // 捕获错误信息
    pythonProcess.stderr.on('data', (data) => {
        error += data.toString();
    });

    // 脚本执行完毕后的处理
    pythonProcess.on('close', (code) => {
        if (code !== 0 || error) {
            res.status(500).json({ status: 'error', result: error });
        } else {
            res.json({ status: 'success', result: result.trim() });
        }
    });
});

// 托管整个前端项目根目录
const staticRoot = path.join('D:', 'Microsoft VS Code', 'projects', 'web', 'html1', 'pages');
app.use(express.static(staticRoot));
// 添加根路径路由
app.get('/', (req, res) => {
    res.sendFile(path.join(staticRoot, '/teacher/teacher.html')); // 使用 path 确保路径正确
});
// 启动服务器
app.listen(port, () => {
    console.log(`Node.js 服务器运行在 http://localhost:${port}`);
});