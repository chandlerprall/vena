import jsdom from 'jsdom-global';
import { expect } from 'chai';
jsdom(undefined, { url: 'http://localhost' });

async function insertion() {
  const { ConnectedNode } = await import('../build/runtime.js');

  it('inserts strings as a text node', () => {
    const wrapper = document.createElement('div');
    new ConnectedNode('Hello, World!').connect(wrapper);
    expect(wrapper.childNodesWithoutComments).to.have.lengthOf(1);
    expect(wrapper.childNodesWithoutComments[0])
      .to.be.instanceOf(Text)
      .to.have.property('textContent', 'Hello, World!');
  });

  it('inserts numbers as a text node', () => {
    const wrapper = document.createElement('div');
    new ConnectedNode(123.45).connect(wrapper);
    expect(wrapper.childNodesWithoutComments).to.have.lengthOf(1);
    expect(wrapper.childNodesWithoutComments[0])
      .to.be.instanceOf(Text)
      .to.have.property('textContent', '123.45');
  });

  it('inserts booleans as a text node', () => {
    const falseWrapper = document.createElement('div');
    new ConnectedNode(false).connect(falseWrapper);
    expect(falseWrapper.childNodesWithoutComments).to.have.lengthOf(1);
    expect(falseWrapper.childNodesWithoutComments[0])
      .to.be.instanceOf(Text)
      .to.have.property('textContent', 'false');

    const trueWrapper = document.createElement('div');
    new ConnectedNode(true).connect(trueWrapper);
    expect(trueWrapper.childNodesWithoutComments).to.have.lengthOf(1);
    expect(trueWrapper.childNodesWithoutComments[0])
      .to.be.instanceOf(Text)
      .to.have.property('textContent', 'true');
  });

  it('inserts an HTMLElement directly', () => {
    const wrapper = document.createElement('div');
    const element = document.createElement('span');
    new ConnectedNode(element).connect(wrapper);
    expect(wrapper.childNodesWithoutComments).to.have.lengthOf(1);
    expect(wrapper.childNodesWithoutComments[0]).to.equal(element);
  });

  it('inserts an array of nodes', () => {
    const wrapper = document.createElement('div');
    const element = document.createElement('span');
    new ConnectedNode(['first', element, 'last']).connect(wrapper);
    expect(wrapper.childNodesWithoutComments).to.have.lengthOf(3);
    expect(wrapper.childNodesWithoutComments[0])
      .to.be.instanceOf(Text)
      .to.have.property('textContent', 'first');
    expect(wrapper.childNodesWithoutComments[1]).to.equal(element);
    expect(wrapper.childNodesWithoutComments[2])
      .to.be.instanceOf(Text)
      .to.have.property('textContent', 'last');
  });
}

async function replace() {
  const { ConnectedNode } = await import('../build/runtime.js');

  it('replaces with a text node', () => {
    const container = document.createElement('div');
    const wrapper = document.createElement('div');
    container.append(wrapper);
    new ConnectedNode('Hello, World!').connect(wrapper, { replace: true });
    expect(wrapper).to.have.property('parentNode', null);
    expect(container.childNodesWithoutComments).to.have.lengthOf(1);
    expect(container.childNodesWithoutComments[0])
      .to.be.instanceOf(Text)
      .to.have.property('textContent', 'Hello, World!');
  });

  it('replaces with an HTMLElement', () => {
    const container = document.createElement('div');
    const wrapper = document.createElement('div');
    container.append(wrapper);
    const element = document.createElement('span');
    new ConnectedNode(element).connect(wrapper, { replace: true });
    expect(wrapper).to.have.property('parentNode', null);
    expect(container.childNodesWithoutComments).to.have.lengthOf(1);
    expect(container.childNodesWithoutComments[0]).to.equal(element);
  });

  it('replaces with an array of nodes', () => {
    const container = document.createElement('div');
    const wrapper = document.createElement('div');
    container.append(wrapper);
    const element = document.createElement('span');
    new ConnectedNode(['first', element, 'last']).connect(wrapper, { replace: true });

    expect(wrapper).to.have.property('parentNode', null);
    expect(container.childNodesWithoutComments).to.have.lengthOf(3);
    expect(container.childNodesWithoutComments[0])
      .to.be.instanceOf(Text)
      .to.have.property('textContent', 'first');
    expect(container.childNodesWithoutComments[1]).to.equal(element);
    expect(container.childNodesWithoutComments[2])
      .to.be.instanceOf(Text)
      .to.have.property('textContent', 'last');
  });
}

