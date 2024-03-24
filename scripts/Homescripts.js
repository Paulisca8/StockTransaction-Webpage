//  初始价格 用于计算当日涨跌幅
var baseData = {
    "601398": 4.74,"600519": 1701,"600276": 48.06,"600309": 86.72,"600009": 47.37,"603288": 63.98,"600048": 12.83,"600585": 25.6,
    "600028": 6.09,"600588": 19.43,"300347": 86.81,"300750": 224.09,"300059": 15.1,"300024": 15.3,"300498": 17.28,"300760": 314.71,
    "300015": 28.27,"300295": 13.33,"300288": 19.55,"300002": 10.87,"000069": 4.71,"002507": 23.97,"002714": 42.84, "000651": 34.34,
    "000858": 168.2,"002415": 34.95,"002179": 43.12,"000776": 15.02,"002511": 12.07,"002007": 22.03
};
// 代码与名称映射
var StockNames = {
  "601398": "工商银行","600519": "贵州茅台","600276": "恒瑞医药","600309": "万华化学","600009": "上海机场","603288": "海天味业","600048": "保利发展",
  "600585": "海螺水泥","600028": "中国石化","600588": "用友网络","300347": "泰格医药","300750": "宁德时代","300059": "东方财富","300024": "机器人",
  "300498": "温氏股份","300760": "迈瑞医疗","300015": "爱尔眼科","300295": "三六五网","300288": "朗玛信息","300002": "神州泰岳","000069": "华侨城A",
  "002507": "涪陵榨菜","002714": "牧原股份","000651": "格力电器","000858": "五粮液","002415": "海康威视","002179": "中航光电","000776": "广发证券",
  "002511": "中顺洁柔","002007": "华兰生物"
};
// 记录当前价
var result={};
// 记录当前用户交易记录
var records={};
// ATTENTION:保证刷新后仍能保持原有选择
var stockType="all"
// ATTENTION:检查是否需要进行状态切换
var hasSwitchedState = false;

// 更新倒计时并获取股票数据
function update() {
    var countdownElement1 = document.getElementById("countdown1");
    var timeElement1 = document.getElementById("time1");
    var countdownElement2 = document.getElementById("countdown2");
    var timeElement2 = document.getElementById("time2");
    var countdownTime = 5; // 初始倒计时时间，单位：秒
    // 创建定时器，每秒更新倒计时时间
    var countdownInterval = setInterval(function() {
        // 检查 sessionStorage 中的登录状态 ATTENTION:此前为local 区分二者
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
        timeElement1.textContent = "当前时间：" + currentTime;
        countdownElement1.innerText = "刷新倒计时："+countdownTime+"秒";
        timeElement2.textContent = "当前时间：" + currentTime;
        countdownElement2.innerText = "刷新倒计时："+countdownTime+"秒";
        // 如果倒计时时间为0 停止定时器 并重新获取股价
        if (countdownTime === 0) {
            clearInterval(countdownInterval);
            getMarketPrice();
            if(isLoggedIn === 'true') // 若登录 刷新持仓收益
            {
                var name=sessionStorage.getItem("username");
                getInventory(name);
            }
            setTimeout(update, 0); // 重新执行update函数
        } 
    }, 1000);
}

// 获取当前价格并展示
function getMarketPrice() {
    $.ajax({
        type: "get",
        url: "http://127.0.0.1:12345/getMarketPrice",
        dataType: "json",
        success: function(Result) {
            $("#MarketPrice tbody").empty();            
            result=Result;
            showMarketPrice(stockType);
        },
        error:function() {
            alert("请检查服务器是否已启动");    
            sessionStorage.clear(); // ATTENTION:清空 sessionStorage 中的所有信息
            window.close();
        }
    });
}

// 表格展示当前价格 支持根据type筛选
function showMarketPrice(type) {
  var html = '<tr><th>股票代码</th><th>股票名称</th><th>最新价格</th><th>当日涨跌幅</th><th>当日涨跌价</th></tr>';
  for (var i = 0; i < result.length; i++) {
    var stock = result[i];
    var code = stock.Code;
    var name = stock.Name;
    var price = stock.Price;
    
    if (
      (type === "沪市" && code.startsWith("6")) ||
      (type === "深市" && code.startsWith("3")) ||
      (type === "创业板" && code.startsWith("0")) ||
      (type === "all")
    ) {
      var basePrice = baseData[code];
      var changePercent = ((price - basePrice) / basePrice * 100).toFixed(2);
      var changeAmount = (price - basePrice).toFixed(2);
      
      // 生成带有链接的股票代码和股票名
      var codeLink = '<a href="Stock.html?code=' + code + '">' + code + '</a>';
      var nameLink = '<a href="Stock.html?code=' + code + '">' + name + '</a>';
      
      html += '<tr><td>' + codeLink + '</td><td>' + nameLink + '</td><td>' + price + '</td><td>' + changePercent + '%</td><td>' + changeAmount + '</td></tr>';
    }
  }
  $("#MarketPrice tbody").html(html);
}

