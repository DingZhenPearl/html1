const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { spawn } = require('child_process');
const path = require('path'); // 引入 path 模块

const app = express();
const port = 3000;
const OpenAI = require('openai');

// 中间件
app.use(cors());
app.use(bodyParser.json());


// const openai = new OpenAI({
//     apiKey: 'bce-v3/ALTAK-OWYLnTjefANZQlbFAh7vJ/25eb5517b2ce511a6365fb94f4e6f2d62ab0eb45',    // 替换为实际的API密钥
//     baseURL: 'https://qianfan.baidubce.com/v2'   // 替换为实际的base URL
// });

// const openai = new OpenAI({//讯飞的dsr1api
//     apiKey: 'sk-EH6SkwANfyCPxXVMCe772815Eb4043D9A80eB6Ec8a8f1b5e',    // 替换为实际的API密钥
//     baseURL: 'https://maas-api.cn-huabei-1.xf-yun.com/v1'   // 替换为实际的base URL
// });

const openai = new OpenAI({
    apiKey: 'ipzotlGevNqQsafvWSXi:cooExiNRkHtQtHkkIqNk',    // 替换为实际的API密钥
    baseURL: 'https://spark-api-open.xf-yun.com/v1'   // 替换为实际的base URL
});

// 修改 /api/chat-message 路由
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
            // model: "deepseek-v3",
            //  model: "xdeepseekr1",

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





// 新增托管整个前端项目根目录
const staticRoot = path.join('D:', 'Microsoft VS Code', 'projects', 'web', 'html1', 'pages');
app.use(express.static(staticRoot));

// 添加根路径路由
app.get('/', (req, res) => {
    res.sendFile(path.join(staticRoot, '/logIn/logIn.html')); // 使用 path 确保路径正确
});

// 调用Python脚本处理数据库操作
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

// 登录路由
app.post('/login', async (req, res) => {
    try {
        const { user_type, email, password } = req.body;
        
        // 确保传入了用户类型
        if (!user_type) {
            return res.status(400).json({ success: false, message: '缺少用户类型' });
        }

        // 调用Python脚本验证登录
        const result = await executePythonScript('db_operations.py', [
            'login',
            user_type,  // Pass user_type to the Python script
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


// 注册路由
app.post('/register', async (req, res) => {
    try {
        const { user_type, email, password } = req.body;

        // 调用Python脚本处理注册
        const result = await executePythonScript('db_operations.py', [
            'register',
            user_type,  // Pass user_type to the Python script
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

// 启动服务器
app.listen(port, '0.0.0.0', () => {
    console.log(`服务器运行在 http://localhost:${port}`);
    console.log(`可通过本地网络IP访问：http://${getIPAddress()}:${port}`);
});

// 在文件底部添加获取本地IP的方法
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




//跳转python界面
// 处理按钮点击的 POST 请求，启动python脚本
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


///////////


// 新增聊天历史相关的路由
app.post('/api/chat-history', async (req, res) => {
    try {
        const { email } = req.body;
        const result = await executePythonScript('chat_history.py', [
            'get_history',
            email
        ]);
        res.json(result);
    } catch (error) {
        console.error('获取聊天历史失败:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

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

app.get('/api/chat/:id', async (req, res) => {
    try {
        const chatId = req.params.id;
        const result = await executePythonScript('chat_history.py', [
            'get_chat',
            chatId
        ]);
        res.json(result);
    } catch (error) {
        console.error('获取聊天记录失败:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

app.delete('/api/chat/:id', async (req, res) => {
    try {
        const chatId = req.params.id;
        const result = await executePythonScript('chat_history.py', [
            'delete_chat',
            chatId
        ]);
        res.json(result);
    } catch (error) {
        console.error('删除聊天记录失败:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});
// 添加更新聊天记录的路由
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
// 保留原有的服务器启动代码...




//////////////////////////////////
//以下用于question.html和answer.html

// 提交问题
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

// 获取学生的问题列表
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

// 获取所有问题（老师用）
app.get('/api/all-questions', async (req, res) => {
    try {
        const result = await executePythonScript('qa_operations.py', [
            'get_all_questions'
        ]);
        res.json(result);
    } catch (error) {
        console.error('获取所有问题失败:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

// 提交回答
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



// Add these new routes in server.js
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




// 学生追问路由
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











/////////////////////////////////