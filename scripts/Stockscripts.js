var priceData = []; // 用于存储价格数据
var stockCode = getUrlParameter("code"); //从url获取当前页面股票代码
var chartType = 'all';
// 声明一个全局变量来保存 Chart 实例
let stockChart;
var hasSwitchedState = false;

// 请求获取对应的 Name
function getStockName() {
    $.ajax({
        type: "get",
        url: "http://127.0.0.1:12345/getMarketPrice",
        dataType: "json",
        success: function (marketData) {
            // 遍历找股票数据
            var flag = false;
            for (var i = 0; i < marketData.length; i++) {
                if (marketData[i].Code === stockCode) {
                    var name = marketData[i].Name;
                    document.getElementById("stock").innerText = "个股实时行情 - " + name + " - " + stockCode;
                    document.getElementById("name").innerText = name;
                    document.getElementById("code").innerText = stockCode;
                    flag = true;
                    break;
                }
            }
            if (flag === false) {
                alert("查找失败");
                window.close();
            }
        },
        error: function () {
            alert("查找失败");
            window.close();
        }
    });

}

// 获取该股价格
function getStockPrice() {
    $.ajax({
        type: "get",
        url: "http://127.0.0.1:12345/getStockPrice?code=" + stockCode,
        dataType: "json",
        success: function (result) {
            if (result.length > 0) {
                priceData = result;
                updateInfo();
                createStockChart(chartType);
            }
        }
    });
}

// 更新价格信息
function updateInfo() {
    var base = priceData[0];
    var now = priceData[priceData.length - 1];
    var change = ((now - base) / base * 100).toFixed(2);
    document.getElementById("price-now").innerHTML = now;
    document.getElementById("change-percent").innerHTML = change + "%";

    if (change > 0) {
        document.getElementById("price-now").style.color = "#d81e06";
        document.getElementById("change-percent").style.color = "#d81e06";
        document.getElementById("arrow").setAttribute("src", "./images/up.svg");
    } else {
        document.getElementById("price-now").style.color = "#0e932e";
        document.getElementById("change-percent").style.color = "#0e932e";
        document.getElementById("arrow").setAttribute("src", "./images/down.svg");
    }
}

// 创建该股价格曲线 可调整查看条数
function createStockChart(type) {
    const ctx = document.getElementById('stockChart').getContext('2d');
    chartType = type;
    var recentPriceData = priceData; 
    // ATTENTION:如果先前存在的 Chart 实例 则先销毁它 否则会报错:Canvas is already in use
    if (stockChart) {
        stockChart.destroy();
    }
    if (chartType === '50' || chartType === '100' || chartType === '200') {
        const chartTypeNum = parseInt(chartType);
        recentPriceData = priceData.slice(-chartTypeNum);
    }
    var currentTime = new Date();
    var labels = Array.from({ length: recentPriceData.length }, (_, i) => i + 1);

    // 将最右侧的 x 值设置为 currentTime 处理x轴数据
    labels[labels.length - 1] = currentTime.toLocaleTimeString('en-US', { hour12: false });

    // 以五秒的间隔往前回退作为其他数据点的 x 值 
    for (var i = labels.length - 2; i >= 0; i--) {
        currentTime.setSeconds(currentTime.getSeconds() - 5);
        labels[i] = currentTime.toLocaleTimeString('en-US', { hour12: false });
    }
    // 建立Chart
    stockChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: '股票价格',
                data: recentPriceData,
                borderColor: 'rgba(38,106,140, 1)',
                backgroundColor: 'rgba(38,106,140, 0.3)',
                fill: true,
                borderWidth: 2,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: '时间',
                        maxTicksLimit: 5
                    }
                },
                y: {
                    display: true,
                    max: 1.2 * recentPriceData[0],
                    min: 0.8 * recentPriceData[0],
                    title: {
                        display: true,
                        text: '价格'
                    }
                }
            },
            elements: {
                point: {
                    radius: 0
                },
                line: {
                    tension: 0.25
                }
            }
        }
    });
}

// 更新倒计时并获取股票数据
function update() {
    var countdownTime = 5; // 初始倒计时时间 单位：秒
    // 创建定时器，每秒更新倒计时时间
    var countdownInterval = setInterval(function () {
        // 检查 sessionStorage 中的登录状态
        var isLoggedIn = sessionStorage.getItem('isLoggedIn');
        // 根据登录状态进行界面调整
        if (isLoggedIn === 'true' && !hasSwitchedState) {
            stateSwitchToIn();
            hasSwitchedState = true;
        } else if (isLoggedIn === 'false' && hasSwitchedState) {
            stateSwitchToOut();
            hasSwitchedState = false;
        }
        countdownTime--;
        var currentTime = new Date().toLocaleTimeString('en-US', { hour12: false });
        var timeElement = document.getElementById("cur-time");
        timeElement.textContent = "当前时间：" + currentTime;
        // 如果倒计时时间为0，停止定时器，并重新获取股价
        if (countdownTime === 0) {
            clearInterval(countdownInterval);
            getStockPrice();
            setTimeout(update, 0); // 重新执行update函数
        }
    }, 1000);
}

