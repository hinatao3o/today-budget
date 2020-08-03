if (!localStorage['budget']) window.location.href = 'top.html';

const now   = new Date();       
const year  = now.getFullYear();
const month = now.getMonth()+1;
const date = now.getDate();
const d = new Date(year, month, 0).getDate();
// localStorage.clear();
// localStorage.setItem('budget', 50000);

const baseDailyBudget = Math.floor(localStorage['budget'] / d);
var todayBudget = 0;
var monthlyBudgets = {};
if (localStorage['monthlyBudgets']) {
  monthlyBudgets = JSON.parse(localStorage['monthlyBudgets']);

  if (!monthlyBudgets[year][month]) {
    saveMonthlyBudget(baseDailyBudget);
    monthlyBudgets = JSON.parse(localStorage['monthlyBudgets']);
  }
  todayBudget = saveTodayBudget(monthlyBudgets);
} else {
  saveMonthlyBudget(baseDailyBudget);
  
  monthlyBudgets = JSON.parse(localStorage['monthlyBudgets']);
  todayBudget = saveTodayBudget(monthlyBudgets);
}

document.getElementById('todayBudget').innerText = '¥' + todayBudget;
setCoins(todayBudget, baseDailyBudget);

// モーダル
const modalArea = document.getElementById('modalArea');
const openModal = document.getElementById('openModal');
const closeModal = document.getElementById('closeModal');
const modalBg = document.getElementById('modalBg');
const toggle = [openModal,closeModal,modalBg];

for(let i=0, len=toggle.length ; i<len ; i++){
  toggle[i].onclick = function() {
    modalArea.classList.toggle('is-show');
  };
}

// 1ヶ月の予算を保存
var form = document.querySelector("#budgetForm");
form.addEventListener("submit", function(event) {
  modalArea.classList.toggle('is-show');
  var useAmount = document.querySelector("#budget").value;
  saveBudgetAfterUse(monthlyBudgets, useAmount);
  todayBudget = monthlyBudgets[year][month]['dailyBudgets'][date];
  setCoins(todayBudget, baseDailyBudget);
});

// 今月の予算保存
function saveMonthlyBudget(dailyBudget) {
  const now   = new Date();       
  const year  = now.getFullYear();
  const month = now.getMonth()+1;
  const d     = new Date(year, month, 0).getDate();
  
  var dailyBudgets = {};
  for (var i = 1; i <= d; i++) {
    dailyBudgets[i] = dailyBudget;
  }
  
  var monthlyBudgets = {};
  if (localStorage['monthlyBudgets']) {
    var oldMonthlyBudgets = JSON.parse(localStorage['monthlyBudgets']);
    oldMonthlyBudgets[year][month] = {dailyBudgets};
    monthlyBudgets = oldMonthlyBudgets;
  } else {
    monthlyBudgets = {[year]: {[month]: {dailyBudgets}}}
  }

  localStorage.setItem('monthlyBudgets', JSON.stringify(monthlyBudgets));
}

// 今日の予算取得・保存
function saveTodayBudget(monthlyBudgets) {
  const now   = new Date();       
  const year  = now.getFullYear();
  const month = now.getMonth()+1;
  const date  = now.getDate();
  
  dailyBudgets = monthlyBudgets[year][month]['dailyBudgets'];
  for (var i = 1; i <= date; i++) {
    todayBudget += dailyBudgets[i];
    if (i != date) dailyBudgets[i] = 0;
  }
  if (todayBudget != dailyBudgets[date]) {
    dailyBudgets[date] = todayBudget;
    monthlyBudgets[year][month]['dailyBudgets'] = dailyBudgets;
    localStorage.setItem('monthlyBudgets', JSON.stringify(monthlyBudgets));
  }
  
  return todayBudget;
}

// 使用した金額を予算から引いて保存
async function saveBudgetAfterUse(monthlyBudgets, useAmount) {
  const now   = new Date();
  const year  = now.getFullYear();
  const month = now.getMonth()+1;
  const date  = now.getDate();
  var todayBudget = monthlyBudgets[year][month]['dailyBudgets'][date];

  monthlyBudgets[year][month]['dailyBudgets'][date] = monthlyBudgets[year][month]['dailyBudgets'][date] - useAmount;
  localStorage.setItem('monthlyBudgets', JSON.stringify(monthlyBudgets));

  const button = document.getElementById('openModal');
  const minus = new Promise((resolve, reject) => {
    var num = 1;
    setInterval(function(){
      if(num <= useAmount){
        document.getElementById('todayBudget').innerText = '¥' + (todayBudget - num);
        num++;
      } else {
        resolve();
      }
    }, 1);
  });
  
  button.style.opacity = 0;
  await minus;
  button.style.opacity = 1;
}


// コインの画像処理
function setCoins(todayBudget, baseDailyBudget) {
  const now  = new Date();       
  const date = now.getDate();
  
  for (var i = 1; i <= 3; i++) {
    var budgetEle = document.getElementById('budget'+i);
    // 初期化（削除）
    budgetEle.textContent = null;
    var coinEle = document.createElement('div');
        coinEle.className = 'coins';
        coinEle.id = 'coins'+i;
    budgetEle.appendChild(coinEle);
    
    var coinsEle = document.getElementById('coins'+i);
    var budget = todayBudget + baseDailyBudget * (i - 1);
    var cntCoins = 0;
    
    budgetEle.appendChild(document.createTextNode('¥'+budget));
    budgetEle.appendChild(document.createElement('br'));

    if (i == 1) {
      budgetEle.appendChild(document.createTextNode('今日'));
    } else {
      budgetEle.appendChild(document.createTextNode((date+i)+'日'));
    }
    
    // 半分でbr
    if (budget >= 10000) {
      var cntGolds = Math.floor(budget / 10000);
      var brPoint = Math.floor((cntGolds + Math.floor((budget - (cntGolds * 10000)) / 1000)) / 2)
    } else {
      var brPoint = Math.floor((budget / 1000) / 2)
    }

    // 1万円ごとに金のコインタワー
    limit = Math.floor(budget / 10000);
    if (budget >= 10000) {
      for (var j = 0; j < limit; j++) {
        budget = budget - 10000;
        var coinImg     = document.createElement('img');
            coinImg.src = './images/coin_medal_tate_gold.png';
            coinImg.alt = 'coin';
        coinsEle.appendChild(coinImg);

        cntCoins++;
        if (brPoint*2 >= 5 && brPoint == cntCoins) coinsEle.appendChild(document.createElement('br'));
      }
    }
    // 1000円ごとに銀のコインタワー
    for (var k = 1; k <= (budget / 1000); k++) {
      var coinImg     = document.createElement('img');
          coinImg.src = './images/coin_medal_tate_silver.png';
          coinImg.alt = 'coin';
      coinsEle.appendChild(coinImg);
      cntCoins++;

      if (brPoint*2 >= 5 && brPoint == cntCoins) coinsEle.appendChild(document.createElement('br'));
    }
  }
}
