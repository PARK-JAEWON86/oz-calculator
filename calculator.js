document.addEventListener("DOMContentLoaded", function () {
  // ───────── 변수 선언 ─────────
  let currentInput = "";
  let firstNumber = null;
  let operator = null;
  var history = []; // var 키워드로 선언
  let memory = 0;

  // ───────── DOM 참조 ─────────
  const calculatorEl = document.querySelector(".calculator");
  const displayEl = document.getElementById("display");
  let resultEl = document.getElementById("result");
  const buttons = document.querySelector(".buttons");

  // 히스토리 컨테이너: calculator 전체 커버
  const historyContainer = document.createElement("div");
  historyContainer.id = "history-container";
  calculatorEl.appendChild(historyContainer);

  // ───────── 유틸 함수 ─────────
  function updateDisplay(text) {
    if (text.length > 8) text = text.slice(0, 8);
    displayEl.textContent = text;
  }

  function showError(msg) {
    renderHistoryBubble(`Error: ${msg}`, true);
  }

  // ───────── 말풍선 생성 & 위치 계산 ─────────
  // text: 표시할 문자열, isError: 에러면 true
  function renderHistoryBubble(text, isError = false) {
    const bubble = document.createElement("div");
    bubble.className = "history-bubble";
    if (isError) bubble.classList.add("error");
    bubble.textContent = text;

    // position:absolute 준비 (left/top 은 나중에 재설정)
    bubble.style.position = "absolute";
    bubble.style.left = "0px";
    bubble.style.top = "0px";

    // 일단 DOM 에 붙여야 offsetHeight 를 알 수 있습니다
    historyContainer.appendChild(bubble);

    // 디스플레이 기준 위치 계산
    const rect = displayEl.getBoundingClientRect();
    const calcRect = calculatorEl.getBoundingClientRect();
    const dx = rect.width / 2;
    const dy = rect.height / 2;
    const baseLeft = rect.right - calcRect.left + dx;
    const baseTop = rect.top - calcRect.top - dy;

    // 지금 붙은 말풍선의 index (0부터)
    const idx = historyContainer.children.length - 1;
    // 말풍선 높이 + 간격 4px
    const h = bubble.offsetHeight;
    const gap = 4;

    // 최종 좌표
    bubble.style.left = `${baseLeft}px`;
    bubble.style.top = `${baseTop + idx * (h + gap)}px`;
  }

  // ───────── 핵심 기능 함수 ─────────
  function appendNumber(n) {
    if (!/^[0-9]$/.test(n) && n !== ".") {
      showError("유효한 숫자를 입력하세요.");
      return;
    }
    currentInput += n;
    updateDisplay(currentInput || "0");
  }

  function setOperator(nextOp) {
    // 매핑: HTML 버튼기호 → JS 연산자
    const opMap = { "×": "*", "÷": "/", "−": "-" };
    const jsOp = opMap[nextOp] || nextOp;

    // 체이닝: 이미 첫번째 숫자와 operator가 있고, 새 operator 앞에 입력값이 있으면
    if (operator !== null && currentInput !== "") {
      // 중간 연산 수행
      const second = Number(currentInput);
      let interim;
      switch (operator) {
        case "+":
          interim = firstNumber + second;
          break;
        case "-":
          interim = firstNumber - second;
          break;
        case "*":
          interim = firstNumber * second;
          break;
        case "/":
          if (second === 0) {
            showError("0으로 나눌 수 없습니다.");
            return;
          }
          interim = firstNumber / second;
          break;
      }
      firstNumber = interim;
      updateDisplay(String(interim));
    } else if (currentInput !== "") {
      firstNumber = Number(currentInput);
    }
    // 준비
    operator = jsOp;
    currentInput = "";
  }

  function calculate() {
    if (firstNumber === null || operator === null) {
      showError("계산할 수 없습니다.");
      return;
    }
    const second = Number(currentInput || displayEl.textContent);
    if (isNaN(second)) {
      showError("숫자 변환 오류");
      return;
    }
    if (operator === "/" && second === 0) {
      showError("0으로 나눌 수 없습니다.");
      return;
    }

    let result;
    switch (operator) {
      case "+":
        result = firstNumber + second;
        break;
      case "-":
        result = firstNumber - second;
        break;
      case "*":
        result = firstNumber * second;
        break;
      case "/":
        result = firstNumber / second;
        break;
    }

    history.push({ firstNumber, operator, second, result });
    console.log(JSON.stringify(history));

    updateDisplay(String(result));
    renderHistoryBubble(`${firstNumber} ${operator} ${second} = ${result}`);

    // 리셋
    firstNumber = result;
    operator = null;
    currentInput = "";
  }

  // ───────── 전체 지우기 함수 ─────────
  function clearAll() {
    currentInput = "";
    firstNumber = null;
    operator = null;
    updateDisplay("0");

    // history 말풍선까지 모두 지우기
    historyContainer.innerHTML = "";
  }
  // ───────── 버튼 클릭 핸들러 ─────────
  buttons.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    if (btn.dataset.number !== undefined) appendNumber(btn.dataset.number);
    else if (btn.dataset.operator) setOperator(btn.dataset.operator);
    else if (btn.dataset.action) {
      if (btn.dataset.action === "equals") calculate();
      if (btn.dataset.action === "clear") clearAll();
    }
  });

  // ───────── 키보드 입력 핸들러 ─────────
  document.addEventListener("keydown", (e) => {
    const k = e.key;

    if (/^[0-9]$/.test(k) || k === ".") {
      appendNumber(k);
    } else if (["+", "-", "*", "/"].includes(k)) {
      setOperator(k);
    } else if (k === "Enter") {
      e.preventDefault();
      calculate();
    } else if (k === "Backspace") {
      e.preventDefault();
      // 한 글자씩만 지우기, 마지막 글자면 0으로
      if (currentInput.length > 1) {
        currentInput = currentInput.slice(0, -1);
      } else {
        currentInput = "";
      }
      updateDisplay(currentInput || "0");

      // ► 여기서는 말풍선을 지우지 않습니다!
    } else if (k === "Delete" || k === "Escape") {
      e.preventDefault();
      // Delete(Del)와 Escape(ESC)만 전체 클리어
      clearAll();
    }
  });
  // ───────── 다크모드 토글 ─────────
  const btnDark = document.querySelector(".led-green");
  const btnLight = document.querySelector(".led-red");
  const gLab = btnDark.parentElement.querySelector(".led-label");
  const rLab = btnLight.parentElement.querySelector(".led-label");

  function updateIndicators(theme) {
    if (theme === "dark") {
      document.documentElement.classList.add("dark-mode");
      gLab.classList.replace("empty", "filled");
      rLab.classList.replace("filled", "empty");
    } else {
      document.documentElement.classList.remove("dark-mode");
      rLab.classList.replace("empty", "filled");
      gLab.classList.replace("filled", "empty");
    }
  }
  function setTheme(theme) {
    updateIndicators(theme);
    localStorage.setItem("theme", theme);
  }
  (function () {
    let s = localStorage.getItem("theme");
    if (!s)
      s = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    setTheme(s);
  })();
  btnDark.addEventListener("click", () => setTheme("dark"));
  btnLight.addEventListener("click", () => setTheme("light"));

  updateDisplay("0");
});

