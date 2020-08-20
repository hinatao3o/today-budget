if (!localStorage['budget']) window.location.href = 'top.html';

const now   = new Date();
const year  = now.getFullYear();
const month = now.getMonth()+1;
const date  = now.getDate();
const d     = new Date(year, month, 0).getDate();

if (!localStorage['lastest']) document.getElementById('deleteLastest').style.display = 'none';

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

// 予算使用ーダル
const modalArea = document.getElementById('modalArea');
const openModal = document.getElementById('openModal');
const closeModal = document.getElementById('closeModal');
const modalBg = document.getElementById('modalBg');
const toggle = [openModal,closeModal,modalBg];

for (let i=0, len=toggle.length; i<len; i++) {
  toggle[i].onclick = function() {
    modalArea.classList.toggle('is-show');
  };
}

// 1ヶ月の予算を保存
var form = document.querySelector("#budgetForm");
form.addEventListener("submit", function(event) {
  modalArea.classList.toggle('is-show');
  document.querySelector("#budget").blur(); // 多重押下防止
  
  var useAmount = document.querySelector("#budget").value;
  if (!useAmount) return false;
  
  document.querySelector("#budget").value = '';
  saveBudgetAfterUse(monthlyBudgets, useAmount);
  todayBudget = monthlyBudgets[year][month]['dailyBudgets'][date];
  
  setCoins(todayBudget, baseDailyBudget);
});


// 予算額変更モーダル 
document.getElementById('changeBudget').value = localStorage['budget'];
const changeModalArea = document.getElementById('changeModalArea');
const openChangeModal = document.getElementById('openChangeModal');
const closeChangeModal = document.getElementById('closeChangeModal');
const changeModalBg = document.getElementById('changeModalBg');
const toggleChangeModal = [openChangeModal,closeChangeModal,changeModalBg];

for (let i=0, len=toggleChangeModal.length; i<len; i++) {
  toggleChangeModal[i].onclick = function() {
    changeModalArea.classList.toggle('is-show');
  };
}
// 1ヶ月の予算を変更
var changeForm = document.querySelector("#changeBudgetForm");
changeForm.addEventListener("submit", function(event) {
  changeModalArea.classList.toggle('is-show');
  document.querySelector("#changeBudget").blur(); // 多重押下防止
  
  var newBudget = document.querySelector("#changeBudget").value;
  if (!newBudget || newBudget < 1 || (newBudget == localStorage['budget'])) {
    alert('適切な値を入力してください。');
    return false;  
  }
  
  var unused = Object.values(monthlyBudgets[year][month]['dailyBudgets']).reduce(function(prev, current){return prev+current});
  var used = Math.floor(localStorage['budget'] / d)*d - unused;
  console.log(used);
  
  localStorage.setItem('budget', newBudget);
  var dailyBudget = Math.floor(localStorage['budget'] / d);
  saveMonthlyBudget(dailyBudget);

  monthlyBudgets = JSON.parse(localStorage['monthlyBudgets']); // 保存後取得し直す
  monthlyBudgets[year][month]['dailyBudgets'][date] = monthlyBudgets[year][month]['dailyBudgets'][date] - used; // 変更前までに使用した分を引いて保存
  localStorage.setItem('monthlyBudgets', JSON.stringify(monthlyBudgets));
});

// 直近の利用記録分の予算を戻す
document.getElementById('deleteLastest').onclick = function() {
  if (!localStorage['lastest']) return false;
  if (confirm('1つ前の利用記録分の予算を戻しますか？')) {
    monthlyBudgets[year][month]['dailyBudgets'][date] += Number(localStorage['lastest']);
    localStorage.setItem('monthlyBudgets', JSON.stringify(monthlyBudgets));
    localStorage.setItem('lastest', ''); // 直近の利用記録削除
    location.reload();
  }
};


