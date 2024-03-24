// 提交交易
function submitRegistration() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const repassword = document.getElementById('repassword').value;

  // 验证用户名长度
  if (username.length > 6) {
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

  // 验证密码和确认密码是否一致
  if (password !== repassword) {
    document.getElementById('repassword-warn').textContent = '两次输入的密码不一致';
    return;
  }
  var registerUrl = 'http://127.0.0.1:12345/regist?username=' + username + '&pwd=' + password;

  fetch(registerUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      if (data === true) {
        alert('注册成功');
        // 清空用户名和密码的填写信息
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        document.getElementById('repassword').value = '';
        window.location.href = 'Login.html';
      } else {
        alert('注册失败');
      }
    })
    .catch(function (error) {
      console.error('注册请求发生错误:', error);
    });
}

// 显示/隐藏密码
document.getElementById('show-password-toggle').addEventListener('change', function () {
  var passwordInput = document.getElementById('password');
  var repasswordInput = document.getElementById('repassword');

  if (this.checked) {
    passwordInput.type = 'text';
    repasswordInput.type = 'text';
  } else {
    passwordInput.type = 'password';
    repasswordInput.type = 'password';
  }
});

// 重新开始输入时 隐藏警告
function hideWarn(warnId) {
  document.getElementById(warnId).textContent = '';
}