// 股票搜索
function searchStock() {
  var stockCode = document.getElementById("stockCodeInput").value;
  if (stockCode !== "") {
      var url = "Stock.html?code=" + stockCode;
      window.location.href=url;
  }
}

// 由游客态转为登录态
function stateSwitchToIn()
{
    var name=sessionStorage.getItem("username");
    LoginHide();
    LoginShow(name);
    getTradeRecord(name);
    getInventory(name);
}
// 由登录态转为游客态
function stateSwitchToOut()
{
    LogoutShow();
    LogoutHide();
}
// 登录时 隐藏处理
function LoginHide() {
    var headerButtons = document.querySelector('.header-buttons');
    headerButtons.style.display = 'none';
    var loginItem = document.querySelector('#login-item');
    loginItem.style.display = 'none';
  }
// 登录时 展示处理
function LoginShow(username) {
  var userInfoElement = document.getElementById("welcome-name");
  userInfoElement.textContent = "欢迎，" + username;

  var logoutButton = document.getElementById('logout-button');
  logoutButton.style.display = 'flex';

  var transactionItem = document.querySelector('#transaction-item');
  transactionItem.style.display = 'flex';

  var personalItem = document.querySelector('#personal-item');
  personalItem.style.display = 'flex';
  
  var nameElement = document.getElementById('user-name');
  nameElement.textContent="用户名:"+username;
}
// 注销时 展示处理
function LogoutShow()
{
    var headerButtons = document.querySelector('.header-buttons');
    headerButtons.style.display = 'block';
    var loginItem = document.querySelector('#login-item');
    loginItem.style.display = 'flex';
}
// 注销时 隐藏处理
function LogoutHide(){
    var userInfoElement = document.querySelector(".user-info");
    userInfoElement.style.display='none';
  
    var transactionItem = document.querySelector('#transaction-item');
    transactionItem.style.display = 'none';
  
    var personalItem = document.querySelector('#personal-item');
    personalItem.style.display = 'none';
}

// 菜单栏显示
function toggleMenu() {
  const menuContainer = document.querySelector('.menu-container');
  const menuIcon = document.querySelector('.menu-button img');
  
  if (menuContainer.style.display === 'flex') {
    menuContainer.style.display = 'none';
    menuIcon.src = './images/menu-icon-left.svg';
    menuIcon.alt = '菜单按钮';
  } else {
    menuContainer.style.display = 'flex';
    menuIcon.src = './images/menu-icon-right.svg';
    menuIcon.alt = '关闭按钮';
  }
}

//  切换为股票行情
function toggleStockShow() {
    const stockShow = document.querySelector('.stock-show');
    stockShow.style.display = 'flex';
    const transactionDiv = document.querySelector('.transaction');
    transactionDiv.style.display = 'none';
    const personalDiv=document.querySelector('.personal');
    personalDiv.style.display='none';
}

// 切换为交易记录
function toggleTransaction()
{
    const stockShow = document.querySelector('.stock-show');
    stockShow.style.display = 'none';
    const transactionDiv = document.querySelector('.transaction');
    transactionDiv.style.display = 'flex';
    const personalDiv=document.querySelector('.personal');
    personalDiv.style.display='none';
}

// 切换为个人信息
function togglePersonal()
{
  const stockShow = document.querySelector('.stock-show');
  stockShow.style.display = 'none';
  const transactionDiv = document.querySelector('.transaction');
  transactionDiv.style.display = 'none';
  const personalDiv=document.querySelector('.personal');
  personalDiv.style.display='flex';

}

