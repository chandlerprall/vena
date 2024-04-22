import { expect } from 'chai';
import { Signal, afterUpdates } from '../build/signal.js';

it('allows accessing a value', () => {
  const signal = new Signal(10);
  expect(signal.value).to.equal(10);

  signal.value = 20;
  expect(signal.value).to.equal(20);
});

it('propagates changes to a listener', async () => {
  const signal = new Signal(10);
  const listener = fn();
  signal.on(listener);

  await afterUpdates();
  expect(listener.calls).to.have.length(0);

  signal.value = 20;

  await afterUpdates();
  expect(listener.calls).to.have.length(1);
  expect(listener.calls[0]).to.deep.equal([20]);
});

it('propagates changes to listeners', async () => {
  const signal = new Signal(10);
  const listener1 = fn();
  const listener2 = fn();
  signal.on(listener1);
  signal.on(listener2);

  await afterUpdates();
  expect(listener1.calls).to.have.length(0);
  expect(listener2.calls).to.have.length(0);

  signal.value = 20;

  await afterUpdates();
  expect(listener1.calls[0]).to.deep.equal([20]);
  expect(listener2.calls[0]).to.deep.equal([20]);
});

it('disconnects a listener', async () => {
  const signal = new Signal(10);
  const listener1 = fn();
  const listener2 = fn();
  signal.on(listener1);
  signal.on(listener2);


  signal.value = 20;

  await afterUpdates();
  expect(listener1.calls).to.have.length(1);
  expect(listener2.calls).to.have.length(1);

  signal.off(listener1);

  signal.value = 30;

  await afterUpdates();
  expect(listener1.calls).to.deep.equal([[20]]);
  expect(listener2.calls).to.deep.equal([[20], [30]]);
});

it('maps to a new signal', async () => {
  const signal = new Signal(10);
  const doubled = signal.map(value => value * 2);
  const listener = fn();
  doubled.on(listener);

  await afterUpdates();
  expect(listener.calls).to.have.length(0); // listeners are only called on updates

  signal.value = 20;

  await afterUpdates();
  expect(listener.calls).to.deep.equal([[40]]);
});

it('chained signal dirtiness and propagation', async () => {
  const signal = new Signal(10);
  const doubled = signal.map(value => value * 2);
  const cubed = doubled.map(value => value ** 3);

  expect(doubled.dirty).to.be.true;
  expect(cubed.dirty).to.be.true;

  expect(doubled.value).to.equal(20);
  expect(doubled.dirty).to.be.false;
  expect(cubed.dirty).to.be.true;

  expect(cubed.value).to.equal(8000);
  expect(doubled.dirty).to.be.false;
  expect(cubed.dirty).to.be.false;

  doubled.dirty = true;
  expect(doubled.dirty).to.be.true;
  expect(cubed.dirty).to.be.true;

  expect(cubed.value).to.equal(8000);
  expect(doubled.dirty).to.be.false;
  expect(cubed.dirty).to.be.false;

  signal.value = 20;

  expect(doubled.dirty).to.be.true;
  expect(cubed.dirty).to.be.true;

  expect(doubled.value).to.equal(40);
  expect(doubled.dirty).to.be.false;
  expect(cubed.dirty).to.be.true;

  expect(cubed.value).to.equal(64000);
  expect(doubled.dirty).to.be.false;
  expect(cubed.dirty).to.be.false;

  signal.value = 10;

  expect(doubled.dirty).to.be.true;
  expect(cubed.dirty).to.be.true;

  const listener = fn();
  cubed.on(listener);

  await afterUpdates();
  expect(doubled.dirty).to.be.true;
  expect(cubed.dirty).to.be.true;

  signal.value = 15;

  await afterUpdates();
  expect(doubled.dirty).to.be.false;
  expect(cubed.dirty).to.be.false;
  expect(listener.calls).to.deep.equal([[27000]]);
});

