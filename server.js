/**
 * 教学互动平台服务器
 * 包含用户认证、AI聊天、问答系统等功能
 */

// 导入所需模块
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { spawn } = require('child_process');
const path = require('path');
const OpenAI = require('openai');

// 初始化Express应用
const app = express();
const port = 3000;

// ===== 中间件配置 =====
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type']
}));
app.use(bodyParser.json());

// 前端静态文件托管
const staticRoot = path.join('D:', 'Microsoft VS Code', 'projects', 'web', 'html1', 'pages');
app.use(express.static(staticRoot));

// ===== 工具函数 =====

/**
 * 获取本地网络IP地址
 * @returns {string} IP地址
 */
function getIPAddress() {
    const interfaces = require('os').networkInterfaces();
    for (const devName in interfaces) {
        const iface = interfaces[devName];
        for (let i = 0; i < iface.length; i++) {
            const alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                return alias.address;
            }
        }
    }
    return '0.0.0.0';
}

/**
 * 执行Python脚本并返回结果
 * @param {string} scriptName - Python脚本文件名
 * @param {Array} args - 传递给Python脚本的参数
 * @returns {Promise} 脚本执行结果的Promise对象
 */
function executePythonScript(scriptName, args) {
    return new Promise((resolve, reject) => {
        const pythonProcess = spawn('python', [scriptName, ...args]);
        let result = '';
        let error = '';

        pythonProcess.stdout.on('data', (data) => {
            result += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            error += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                reject(error || 'Python脚本执行失败');
            } else {
                try {
                    resolve(JSON.parse(result));
                } catch {
                    resolve(result);
                }
            }
        });
    });
}

// ===== AI聊天服务配置 =====
const openai = new OpenAI({
    apiKey: 'ipzotlGevNqQsafvWSXi:cooExiNRkHtQtHkkIqNk',
    baseURL: 'https://spark-api-open.xf-yun.com/v1'
});

// ===== 路由配置 =====

// --- 基本路由 ---
app.get('/', (req, res) => {
    res.sendFile(path.join(staticRoot, '/logIn/logIn.html'));
});

// --- 用户认证路由 ---
/**
 * 用户登录
 * 接收用户类型、邮箱和密码，验证用户身份
 */
