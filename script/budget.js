if (!localStorage.budget) window.location.href = 'top.html';

const now   = new Date();       
const year  = now.getFullYear();
const month = now.getMonth()+1;
const date = now.getDate();
const d = new Date(year, month, 0).getDate();
// localStorage.clear();
// localStorage.setItem('budget', 50000);

const baseDailyBudget = Math.floor(localStorage.budget / d);
var todayBudget = 0;
var monthlyBudgets = {};
if (localStorage.monthlyBudgets) {
  monthlyBudgets = JSON.parse(localStorage.monthlyBudgets);

  if (!monthlyBudgets[year][month]) {
    saveMonthlyBudget(baseDailyBudget, month, year);
    monthlyBudgets = JSON.parse(localStorage.monthlyBudgets);
  }
  todayBudget = getTodayBudget(monthlyBudgets, date, month, year);
} else {
  saveMonthlyBudget(baseDailyBudget, month, year);
  
  monthlyBudgets = JSON.parse(localStorage.monthlyBudgets);
  todayBudget = getTodayBudget(monthlyBudgets, date, month, year);
}

document.getElementById('todayBudget').innerText = '¥' + todayBudget;
setCoins(todayBudget, baseDailyBudget);

// 今月の予算保存
function saveMonthlyBudget(dailyBudget, month, year) {
  var dailyBudgets = {};
  for (var i = 1; i <= d; i++) {
    dailyBudgets[i] = dailyBudget;
  }
  
  var monthlyBudgets = {};
  if (localStorage.monthlyBudgets) {
    var oldMonthlyBudgets = JSON.parse(localStorage.monthlyBudgets);
    oldMonthlyBudgets[year][month] = {dailyBudgets};
    monthlyBudgets = oldMonthlyBudgets;
  } else {
    monthlyBudgets = {[year]: {[month]: {dailyBudgets}}}
  }

  localStorage.setItem('monthlyBudgets', JSON.stringify(monthlyBudgets));
}

// 今日の予算取得
function getTodayBudget(monthlyBudgets, date, month, year) {
  dailyBudgets = monthlyBudgets[year][month].dailyBudgets;
  for (var i = 1; i <= date; i++) {
    todayBudget += dailyBudgets[i];
  }
  
  return todayBudget;
}

// コインの画像処理
function setCoins(todayBudget, baseDailyBudget) {
  for (var i = 1; i <= 3; i++) {
    var budget = todayBudget + baseDailyBudget * (i - 1);
    var cntCoins = 0;
    
    document.getElementById('budget'+i).appendChild(document.createTextNode('¥'+budget));
    document.getElementById('budget'+i).appendChild(document.createElement('br'));

    if (i == 1) {
      document.getElementById('budget'+i).appendChild(document.createTextNode('今日'));
    } else {
      document.getElementById('budget'+i).appendChild(document.createTextNode((date+i)+'日'));
    }
    
    if (budget >= 10000) {
      var cntGolds = Math.floor(budget / 10000);
      var brPoint = Math.floor((cntGolds + Math.floor((budget - (cntGolds * 10000)) / 1000)) / 2)
    } else {
      var brPoint = Math.floor((budget / 1000) / 2)
    }
    var coins = document.getElementById('coins'+i);

    limit = Math.floor(budget / 10000);
    if (budget > 10000) {
      for (var j = 0; j < limit; j++) {
        budget = budget - 10000;
        var coinImg     = document.createElement('img');
            coinImg.src = './images/coin_medal_tate_gold.png';
            coinImg.alt = 'coin';
        coins.appendChild(coinImg);

        cntCoins++;
        if (brPoint*2 >= 5 && brPoint == cntCoins) coins.appendChild(document.createElement('br'));
      }
    }
    for (var k = 1; k <= (budget / 1000); k++) {
      var coinImg     = document.createElement('img');
          coinImg.src = './images/coin_medal_tate_silver.png';
          coinImg.alt = 'coin';
      coins.appendChild(coinImg);
      cntCoins++;

      if (brPoint*2 >= 5 && brPoint == cntCoins) coins.appendChild(document.createElement('br'));
    }
  }
}
