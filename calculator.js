document.addEventListener("DOMContentLoaded", function () {
  let displayValue = "0";
  let firstOperand = null;
  let operator = null;
  let waitingForSecondOperand = false;

  const displayEl = document.getElementById("display");
  const buttons = document.querySelector(".buttons");
  const themeIndicator = document.getElementById("themeIndicator");

  // 디스플레이 업데이트 함수 (8자리까지만)
  function updateDisplay() {
    // 소수점 포함 8글자 제한
    if (displayValue.length > 8) {
      displayValue = displayValue.slice(0, 8);
    }
    displayEl.textContent = displayValue;
  }

  // 숫자 입력 (9자리 초과 입력 방지)
  function inputNumber(n) {
    if (waitingForSecondOperand) {
      displayValue = n;
      waitingForSecondOperand = false;
    } else {
      if (displayValue.replace(".", "").length >= 9 && n !== ".") {
        return; // 9자리(소수점 제외) 넘으면 무시
      }
      if (displayValue === "0" && n !== ".") {
        displayValue = n;
      } else if (n === "." && displayValue.includes(".")) {
        return;
      } else {
        displayValue += n;
      }
    }
    updateDisplay();
  }

  // 연산자 처리
  function handleOperator(nextOperator) {
    const inputValue = parseFloat(displayValue);
    if (operator && waitingForSecondOperand) {
      operator = nextOperator;
      return;
    }
    if (firstOperand === null) {
      firstOperand = inputValue;
    } else if (operator) {
      const result = performCalculation[operator](firstOperand, inputValue);
      displayValue = String(result).slice(0, 9); // 연산 결과도 9자리 제한
      firstOperand = result;
    }
    operator = nextOperator;
    waitingForSecondOperand = true;
    updateDisplay();
  }

  const performCalculation = {
    "+": (a, b) => a + b,
    "−": (a, b) => a - b,
    "×": (a, b) => a * b,
    "÷": (a, b) => (b === 0 ? "Error" : a / b),
  };

  function handleEquals() {
    if (!operator || waitingForSecondOperand) return;
    const inputValue = parseFloat(displayValue);
    const result = performCalculation[operator](firstOperand, inputValue);
    displayValue = String(result).slice(0, 9);
    firstOperand = result;
    operator = null;
    waitingForSecondOperand = false;
    updateDisplay();
  }

  function handleClear() {
    displayValue = "0";
    firstOperand = null;
    operator = null;
    waitingForSecondOperand = false;
    updateDisplay();
  }

  // 버튼 클릭 처리
  buttons.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    if (btn.dataset.number !== undefined) {
      inputNumber(btn.dataset.number);
      return;
    }
    if (btn.dataset.operator) {
      handleOperator(btn.dataset.operator);
      return;
    }
    if (btn.dataset.action === "equals") {
      handleEquals();
      return;
    }
    if (btn.dataset.action === "clear") {
      handleClear();
      return;
    }
    // (퍼센트, sqrt, ± 등 미구현)
  });

  // 키보드 입력 처리
  document.addEventListener("keydown", (e) => {
    const k = e.key;
    if (/^[0-9]$/.test(k)) {
      inputNumber(k);
    } else if (k === ".") {
      inputNumber(k);
    } else if (["+", "-", "*", "/"].includes(k)) {
      const map = { "*": "×", "/": "÷", "-": "−" };
      handleOperator(map[k] || k);
    } else if (k === "Enter" || k === "=") {
      handleEquals();
    } else if (k === "Backspace" || k.toLowerCase() === "c") {
      handleClear();
    }
  });

  updateDisplay();

  // ---- LED 인디케이터 클릭 시 다크/라이트 테마 토글 ----

  // 테마 설정 함수
  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }

  // 진입 시 테마 적용
  (function () {
    let savedTheme = localStorage.getItem("theme");
    if (!savedTheme) {
      savedTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    setTheme(savedTheme);
  })();

  // 인디케이터 클릭 → 테마 토글
  if (themeIndicator) {
    themeIndicator.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme");
      setTheme(current === "dark" ? "light" : "dark");
    });
  }
});