// 获取交易记录
function getTradeRecord(username) {
    var transactionTable = document.querySelector('.transaction table tbody');

    // 发起 HTTP 请求获取交易记录数据
    var url = 'http://127.0.0.1:12345/getTradeRecord?username=' + username;
    fetch(url)
      .then(response => response.json())
      .then(data => {
        // 清空交易记录表格
        transactionTable.innerHTML = '';
        records=data;
        // 遍历交易记录数据并动态创建表格行
        var balance = 1000000.00; // 初始余额
        data.forEach((record, index) => {
          var row = document.createElement('tr');
          row.innerHTML = `
            <td>${index + 1}</td>
            <td>${StockNames[record.Code]}</td>
            <td>${record.Code}</td>
            <td>${record.Direction === 0 ? '买入' : '卖出'}</td>
            <td>${record.Amount}</td>
            <td>${record.KnockPrice.toFixed(2)}</td>
            <td>${record.Price}</td>
            <td>${getTradeStateText(record.State)}</td>
            <td class="small-font">${record.TradeTime}</td>
            <td class="small-font">${record.No}</td>
          `;

          transactionTable.appendChild(row);
          //ATTENTION:不方便切换屏幕 采用读取交易记录的方式计算余额
          if (record.State === 2) {
            var amount = record.Amount; // 交易数量
            var knockPrice = record.KnockPrice.toFixed(2); // 交易价格
            var direction = record.Direction; // 交易方向
            // 根据交易方向进行余额更新
            if (direction === 0) {
              // 减去交易总额
              balance -= amount * knockPrice;
            } else if (direction === 1) {
              // 加上交易总额
              balance += amount * knockPrice;
            }
          }
          // 更新前端显示
          var balanceElement = document.getElementById("balance");
          balanceElement.innerHTML = "账户余额: " + balance.toFixed(2) + "元";
        });
      })
      .catch(error => {
        console.error('Error:', error);
      });
}

// 获取交易状态
function getTradeStateText(state) {
  switch (state) {
    case 1:
      return '委托成功'
    case 2: 
      return '交易成功';
    case 3:
      return '废单';
    case 4:
      return '账户余额不足';
    case 5:
        return '持仓余额不足';
    default:
      return '未知状态';
  }
}

// 获取持仓信息
function getInventory(username) {
  var url = "http://127.0.0.1:12345/getInventory?username=" + username;

  // 发起HTTP请求获取持仓信息
  fetch(url)
    .then(response => response.json())
    .then(data => {
      var stockTable = document.getElementById("stock-tab");

      // 清空表格内容（保留表头）
      while (stockTable.rows.length > 1) {
        stockTable.deleteRow(1);
      }

      // 循环遍历持仓信息，添加到表格中
      data.forEach(stock => {
        var row = stockTable.insertRow();

        // 添加股票代码单元格
        var codeCell = row.insertCell();
        codeCell.textContent = stock.Key;

        // 添加股票名称单元格（根据需要自行获取）
        var nameCell = row.insertCell();
        nameCell.textContent = StockNames[stock.Key];

        // 添加持仓量单元格
        var quantityCell = row.insertCell();
        quantityCell.textContent = stock.Value;

        var currentPriceCell = row.insertCell();
        var currentPrice;

        // 遍历result,找到result[i].Code===stock.Key,找出currentPriceCell.textContent = result[i].Price
        for (var i = 0; i < result.length; i++) {
          if (result[i].Code === stock.Key) {
            currentPrice= result[i].Price.toFixed(2);
            break; 
          }
        }
        currentPriceCell.textContent = currentPrice;

        // 计算持仓均价
        var averagePriceCell = row.insertCell();
        var totalAmount = 0;  // 持仓量
        var totalKnockPrice = 0;  // 总买入价
        var totalBuyAmount = 0; // 总买入量

        //找到该股的成交记录
        for (var i = 0; i < records.length; i++) {
          if (records[i].Code === stock.Key & records[i].State===2) {
            if (records[i].Direction === 0) {
              totalAmount += records[i].Amount;
              totalBuyAmount += records[i].Amount;
              totalKnockPrice += records[i].KnockPrice * records[i].Amount;
            } else if (records[i].Direction === 1) {
              totalAmount -= records[i].Amount;
            }
          }
        }
        var averagePrice=0;
        if(totalAmount!=0&&totalBuyAmount!=0)
        averagePrice = (totalKnockPrice / totalBuyAmount).toFixed(2);
        averagePriceCell.textContent = averagePrice;

        // 计算持仓盈亏
        var ProfitCell = row.insertCell();
        ProfitCell.textContent = ((currentPrice-averagePrice)*totalAmount).toFixed(2);

      });
    })
    .catch(error => {
      console.log("获取持仓信息失败:", error);
    });
}

// 注销
function logout(){
  sessionStorage.clear();
  location.reload();
}

window.onload = function() {
    getMarketPrice(); // 先检查服务器是否已启动
    var countdownElement = document.getElementById("countdown1");
    var timeElement = document.getElementById("time1");
    var countdownTime = 5; // 初始倒计时时间，单位：秒
    var currentTime = new Date().toLocaleTimeString('en-US', { hour12: false });
    timeElement.textContent = "当前时间：" + currentTime;
    countdownElement.innerText = "刷新倒计时："+countdownTime+"秒";
    update();
};