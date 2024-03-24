// 获取登录按钮元素
const loginButton = document.getElementById('login-button');

// 监听登录按钮的点击事件
loginButton.addEventListener('click', () => {
    // 获取用户名和密码输入框的值
    const username = document.getElementById('uname').value;
    const password = document.getElementById('passwd').value;
    // 验证用户名长度
    if (username.length > 6 ) {
    document.getElementById('username-warn').textContent = '用户名长度必须在6个字符以内';
    return;
    }

    // 验证用户名格式
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    document.getElementById('username-warn').textContent = '用户名只能包含字母、数字和下划线';
    return;
    }

    // 验证密码长度
    if (password.length < 3 || password.length > 10) {
    document.getElementById('password-warn').textContent = '密码长度必须在3到10个字符之间';
    return;
    }

    // 验证密码格式
    if (!/^[a-zA-Z0-9_]+$/.test(password)) {
    document.getElementById('password-warn').textContent = '密码只能包含字母、数字和下划线';
    return;
    }

    // 构建登录请求的 URL
    const loginUrl = `http://127.0.0.1:12345/login?username=${username}&pwd=${password}`;

    // 发起登录请求
    fetch(loginUrl)
        .then(response => response.json())
        .then(data => {
            // 根据返回结果进行处理
            if (data === true) {
                // 登录成功
                // 保存登录状态和用户名到本地存储
                sessionStorage.setItem('isLoggedIn', 'true');
                sessionStorage.setItem('username', username);
                // 跳转到 Home.html
                window.location.href = 'Home.html';
            } else {
                // 登录失败
                alert('登录失败');
                // 清空用户名和密码输入框的内容
                document.getElementById('uname').value = '';
                document.getElementById('passwd').value = '';
            }
        })
        .catch(error => {
            console.error('登录请求发生错误:', error);
        });
});

// 跳转到注册页面
function redirectToRegister() {
    window.location.href = "Register.html";
    return false; // 阻止默认的链接行为
  }