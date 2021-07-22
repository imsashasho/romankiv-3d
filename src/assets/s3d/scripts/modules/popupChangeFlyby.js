import $ from 'jquery';

class PopupChangeFlyby {
  constructor(data) {
    this.state = {};
    this.popup = $('.js-s3d-popup-flyby');
    this.updateFsm = data.updateFsm;
    this.popup.on('click', '[data-type="close"]', event => {
      this.closePopup();
    });
    this.popup.on('click', '[data-type="next"]', event => {
      this.activateTranslate();
    });

    this.updateState = this.updateState.bind(this);
    this.updateContent = this.updateContent.bind(this);
  }

  updateState(config) {
    this.state = config;
  }

  updateContent(flat) {
    const wrap = $('.js-s3d-popup-flyby__active');
    const cor = flat.getBoundingClientRect();
    wrap.css({
      top: cor.y,
      left: cor.x,
      height: flat.offsetHeight,
      width: flat.offsetWidth,
    });

    wrap.html('');
    wrap.append(flat.cloneNode(true));

    const height = flat.offsetHeight;
    const top = cor.y + (height / 2);
    $('.js-s3d-popup-flyby__bg-active').css({
      transform: `translate(0, ${top}px)`,
      width: $('.js-s3d-filter')[0].offsetWidth,
    });

    this.flatId = _.toNumber(flat.dataset.id);
    this.popup.find('[data-type="title"]').html(flat.dataset.type);
  }

  openPopup(setting) {
    this.updateState(setting);
    if (!this.popup.hasClass('s3d-active')) {
      this.popup.addClass('s3d-active');
    }
  }

  closePopup() {
    this.popup.removeClass('s3d-active');
  }

  activateTranslate() {
    this.closePopup();
    this.updateFsm(this.state, this.flatId);
  }
}

export default PopupChangeFlyby;