async function disconnect() {
  const { ConnectedNode } = await import('../build/runtime.js');

  it('disconnects an inserted text node', () => {
    const wrapper = document.createElement('div');
    const node = new ConnectedNode('Hello, World!').connect(wrapper);
    node.disconnect();
    expect(wrapper.childNodes).to.have.lengthOf(0);
  });

  it('disconnects a replaced text node', () => {
    const container = document.createElement('div');
    const wrapper = document.createElement('div');
    container.append(wrapper);
    const node = new ConnectedNode('Hello, World!').connect(wrapper, { replace: true });
    node.disconnect();
    expect(container.childNodes).to.have.lengthOf(0);
  });

  it('disconnects an inserted element', () => {
    const wrapper = document.createElement('div');
    const element = document.createElement('span');
    const node = new ConnectedNode(element).connect(wrapper);
    node.disconnect();
    expect(wrapper.childNodes).to.have.lengthOf(0);
  });

  it('disconnects a replaced element', () => {
    const container = document.createElement('div');
    const wrapper = document.createElement('div');
    container.append(wrapper);
    const element = document.createElement('span');
    const node = new ConnectedNode(element).connect(wrapper, { replace: true });
    node.disconnect();
    expect(container.childNodes).to.have.lengthOf(0);
  });

  it('disconnects an inserted array of nodes', () => {
    const wrapper = document.createElement('div');
    const element = document.createElement('span');
    const node = new ConnectedNode(['first', element, 'last']).connect(wrapper);
    node.disconnect();
    expect(wrapper.childNodes).to.have.lengthOf(0);
  });

  it('disconnects a replaced array of nodes', () => {
    const container = document.createElement('div');
    const wrapper = document.createElement('div');
    container.append(wrapper);
    const element = document.createElement('span');
    const node = new ConnectedNode(['first', element, 'last']).connect(wrapper, { replace: true });
    node.disconnect();
    expect(container.childNodes).to.have.lengthOf(0);
  });
};

async function update() {
  const { ConnectedNode } = await import('../build/runtime.js');

  it('updates an inserted text node', () => {
    const wrapper = document.createElement('div');
    const node = new ConnectedNode('Hello, World!').connect(wrapper);
    node.value = 'Updated, World!';
    expect(wrapper.childNodesWithoutComments).to.have.lengthOf(1);
    expect(wrapper.childNodesWithoutComments[0])
      .to.be.instanceOf(Text)
      .to.have.property('textContent', 'Updated, World!');
  });

  it('updates a replacing text node', () => {
    const container = document.createElement('div');
    const wrapper = document.createElement('div');
    container.append(wrapper);
    const node = new ConnectedNode('Hello, World!').connect(wrapper, { replace: true });
    node.value = 'Updated, World!';
    expect(wrapper).to.have.property('parentNode', null);
    expect(container.childNodesWithoutComments).to.have.lengthOf(1);
    expect(container.childNodesWithoutComments[0])
      .to.be.instanceOf(Text)
      .to.have.property('textContent', 'Updated, World!');
  });

  it('updates an inserted element', () => {
    const wrapper = document.createElement('div');
    const element = document.createElement('span');
    const node = new ConnectedNode(element).connect(wrapper);
    const element2 = document.createElement('p');
    node.value = element2;
    expect(wrapper.childNodesWithoutComments).to.have.lengthOf(1);
    expect(wrapper.childNodesWithoutComments[0]).to.equal(element2);
  });

  it('updates a replacing element', () => {
    const container = document.createElement('div');
    const wrapper = document.createElement('div');
    container.append(wrapper);
    const element = document.createElement('span');
    const node = new ConnectedNode(element).connect(wrapper, { replace: true });
    const element2 = document.createElement('p');
    node.value = element2;
    expect(wrapper).to.have.property('parentNode', null);
    expect(container.childNodesWithoutComments).to.have.lengthOf(1);
    expect(container.childNodesWithoutComments[0]).to.equal(element2);
  });

  it('updates an inserted array of nodes', () => {
    const wrapper = document.createElement('div');
    const element = document.createElement('span');
    const node = new ConnectedNode(['first', element, 'second']).connect(wrapper);
    const element2 = document.createElement('p');
    node.value = ['third', 'fourth', element2];
    expect(wrapper.childNodesWithoutComments).to.have.lengthOf(3);
    expect(wrapper.childNodesWithoutComments[0])
      .to.be.instanceOf(Text)
      .to.have.property('textContent', 'third');
    expect(wrapper.childNodesWithoutComments[1])
      .to.be.instanceOf(Text)
      .to.have.property('textContent', 'fourth');
    expect(wrapper.childNodesWithoutComments[2]).to.equal(element2);
  });

  it('updates a replacing array of nodes', () => {
    const container = document.createElement('div');
    const wrapper = document.createElement('div');
    container.append(wrapper);
    const element = document.createElement('span');
    const node = new ConnectedNode(element).connect(wrapper, { replace: true });
    const element2 = document.createElement('p');
    node.value = ['third', 'fourth', element2];
    expect(container.childNodesWithoutComments).to.have.lengthOf(3);
    expect(container.childNodesWithoutComments[0])
      .to.be.instanceOf(Text)
      .to.have.property('textContent', 'third');
    expect(container.childNodesWithoutComments[1])
      .to.be.instanceOf(Text)
      .to.have.property('textContent', 'fourth');
    expect(container.childNodesWithoutComments[2]).to.equal(element2);
  });

  it('updates an inserted text node to array of nodes', () => {
    const container = document.createElement('div');
    const wrapper = document.createElement('div');
    container.append(wrapper);
    const node = new ConnectedNode('Hello, World!').connect(wrapper);
    const element = document.createElement('p');
    node.value = ['here are my thoughts:', element];
    expect(wrapper.childNodesWithoutComments).to.have.lengthOf(2);
    expect(wrapper.childNodesWithoutComments[0])
      .to.be.instanceOf(Text)
      .to.have.property('textContent', 'here are my thoughts:');
    expect(wrapper.childNodesWithoutComments[1]).to.equal(element);
  });

  it('updates a replacing text node to array of nodes', () => {
    const container = document.createElement('div');
    const wrapper = document.createElement('div');
    container.append(wrapper);
    const node = new ConnectedNode('Hello, World!').connect(wrapper, { replace: true });
    const element = document.createElement('p');
    node.value = ['here are my thoughts:', element];
    expect(container.childNodesWithoutComments).to.have.lengthOf(2);
    expect(container.childNodesWithoutComments[0])
      .to.be.instanceOf(Text)
      .to.have.property('textContent', 'here are my thoughts:');
    expect(container.childNodesWithoutComments[1]).to.equal(element);
  });
};