/// ───────── 물결(ripple) 함수 ─────────
function createRipple(btn, x, y) {
  const circle = document.createElement("span");
  circle.classList.add("ripple");
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  circle.style.width = circle.style.height = `${size}px`;
  circle.style.left = `${x - rect.left - size / 2}px`;
  circle.style.top = `${y - rect.top - size / 2}px`;
  btn.appendChild(circle);
  setTimeout(() => circle.remove(), 600);
}

// ───────── 클릭 시 물결(ripple) 적용 ─────────
document.querySelectorAll(".btn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    createRipple(btn, e.clientX, e.clientY);
  });
});

// ───────── 키보드 입력 핸들러 (ripple 포함) ─────────
document.addEventListener("keydown", (e) => {
  const k = e.key;
  let btn = null;

  if (/^[0-9]$/.test(k)) {
    appendNumber(k);
    btn = document.querySelector(`.btn.num[data-number="${k}"]`);
  } else if (k === ".") {
    appendNumber(k);
    btn = document.querySelector(".btn.decimal");
  } else if (["+", "-", "*", "/"].includes(k)) {
    setOperator(k);
    const map = { "*": "×", "/": "÷", "-": "−" };
    const sym = map[k] || k;
    btn = document.querySelector(`.btn.operator[data-operator="${sym}"]`);
  } else if (k === "Enter") {
    e.preventDefault();
    calculate();
    btn = document.querySelector(".btn.equals");
  } else if (k === "Delete" || k === "Escape") {
    e.preventDefault();
    clearAll();
    btn = document.querySelector(".btn.clear");
  } else if (k === "Backspace") {
    e.preventDefault();
    if (currentInput.length > 1) currentInput = currentInput.slice(0, -1);
    else currentInput = "";
    updateDisplay(currentInput || "0");
    return; // Backspace는 ripple 생략
  }

  if (btn) {
    // 버튼 중앙 좌표 계산
    const r = btn.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    createRipple(btn, cx, cy);
  }
});
