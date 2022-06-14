import $ from 'jquery';
import EventEmitter from '../eventEmitter/EventEmitter';
import Svg from '../Svg';

class SliderView extends EventEmitter {
  constructor(model, elements) {
    super();
    this._model = model;
    this._elements = elements;

    this.wrapper = $(elements.wrapper);

    // attach model listeners
    model.on('hideActiveSvg', () => {
      this.hideActiveSvg();
    });
    model.on('showActiveSvg', () => {
      this.showActiveSvg();
    });
    model.on('changeSvgActive', svg => {
      this.updateSvgActive(svg);
    });
    model.on('changeFlatActive', svg => {
      this.updateFlatActive(svg);
    });
    model.on('removeSvgFlatActive', () => {
      this.removeSvgFlatActive();
    });
    model.on('updateLoaderProgress', amount => {
      this.updatePreloaderPercent(amount);
    });
    model.on('progressBarHide', () => {
      this.progressBarHide();
    });

    model.on('createSvg', config => {
      this.createSvg(config);
    });
    model.on('createBackground', () => {
      this.createBackground();
    });
    model.on('createArrow', () => {
      this.createArrow();
    });

    // attach listeners to HTML controls
    this.wrapper.on('mousedown', event => {
      this.emit('mouseKeyDown', event);
    });
    this.wrapper.on('mousemove', elements.wrapperEvent, event => {
      this.emit('mouseMove', event);
    });
    this.wrapper.on('mouseup mouseleave', event => {
      this.emit('mouseKeyUp', event);
    });

    this.wrapper.on('click touch', 'polygon', event => {
      this.emit('touchPolygon', event);
    });
    window.addEventListener('keydown', event => {
      this.emit('keyPress', event);
    });
  }

  hideActiveSvg() {
    this._model.getSvgActive().css({ opacity: 0 });
  }

  showActiveSvg() {
    this._model.getSvgActive().css({ opacity: 1 });
  }

  updateSvgActive(svg) {
    this._model.wrapper.find('.s3d__svg__active').removeClass('s3d__svg__active');
    svg.addClass('s3d__svg__active');
  }

  updateFlatActive(id) {
    this.removeSvgFlatActive();
    $(`.js-s3d__svgWrap [data-id=${id}]`).addClass('active-flat');
  }

  removeSvgFlatActive() {
    $('.js-s3d__svgWrap .active-flat').removeClass('active-flat');
  }

  updatePreloaderPercent(percent) {
    $('.fs-preloader-amount').html(Math.ceil(percent));
  }

  progressBarHide() {
    $('.fs-preloader').removeClass('preloader-active');
  }

  // инициализация svg слайдера
  createSvg(sliderModule) {
    const svg = new Svg(sliderModule);
    svg.init();
  }

  createArrow() {
    const arrowLeft = createMarkup('button', {
      class: 's3d__button s3d__button-left js-s3d__button-left unselectable',
      content:
        '<svg viewBox="0 0 39 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0.485 15.968c0 8.551 6.932 15.483 15.483 15.483 4.748 0 8.997-2.137 11.838-5.503h0.628c-2.926 3.65-7.423 5.988-12.465 5.988-8.819 0-15.968-7.149-15.968-15.968s7.149-15.968 15.968-15.968c5.043 0 9.54 2.338 12.466 5.988h-0.628c-2.84-3.366-7.090-5.503-11.838-5.503-8.551 0-15.483 6.932-15.483 15.483z"></path><path d="M15.743 18.097l-3.502-2.395 3.502-2.395v1.975h23.045v0.84h-23.045v1.975z"></path></svg>',
    });
    arrowLeft.dataset.type = 'prev';

    const arrowRight = createMarkup('button', {
      class: 's3d__button s3d__button-right js-s3d__button-right unselectable',
      content:
        '<svg viewBox="0 0 39 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M38.303 16.032c0-8.551-6.932-15.483-15.483-15.483-4.748 0-8.997 2.138-11.838 5.503h-0.628c2.926-3.65 7.423-5.988 12.465-5.988 8.819 0 15.968 7.149 15.968 15.968s-7.149 15.968-15.968 15.968c-5.043 0-9.54-2.338-12.466-5.988h0.628c2.84 3.366 7.090 5.503 11.838 5.503 8.551 0 15.483-6.932 15.483-15.483z"></path><path d="M23.045 13.903l3.502 2.395-3.502 2.395v-1.975h-23.045v-0.84h23.045v-1.975z"></path></svg>',
    });
    arrowRight.dataset.type = 'next';

    this.wrapper.append(arrowLeft);
    arrowLeft.addEventListener('click', event =>
      this._model.checkDirectionRotate(event.target.dataset.type),
    );
    this.wrapper.append(arrowRight);
    arrowRight.addEventListener('click', event =>
      this._model.checkDirectionRotate(event.target.dataset.type),
    );
  }

  createBackground() {
    const top = createMarkup('div', { class: 's3d__slider__bg s3d__slider__bg-top' });
    const bottom = createMarkup('div', { class: 's3d__slider__bg s3d__slider__bg-bottom' });
    this._model.wrapper.append(top);
    this._model.wrapper.append(bottom);
  }
}

export default SliderView;