app.post('/login', async (req, res) => {
    try {
        const { user_type, email, password } = req.body;
        
        if (!user_type) {
            return res.status(400).json({ success: false, message: '缺少用户类型' });
        }

        const result = await executePythonScript('db_operations.py', [
            'login',
            user_type,
            email,
            password
        ]);

        if (result.success) {
            res.json({ success: true, message: '登录成功' });
        } else {
            res.status(401).json({ success: false, message: '邮箱或密码错误' });
        }
    } catch (error) {
        console.error('登录错误:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

/**
 * 用户注册
 * 接收用户类型、邮箱和密码，创建新用户
 */
app.post('/register', async (req, res) => {
    try {
        const { user_type, email, password } = req.body;

        const result = await executePythonScript('db_operations.py', [
            'register',
            user_type,
            email,
            password
        ]);

        if (result.success) {
            res.json({ success: true, message: '注册成功' });
        } else {
            res.status(400).json({ success: false, message: result.message || '注册失败' });
        }
    } catch (error) {
        console.error('注册错误:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

// --- AI聊天相关路由 ---
/**
 * 处理聊天消息
 * 接收用户消息，调用AI模型生成回复
 */
app.post('/api/chat-message', async (req, res) => {
    try {
        const { message, messageHistory } = req.body;
        
        // 构建完整的对话历史
        const messages = messageHistory.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.content
        }));
        
        // 添加当前用户消息
        messages.push({ role: "user", content: message });
        
        const completion = await openai.chat.completions.create({
            model: "lite",
            messages: messages,
        });

        const aiResponse = completion.choices[0].message.content;
        res.json({ success: true, message: aiResponse });
    } catch (error) {
        console.error('OpenAI API调用失败:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

/**
 * 获取用户聊天历史记录
 */
app.post('/api/chat-history', async (req, res) => {
    try {
        const { email } = req.body;
        const result = await executePythonScript('chat_history.py', ['get_history', email]);
        res.json(result);
    } catch (error) {
        console.error('获取聊天历史失败:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

/**
 * 保存新的聊天记录
 */
app.post('/api/save-chat', async (req, res) => {
    try {
        const { email, messages } = req.body;
        const result = await executePythonScript('chat_history.py', [
            'save_chat',
            email,
            JSON.stringify(messages)
        ]);
        res.json(result);
    } catch (error) {
        console.error('保存聊天记录失败:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

/**
 * 获取特定聊天记录详情
 */
app.get('/api/chat/:id', async (req, res) => {
    try {
        const chatId = req.params.id;
        const result = await executePythonScript('chat_history.py', ['get_chat', chatId]);
        res.json(result);
    } catch (error) {
        console.error('获取聊天记录失败:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

/**
 * 删除特定聊天记录
 */
app.delete('/api/chat/:id', async (req, res) => {
    try {
        const chatId = req.params.id;
        const result = await executePythonScript('chat_history.py', ['delete_chat', chatId]);
        res.json(result);
    } catch (error) {
        console.error('删除聊天记录失败:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

/**
 * 更新特定聊天记录
 */
app.post('/api/update-chat', async (req, res) => {
    try {
        const { chatId, messages } = req.body;
        const result = await executePythonScript('chat_history.py', [
            'update_chat',
            chatId,
            JSON.stringify(messages)
        ]);
        res.json(result);
    } catch (error) {
        console.error('更新聊天记录失败:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

// --- 问答系统相关路由 ---
/**
 * 学生提交问题
 */
app.post('/api/submit-question', async (req, res) => {
    try {
        const { email, title, content } = req.body;
        const result = await executePythonScript('qa_operations.py', [
            'submit_question',
            email,
            title,
            content
        ]);
        res.json(result);
    } catch (error) {
        console.error('提交问题失败:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

/**
 * 获取特定学生的问题列表
 */
app.get('/api/questions/:email', async (req, res) => {
    try {
        const email = req.params.email;
        const result = await executePythonScript('qa_operations.py', [
            'get_student_questions',
            email
        ]);
        res.json(result);
    } catch (error) {
        console.error('获取问题列表失败:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

/**
 * 获取所有学生问题（供教师使用）
 */
app.get('/api/all-questions', async (req, res) => {
    try {
        const result = await executePythonScript('qa_operations.py', ['get_all_questions']);
        res.json(result);
    } catch (error) {
        console.error('获取所有问题失败:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

/**
 * 教师提交回答
 */
app.post('/api/submit-answer', async (req, res) => {
    try {
        const { questionId, answer } = req.body;
        const result = await executePythonScript('qa_operations.py', [
            'submit_answer',
            questionId.toString(),
            answer
        ]);
        res.json(result);
    } catch (error) {
        console.error('提交回答失败:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

/**
 * 删除问题
 */
app.delete('/api/question/:id', async (req, res) => {
    try {
        const questionId = req.params.id;
        const result = await executePythonScript('qa_operations.py', [
            'delete_question',
            questionId
        ]);
        res.json(result);
    } catch (error) {
        console.error('删除问题失败:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

/**
 * 更新问题
 */
app.put('/api/question/:id', async (req, res) => {
    try {
        const questionId = req.params.id;
        const { title, content } = req.body;
        const result = await executePythonScript('qa_operations.py', [
            'update_question',
            questionId,
            title,
            content
        ]);
        res.json(result);
    } catch (error) {
        console.error('更新问题失败:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

/**
 * 学生提交追问
 */
app.post('/api/follow-up', async (req, res) => {
    try {
        const { questionId, content } = req.body;
        const result = await executePythonScript('qa_operations.py', [
            'submit_follow_up',
            questionId.toString(),
            content
        ]);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

/**
 * 教师回复追问
 */
app.post('/api/follow-up-answer', async (req, res) => {
    try {
        const { questionId, content } = req.body;
        const result = await executePythonScript('qa_operations.py', [
            'submit_follow_up',
            questionId.toString(),
            content,
            'true' 
        ]);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

// --- 运行Python脚本路由 ---
/**
 * 执行Python脚本测试
 */
app.post('/run-script', (req, res) => {
    const pythonProcess = spawn('python', ['test.py']);
    let result = '';
    let error = '';

    pythonProcess.stdout.on('data', (data) => {
        result += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        error += data.toString();
    });

    pythonProcess.on('close', (code) => {
        if (code !== 0 || error) {
            res.status(500).json({ status: 'error', result: error });
        } else {
            res.json({ status: 'success', result: result.trim() });
        }
    });
});

// ===== 启动服务器 =====
app.listen(port, '0.0.0.0', () => {
    console.log(`服务器运行在 http://localhost:${port}`);
    console.log(`可通过本地网络IP访问：http://${getIPAddress()}:${port}`);
});