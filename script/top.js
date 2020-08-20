if (localStorage.budget) window.location.href = 'index.html';

(function () {
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
    var input = document.querySelector("#budget");
    localStorage.setItem('budget', input.value);
  });
}());
