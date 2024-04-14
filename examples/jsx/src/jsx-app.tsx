import { registerComponent } from 'vena';

registerComponent('jsx-app', ({ render, attributes, state }) => {
    const { count } = state({ count: 0 });

    render(
        <div>
            <h1>Counter</h1>
            <button onclick={() => count.value--}>-</button>
            <span>&nbsp;{count}&nbsp;</span>
            <button onclick={() => count.value++}>+</button>
        </div>
    );
});
