export default class SexyInput {
  constructor(setting) {
    this.selected = false;
    this.$field = setting.$field;
    this.$input = setting.$input || setting.$field.querySelector('input');
    this.$message = setting.$message || setting.$field.querySelector('[data-input-message]');

    this.$body = document.querySelector('body');

    this.init();
  }

  get input() {
    return this.$input;
  }

  selectIn(self) {
    return () => {
      if (this.getStatusField() !== 'field--error') {
        self.showSelectedStyle();
        self.addSelectedStyle();
      }
    };
  }

  selectOut(self) {
    return ({ target }) => {
      if (this.getStatusField() === 'field--error' || target.value !== '') return;

      self.showDefaultStyle();
      self.removeSelectedStyle();
    };
  }

  /*  */
  getStatusField() {
    return this.$field.getAttribute('data-status');
  }

  /*  */
  showSuccessStyle() {
    this.changeStatus(this.$field, 'success');
  }

  showDefaultStyle() {
    this.changeStatus(this.$field, 'default');
  }

  showErrorStyle() {
    this.changeStatus(this.$field, 'error');
  }

  showSelectedStyle() {
    this.changeStatus(this.$field, 'selected');
  }

  showLoadingStyle() {
    this.changeStatus(this.$field, 'loading');
  }

  addSelectedStyle() {
    this.$field.classList.add('selected');
  }

  removeSelectedStyle() {
    this.$field.classList.remove('selected');
  }

  writeMessage(text) {
    this.$message.innerHTML = text;
  }
  /*  */

  changeStatus(fieldBlock, status) {
    switch (status) {
      case 'default':
        fieldBlock.classList.remove('selected');
        fieldBlock.setAttribute('data-status', 'field--inactive');

        break;
      case 'success':
        fieldBlock.setAttribute('data-status', 'field--success');

        break;
      case 'error':
        fieldBlock.setAttribute('data-status', 'field--error');
        break;
      case 'selected':
        fieldBlock.classList.add('selected');
        fieldBlock.setAttribute('data-status', 'field--active');
        break;
      case 'loading':
        fieldBlock.classList.add('selected');
        fieldBlock.setAttribute('data-status', 'field--loading');
        break;

      default:
        throw new Error(`Unknown change status ${status}`);
    }
  }

  /*  */

  listeners(input) {
    const self = this;
    input.addEventListener('focus', self.selectIn(self));
    input.addEventListener('blur', self.selectOut(self));
  }

  init() {
    this.listeners(this.$input);
  }
}
