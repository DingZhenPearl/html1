class StudentNavbar extends HTMLElement {
    constructor() {
      super();
    }
  
    connectedCallback() {
      this.innerHTML = `
        <div class="sidebar">
          <h2 id="userEmail">加载中...</h2>
          <a href="/student/student.html">主页</a>
          <a href="/student/exams/exams.html">习题集</a>
          <a onclick="explainProgrammingConcepts()" href="#">编程概念讲解</a>
          <a onclick="caseAnalysis()" href="#">实战案例分析</a>
          <a href="/student/question/question.html">提问</a>
          <a onclick="troubleshooting()" href="#">疑难解答</a>
          <a onclick="learningBehaviorAnalysis()" href="#">学习行为分析</a>
          <a href="/student/aiChat/aiChat.html">AI对话</a>
          <a onclick="logout()" href="#">退出登录</a>
        </div>
        <style>
          .sidebar {
            width: 250px;
            background-color: #2c3e50;
            color: #ecf0f1;
            position: fixed;
            left: 0;
            top: 0;
            height: 100vh;
            padding: 20px;
            box-sizing: border-box;
            overflow-y: auto;
            z-index: 1000;
          }
  
          .sidebar h2 {
            text-align: center;
            margin-bottom: 20px;
          }
  
          .sidebar a {
            color: #ecf0f1;
            text-decoration: none;
            padding: 10px 15px;
            margin-bottom: 10px;
            border-radius: 4px;
            display: block;
            transition: background-color 0.3s;
          }
  
          .sidebar a:hover {
            background-color: #34495e;
          }
        </style>
      `;
      
      this.initializeNavbar();
    }
    
    initializeNavbar() {
      const userEmail = localStorage.getItem('userEmail');
      if (userEmail) {
        const userEmailElement = this.querySelector('#userEmail');
        if (userEmailElement) {
          userEmailElement.textContent = userEmail;
        }
      }
    }
  }
  
  // 定义全局函数
  window.logout = function() {
    localStorage.removeItem('userEmail');
    window.location.href = '/logIn/logIn.html';
  };
  
  // 定义其他导航栏功能函数
  window.explainProgrammingConcepts = function() {
    // 编程概念讲解功能的实现
    alert('编程概念讲解功能尚未实现');
  };
  
  window.caseAnalysis = function() {
    // 实战案例分析功能的实现
    alert('实战案例分析功能尚未实现');
  };
  
  window.troubleshooting = function() {
    // 疑难解答功能的实现
    alert('疑难解答功能尚未实现');
  };
  
  window.learningBehaviorAnalysis = function() {
    // 学习行为分析功能的实现
    alert('学习行为分析功能尚未实现');
  };
  
  // 注册自定义元素
  customElements.define('student-navbar', StudentNavbar);