// 今月の予算保存
function saveMonthlyBudget(dailyBudget) {
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


// 使用した金額を予算から引いて保存&アニメーション
async function saveBudgetAfterUse(monthlyBudgets, useAmount) {
  var todayBudget = monthlyBudgets[year][month]['dailyBudgets'][date];

  monthlyBudgets[year][month]['dailyBudgets'][date] = monthlyBudgets[year][month]['dailyBudgets'][date] - useAmount;
  localStorage.setItem('monthlyBudgets', JSON.stringify(monthlyBudgets)); // 使用後の予算保存
  localStorage.setItem('lastest', useAmount); // 直近保存

  var timeOverFlg = false;
  const button = document.getElementById('openModal');
  const minus = new Promise((resolve, reject) => {
    
    var cntUseAmount = useAmount;
    var tenThousandCnt = Math.floor(useAmount / 10000);
    cntUseAmount %= 10000;
    var fiveThousandCnt = Math.floor(cntUseAmount / 5000);
    cntUseAmount %= 5000;
    var thousandCnt = Math.floor(cntUseAmount / 1000);
    cntUseAmount %= 1000;
    var fiveHundredCnt = Math.floor(cntUseAmount / 500);
    cntUseAmount %= 500;
    var hundredCnt = Math.floor(cntUseAmount / 100);
    cntUseAmount %= 100;
    var fiftyCnt = Math.floor(cntUseAmount / 50);
    cntUseAmount %= 50;
    var tenCnt = Math.floor(cntUseAmount / 10);
    cntUseAmount %= 10;
    var fiveCnt = Math.floor(cntUseAmount / 5);
    cntUseAmount %= 5;
    
    var moneyCnt = {
      1    : cntUseAmount,
      5    : fiveCnt,
      10   : tenCnt,
      50   : fiftyCnt,
      100  : hundredCnt,
      500  : fiveHundredCnt,
      1000 : thousandCnt,
      5000 : fiveThousandCnt,
      10000: tenThousandCnt,
    }
    
    // お金のイラストを表示
    var fallMoneyArea = document.getElementById('fallMoneyArea');
    for (let key in moneyCnt) {
      for (var i = 0; i < moneyCnt[key]; i++) {
        var moneyImg        = document.createElement('img');
        moneyImg.src        = './images/money_'+key+'.png';
        moneyImg.id         = '1-'+i;
        moneyImg.style.left =  Math.floor(Math.random() * (document.documentElement.clientWidth+1))+'px';
        moneyImg.style.top  =  '-'+Math.floor(Math.random() * (101))+'px';
        if (key >= 1000) moneyImg.classList.add('bill');
        fallMoneyArea.appendChild(moneyImg);
      }
    }
    
    // お金のイラストふらせる
    var top = 0;
    var endFallFlg = false;
    var endCountDownFlg = false;
    var fallMoney = setInterval(function(){
      for (var i = 0; i < fallMoneyArea.children.length; i++) {
        fallMoneyArea.children[i].style.top = (parseFloat(fallMoneyArea.children[i].style.top) + 2.5) + "px";
      }
      if (document.documentElement.clientHeight < top) {
        clearInterval(fallMoney);
        fallMoneyArea.parentNode.replaceChild(fallMoneyArea.cloneNode(false), fallMoneyArea); // 削除
        if (endCountDownFlg) resolve();
        endFallFlg = true;
      }
      top += 2;
    }, 1);
    
    // カウントダウン
    var num = 1;
    countDown = setInterval(function(){
      if(num <= useAmount){
        document.getElementById('todayBudget').innerText = '¥' + (todayBudget - num);
        num++;
      } else {
        if (endFallFlg) resolve();
        endCountDownFlg = true;
      }
    }, 1);
    
    // 一定時間以上はカウントダウンをスキップ
    setTimeout(function(){
      timeOverFlg = true;
      clearInterval(countDown);
      resolve();
    }, 2500);
  });
  
  button.style.display = 'none'; // マイナス処理が終わるまでボタンを非表示
  await minus;
  if (timeOverFlg) document.getElementById('todayBudget').innerText = '¥' + monthlyBudgets[year][month]['dailyBudgets'][date];
  button.style.display = 'inline-block';
  document.getElementById('deleteLastest').style.display = 'inline-block';
}


// コインタワーの画像処理
function setCoins(todayBudget, baseDailyBudget) {
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