async function isAGoodNeighbor() {
  const { ConnectedNode } = await import('../build/runtime.js');

  it('does not affect siblings when inserted', () => {
    const wrapper = document.createElement('div');
    const sibling1 = document.createElement('span');
    const sibling2 = document.createElement('span');
    wrapper.append(sibling1);
    const node = new ConnectedNode('Hello, World!').connect(wrapper);
    wrapper.append(sibling2);

    expect(wrapper.childNodesWithoutComments).to.have.lengthOf(3);
    expect(wrapper.childNodesWithoutComments[0]).to.equal(sibling1);
    expect(wrapper.childNodesWithoutComments[1])
      .to.be.instanceOf(Text)
      .to.have.property('textContent', 'Hello, World!');
    expect(wrapper.childNodesWithoutComments[2]).to.equal(sibling2);

    const element = document.createElement('p');
    node.value = element;

    expect(wrapper.childNodesWithoutComments).to.have.lengthOf(3);
    expect(wrapper.childNodesWithoutComments[0]).to.equal(sibling1);
    expect(wrapper.childNodesWithoutComments[1]).to.equal(element);
    expect(wrapper.childNodesWithoutComments[2]).to.equal(sibling2);
  });

  it('does not affect siblings when replacing', () => {
    const container = document.createElement('div');
    const wrapper = document.createElement('div');
    const sibling1 = document.createElement('span');
    const sibling2 = document.createElement('span');
    container.append(sibling1);
    container.append(wrapper);
    const node = new ConnectedNode('Hello, World!').connect(wrapper, { replace: true });
    container.append(sibling2);

    expect(wrapper).to.have.property('parentNode', null);

    // verify initial setup
    expect(container.childNodesWithoutComments).to.have.lengthOf(3);
    expect(container.childNodesWithoutComments[0]).to.equal(sibling1);
    expect(container.childNodesWithoutComments[1])
      .to.be.instanceOf(Text)
      .to.have.property('textContent', 'Hello, World!');
    expect(container.childNodesWithoutComments[2]).to.equal(sibling2);

    // remove tracked content
    node.value = [];
    expect(container.childNodesWithoutComments).to.have.lengthOf(2);
    expect(container.childNodesWithoutComments[0]).to.equal(sibling1);
    expect(container.childNodesWithoutComments[1]).to.equal(sibling2);

    // insert new content
    const element = document.createElement('p');
    node.value = ['first', element, 'last'];

    expect(container.childNodesWithoutComments).to.have.lengthOf(5);
    expect(container.childNodesWithoutComments[0]).to.equal(sibling1);
    expect(container.childNodesWithoutComments[1])
      .to.be.instanceOf(Text)
      .to.have.property('textContent', 'first');
    expect(container.childNodesWithoutComments[2]).to.equal(element);
    expect(container.childNodesWithoutComments[3])
      .to.be.instanceOf(Text)
      .to.have.property('textContent', 'last');
    expect(container.childNodesWithoutComments[4]).to.equal(sibling2);
  });
}

insertion();
replace();
disconnect();
update();
isAGoodNeighbor();

function it(message, test) {
  test();
}

// create `childNodesWithoutComments` on HTMLElement as a shortcut for excluding placehoder comment nodes
// when running expects on child nodes
Object.defineProperty(HTMLElement.prototype, 'childNodesWithoutComments', {
  get() {
    return Array.from(this.childNodes).filter(node => node.nodeType !== Node.COMMENT_NODE);
  }
});