import { element as createElement, registerComponent } from 'vena';

registerComponent('calculator-app', ({ element, render, state }) => {
  const { input, equation, answer } = state({
    input: '0',
    equation: '',
    answer: '',
  });

  const updateAnswer = () => {
    let nextAnswer = '';
    if (equation.value && input.value) {
      try {
        nextAnswer = eval(`${equation.value} ${input.value}`);
      } catch (e) {
      }
    }
    answer.value = nextAnswer;
  };
  input.on(updateAnswer);
  equation.on(updateAnswer);

  element.addEventListener('calculator-app-digit', ({ detail: digit }) => {
    if (input.value.match(/^0((?!\.)|$)/)) {
      input.value = digit;
    } else {
      input.value += digit;
    }
  });

  element.addEventListener('calculator-app-dot', () => {
    if (input.value.indexOf('.') === -1) {
      input.value += '.';
    }
  });

  element.addEventListener('calculator-app-operator', ({ detail: operator }) => {
    if (input.value === '' || input.value === '0') return;

    const nextPart = `${input.value} ${operator}`;
    equation.value += `${equation.value.length ? ' ' : ''}${nextPart}`;
    input.value = '';
  });

  element.addEventListener('calculator-app-back', () => {
    if (input.value) {
      input.value = input.value.slice(0, -1);
      if (input.value.length === 0) {
        if (equation.value.length) {
          const parts = equation.value.match(/\S+/g);
          const lastPart = parts.at(-1);
          if (lastPart.match(/\d/)) {
            input.value = lastPart;
            equation.value = parts.slice(0, -1).join(' ');
          }
        } else {
          input.value = '0';
        }
      }
    } else {
      const parts = equation.value.match(/\S+/g);
      input.value = parts.at(-2);
      equation.value = parts.slice(0, -2).join(' ');
    }
  });

  render`
<style>
.calculator {
  display: grid;
  font-family: monospace;
  grid-template-columns: 25% 25% 25% 25%;
  grid-template-areas:
    "result result result result"
    "digits digits digits operations"
    "digits digits digits operations"
    "digits digits digits operations"
    "digits digits digits operations";
}

.result {
  grid-area: result;
  background-color: #ccc;
  padding: 5px;
  font-size: 24px;
  text-align: right;;

  .answer {
    height: 1.2em;
    color: #666;
  }
}

.digits {
  grid-area: digits;

  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
}

.operations {
  grid-area: operations
}

button {
  width: 100%;
  aspect-ratio: 1/0.8;
  border-radius: 2px;
  font-size: 20px;
  font-family: monospace;
  border: 1px solid #ccc;
  background: #fff;
  cursor: pointer;
}
</style>

<section class="calculator">
  <div class="result">
    <div class="answer">${answer}</div>
    <div class="equation">${equation} ${input}</div>
  </div>

  <div class="digits">
    ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(
    (digit) => createElement`<button onClick=${() => element.emit('digit', digit.toString())}>${digit}</button>`,
  )
  }
    <button onClick=${() => element.emit('dot')}>.</button>
    <button onClick=${() => element.emit('back')}>🔙</button>
  </div>

  <div class="operations">
    <button onClick=${() => element.emit('operator', '+')}>+</button>
    <button onClick=${() => element.emit('operator', '-')}>-</button>
    <button onClick=${() => element.emit('operator', '*')}>*</button>
    <button onClick=${() => element.emit('operator', '/')}>/</button>
  </div>
</section>
	`;
});