it('converts between signal & non-signal source(s)', async () => {
  const signalA = new Signal('a');
  const signalB = new Signal('b');

  const target = new Signal();
  const listener = fn();
  target.on(listener);

  await afterUpdates();
  expect(listener.calls).to.have.length(0);

  target.value = signalA;

  await afterUpdates();
  expect(listener.calls).to.deep.equal([['a']]);

  target.value = signalB;

  await afterUpdates();
  expect(listener.calls).to.deep.equal([['a'], ['b']]);

  target.value = Signal.signalValueArray(signalB, signalA);

  await afterUpdates();
  expect(listener.calls).to.deep.equal([['a'], ['b'], [['b', 'a']]]);

  target.value = 5;

  await afterUpdates();
  expect(listener.calls).to.deep.equal([['a'], ['b'], [['b', 'a']], [5]]);

  target.value = [1, 2, 3];

  await afterUpdates();
  expect(listener.calls).to.deep.equal([['a'], ['b'], [['b', 'a']], [5], [[1, 2, 3]]]);

  target.value = signalB;

  await afterUpdates();
  expect(listener.calls).to.deep.equal([['a'], ['b'], [['b', 'a']], [5], [[1, 2, 3]], ['b']]);
});

it('applies the transform', () => {
  const signal = new Signal(2, x => x * 2);
  expect(signal.value).to.equal(4);

  signal.value = 8;
  expect(signal.value).to.equal(16);

  const source = new Signal(0);
  signal.value = source;
  expect(signal.value).to.equal(0);

  source.value = 10;
  expect(signal.value).to.equal(20);
});

it('updates without getting stuck in a loop', async () => {
  const a = new Signal(1);
  const b = new Signal(a);
  const c = new Signal(b);
  const d = new Signal(c);
  const listener = fn(x => {
    a.value = x + 1;
  });
  d.on(listener);

  expect(a.value).to.equal(1);
  expect(b.dirty).to.be.true;
  expect(c.dirty).to.be.true;
  expect(d.dirty).to.be.true;

  expect(c.value).to.equal(1);
  expect(b.dirty).to.be.false;
  expect(c.dirty).to.be.false;
  expect(d.dirty).to.be.true;

  a.value = 2;
  expect(b.dirty).to.be.true;
  expect(c.dirty).to.be.true;
  expect(d.dirty).to.be.true;

  await afterUpdates();
  expect(listener.calls).to.deep.equal([[2]]);
  expect(a.value).to.equal(3);
  expect(b.dirty).to.be.true;
  expect(c.dirty).to.be.true;
  expect(d.dirty).to.be.true;

  a.value = 5;
  await afterUpdates();
  expect(listener.calls).to.deep.equal([[2], [5]]);
  expect(a.value).to.equal(6);
  expect(b.dirty).to.be.true;
  expect(c.dirty).to.be.true;
  expect(d.dirty).to.be.true;
  expect(d.value).to.equal(6);
  expect(b.dirty).to.be.false;
  expect(c.dirty).to.be.false;
  expect(d.dirty).to.be.false;
});

it('does not break propagation rules', async () => {
  const signal = new Signal(0);
  const listener = fn(() => { });

  signal.on(listener)
  signal.value = 1;
  signal.on(listener);

  await afterUpdates();
  expect(listener.calls).to.have.length(1);
  expect(listener.calls[0]).to.deep.equal([1]);
});

function it(name, test) {
  try {
    const result = test();
    if (result && result.then) {
      result
        .then(() => console.log(`✅ ${name}`))
        .catch(e => {
          console.error(`❌ ${name}`);
          console.error(e);
        });
    } else {
      console.log(`✅ ${name}`);
    }
  } catch (e) {
    console.error(`❌ ${name}`);
    console.error(e);
  }
}

function fn(callback = () => { }) {
  const func = (...values) => {
    func.calls.push(values);
    callback(...values);
  };
  func.calls = [];
  return func;
}