class Input {
  constructor() {
    this.element = undefined;
  }

  create(config) {
    this.element = config.tag ? document.createElement(config.tag) : document.createElement('input');
    if (typeof config.tag !== 'string' || config.tag === 'input') {
      this.element.type = config.type ? config.type : 'checkbox';
    }
    this.set(config);
    return this.element;
  }

  set(config) {
    if (config.class) this.element.classList += config.class;
    if (config.id) this.element.id = config.id;
    if (config.content) {
      this.element.child = config.content;
    }
    if (config.value) this.element.value = config.value;
    if (config.placeholder) this.element.placeholder = config.placeholder;
    for (const attr in config.attribute) {
      this.element.dataset[attr] = config.attribute[attr];
    }
  }
}

export default Input;
