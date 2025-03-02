class TeacherNavbar extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.innerHTML = `
      <div class="sidebar">
          <h2 id="userEmail">加载中...</h2>
          <a onclick="returnToMainPage()" href="#">主页</a>
          <a href="#">学员管理</a>
          <a href="#">成绩统计管理</a>
          <a href="#">权限管理</a>
          <a href="#">系统设置</a>
          <a href="#">学生学习行为分析</a>
          <a href="/teacher/answer/answer.html">学生提问管理</a>
          <a href="/teacher/python/python.html">教学数据管理</a>
          <a href="#">数据分析可视化</a>
          <a href="#">教学反馈报告</a>
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
window.returnToMainPage = function() {
  window.location.href = "/teacher/teacher.html";
};

window.logout = function() {
  localStorage.removeItem('userEmail');
  window.location.href = '/logIn/logIn.html';
};

// 注册自定义元素
customElements.define('teacher-navbar', TeacherNavbar);