// 切换为登录态
function stateSwitchToIn() {
    var transactionDiv = document.querySelector('.transaction-show');
    transactionDiv.style.display = 'flex';
    var headerButtons = document.querySelector('.header-buttons');
    headerButtons.style.display = 'none';
    var logoutButton = document.querySelector('.logout-button');
    logoutButton.style.display = 'flex';
    var userInfoElement = document.getElementById("welcome-name");
    userInfoElement.textContent = "欢迎，" + sessionStorage.getItem("username");
}
// 切换为注销态
function stateSwitchToOut() {
    var transactionDiv = document.querySelector('.transaction-show');
    transactionDiv.style.display = 'none';
    var headerButtons = document.querySelector('.header-buttons');
    headerButtons.style.display = 'flex';
    var logoutButton = document.querySelector('.logout-button');
    logoutButton.style.display = 'none';
    var userInfoElement = document.getElementById("welcome-name");
    userInfoElement.style.display = 'none';
}

// 提交交易记录
function submit() {
    var username = sessionStorage.getItem("username"); // 获取用户名
    var stockSymbol = stockCode;
    var priceInput = document.getElementById('price');
    var quantityInput = document.getElementById('quantity');
    var transactionType = document.getElementById('transaction-type').value;

    var price = parseFloat(priceInput.value); // 读入挂单价格
    var quantity = parseInt(quantityInput.value); // 读入买卖数量

    // 检查挂单价格
    if (priceInput.value === '') {
        var warnElement = document.getElementById('price-warn');
        warnElement.textContent = '请填写挂单价';
    }
    else if (!/^(\d+(\.\d{1,2})?)$/.test(price)) {
        var warnElement = document.getElementById('price-warn');
        warnElement.textContent = '最多精确到两位小数';
        priceInput.value = ''; // 清空已有的内容
        quantityInput.value = '';
        return false;
    }

    // 检查挂单数量
    if (quantityInput.value === '') {
        var warnElement = document.getElementById('quantity-warn');
        warnElement.textContent = '请填写挂单价';
    }
    else if (!/^\d+$/.test(quantity)) {
        var warnElement = document.getElementById('quantity-warn');
        warnElement.textContent = '挂单数量必须为正整数';
        priceInput.value = '';
        quantityInput.value = ''; // 清空已有的内容
        return false;
    }

    // 弹出确认框
    var confirmationMessage;
    if (transactionType === 'buy')
        confirmationMessage = '确定买入？ 挂单价：' + price + ' 买卖数量：' + quantity;
    else
        confirmationMessage = '确定卖出？ 挂单价：' + price + ' 买卖数量：' + quantity;

    if (confirm(confirmationMessage)) {
        // 用户点击了确认按钮，执行提交操作
        var url = 'http://127.0.0.1:12345/trade?username=' + username +
            '&code=' + stockSymbol +
            '&direction=' + transactionType +
            '&price=' + price +
            '&amount=' + quantity;

        fetch(url)
            .then(function (response) {
                return response.text();
            })
            .then(function (data) {
                // 处理返回的交易状态
                handleTransactionStatus(data);
            })
            .catch(function (error) {
                console.log('发生错误：', error);
            });
    }

    return false;
}

// 根据状态代码显示交易结果
function handleTransactionStatus(status) {
    switch (status) {
        case '1':
            alert('委托成功');
            break;
        case '2':
            alert('交易成功');
            break;
        case '3':
            alert('废单');
            break;
        case '4':
            alert('账户余额不足');
            break;
        case '5':
            alert('持仓余额不足');
            break;
        default:
            alert('未知状态');
            break;
    }
}

// 获取参数
function getUrlParameter(parameterName) {
    var urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(parameterName);
}

// 注销
function logout() {
    sessionStorage.clear();
    location.reload();
}

// 返回主页
function Home() {
    var url = "Home.html";
    window.location.href = url;
}

// 在页面加载完成后，开始获取股票价格
window.onload = function () {
    var currentTime = new Date().toLocaleTimeString('en-US', { hour12: false });
    var timeElement = document.getElementById('cur-time');
    timeElement.textContent = "当前时间：" + currentTime;
    getStockName();
    getStockPrice();
    update();
};