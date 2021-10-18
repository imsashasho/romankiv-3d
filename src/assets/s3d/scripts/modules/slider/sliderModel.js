import $ from 'jquery';
import { BehaviorSubject } from 'rxjs';
import _ from 'lodash';
import EventEmitter from '../eventEmitter/EventEmitter';
import {
  preloader, debounce, preloaderWithoutPercent,
} from '../general/General';

class SliderModel extends EventEmitter {
  constructor(config) {
    super();
    this.type = config.type;
    this.id = config.id;
    this.settings = config.settings;
    this.browser = config.browser;
    this.nextSlideId = config.activeSlide;
    this.imageUrl = config.imageUrl;
    this.activeElem = config.activeSlide;
    this.controlPoint = config.controlPoint;
    this.getFlat = config.getFlat;
    this.setFlat = config.setFlat;
    this.activeFlat = config.activeFlat;
    this.hoverFlatId$ = config.hoverFlatId$;
    this.numberSlide = config.numberSlide;
    this.history = config.history;
    this.infoBox = config.infoBox;
    this.isInfoBoxMoving = true;
    this.infoBoxActive = false;
    this.infoBoxHidden = true;

    this.infoBlockTranslateFlybyHandler = config.infoBlockTranslateFlybyHandler;
    this.clearStyleInfoBlockTranslateFlyby = config.clearStyleInfoBlockTranslateFlyby;
    this.infoBlockTranslateFlyby = config.infoBlockTranslateFlyby;

    this.compass = config.compass;
    this.currentCompassDeg = 0;
    this.startDegCompass = config.startDegCompass;

    this.updateFsm = config.updateFsm;
    this.wrapper = config.wrapper;
    this.wrapperEvent = '.js-s3d__svgWrap';
    // images in slider
    this.ctx = this.wrapper.find(`#js-s3d__${this.id}`)[0].getContext('2d'); // Контекст
    this.height = 1080;
    this.width = 1920;
    // images in slider end

    // this.openHouses = [1]
    // data for rotate
    this.x = 0;
    this.pret = 0;
    this.amountSlideForChange = 0;
    this.arrayImages = [];
    this.mouseSpeed = config.mouseSpeed;
    this.rotateSpeedDefault = config.rotateSpeedDefault;
    this.rotateSpeed = config.rotateSpeed;
    this.nearestControlPoint = {
      min: config.numberSlide.min,
      max: config.numberSlide.max,
    };
    // data for rotate end

    // flags
    this.isKeyDown = false;
    this.isRotating$ = new BehaviorSubject(false); // вращается сейчас слайдер или нет
    // flags end

    this.activeSvg = null;
    this.activeFloor = null;
    this.animates = () => {};
    this.ActiveHouse = config.ActiveHouse;
    this.progress = 0;
    this.preloader = preloader();
    this.preloaderWithoutPercent = preloaderWithoutPercent();

    this.init = this.init.bind(this);
    this.changeNext = this.changeNext.bind(this);
    this.changePrev = this.changePrev.bind(this);
    this.loadImage = this.loadImage.bind(this);
    this.toSlideNum = this.toSlideNum.bind(this);
    this.setSvgActive = this.setSvgActive.bind(this);
  }

  sliderRotateEnd(event) {
    if (event.target.classList.contains('s3d__button')
      || event.target.classList.contains('s3d-infoBox__link')
    ) return;
    this.activeAnimateFrame(false);

    if (this.isKeyDown) {
      this.isKeyDown = false;
      if (!this.controlPoint.includes(this.activeElem)) {
        this.checkDirectionRotate();
      } else {
        this.changeSvgActive(this.activeElem);
        this.emit('showActiveSvg');
        this.infoBox.disable(false);
      }
    }
  }

  sliderRotateStart(event) {
    if (event.target.classList.contains('s3d__button')
      || this.isRotating$.value
      || event.target.classList.contains('s3d-infoBox__link') // если клик по кнопкам/ссылке или модуль вращается то выходим
    ) return;
    this.isKeyDown = true;
    this.cancelAnimateSlide();
    this.writingStartPosCursor.call(this, event);
    this.activeAnimateFrame(true);
  }

  mouseMoveHandler(event) {
    if (this.isRotating$.value) {
      return;
    }
    const { id, type } = event.target.dataset;

    if (this.isKeyDown) {
      this.infoBox.disable(true);
      this.emit('hideActiveSvg');
      this.checkMouseMovement.call(this, event);
    } else if (event.target.tagName === 'polygon' || event.target.tagName === 'path') {
      // debugger
      // this.infoBox.updatePosition(event);
      // this.infoBox.changeState('hover', this.getFlat(+event.target.dataset.id));
      if (type && type === 'flyby') {
        if (!this.infoBoxActive) {
          this.infoBox.changeState('static');
          this.infoBoxHidden = true;
          this.hoverFlatId$.next(null);
        }
        this.infoBlockTranslateFlyby(event);
        return;
      } else {
        this.clearStyleInfoBlockTranslateFlyby();
      }
      if (this.infoBoxActive) return;
      if (this.hoverFlatId$.value === +id) return;
      // ---
      // if (event.target.tagName === 'polygon' && type && type === 'flyby') {
      //   this.infoBlockTranslateFlyby(event);
      // } else {
      //   this.clearStyleInfoBlockTranslateFlyby();
      // }
      this.infoBox.updatePosition(event);

      this.infoBox.changeState('hover', this.getFlat(+event.target.dataset.id));
    } else if (!this.infoBoxActive) {
      this.infoBox.changeState('static');
      this.clearStyleInfoBlockTranslateFlyby();
    }
  }

  touchPolygonHandler(event) {
    event.preventDefault();
    if (this.isRotating$.value) {
      return;
    }
    this.clearStyleInfoBlockTranslateFlyby();
    const {
      type, flyby,
    } = event.target.dataset;

    if (type && type === 'flyby') {
      this.infoBox.changeState('static');
      this.hoverFlatId$.next(null);
      this.infoBlockTranslateFlybyHandler(event, type, flyby);
      return;
    }

    const id = +event.target.dataset.id;
    this.infoBox.changeState('active', this.getFlat(id));
    this.activeFlat = +id;
    this.hoverFlatId$.next(_.toNumber(id));
  }

  keyPressHandler(event) {
    let data;
    switch (event.keyCode) {
        case 37:
        case 100:
          data = 'prev';
          break;
        case 39:
        case 102:
          data = 'next';
          break;
        default:
          return false;
    }
    this.checkDirectionRotate(data);
    return true;
  }

  getSvgActive() {
    return this.activeSvg;
  }

  setSvgActive(svg) {
    if (_.isString(svg) || _.isNumber(svg)) {
      this.activeSvg = $(`.${this.type}__${svg}`);
    } else {
      this.activeSvg = svg;
    }
  }

  changeSvgActive(id) {
    this.setSvgActive(id);
    this.emit('changeSvgActive', this.getSvgActive());
  }

  init(id, slide) {
    // if (isDevice('ios')) {
    //   this.mouseSpeed = 0.5;
    // }
    if (id && slide && slide.length > 0) {
      this.activeElem = +slide[0];
      this.activeFlat = +id;
      this.hoverFlatId$.next(+id);
      this.emit('changeFlatActive', id);
    }

    this.hoverFlatId$.subscribe(value => {
      if (value) {
        this.emit('changeFlatActive', value);
      }
    });

    this.emit('createSvg', this);
    this.emit('createBackground');
    this.emit('createArrow');
    this.isRotating$.subscribe(value => {
      this.infoBox.disable(value);
    });

    // firstLoadImage должен быть ниже функций create
    this.firstLoadImage();

    this.deb = debounce(this.resizeCanvas.bind(this), 400);
    $(window).resize(() => {
      this.deb(this);
    });
  }

  updateCompass(activeSlide) {
    if (activeSlide) {
      this.currentCompassDeg = (360 / this.numberSlide.max * activeSlide) + (360 / this.numberSlide.max * this.startDegCompass);
    }
    this.compass(this.currentCompassDeg);
  }

  // ---- загрузка картинок слайдера ----
  firstLoadImage() {
    this.isRotating$.next(true);
    this.preloader.turnOn(this.wrapper.find('.s3d__button'));
    $('.fs-preloader-precent').addClass('s3d-show');
    this.ctx.canvas.width = this.width;
    this.ctx.canvas.height = this.height;
    const self = this;
    const img = new Image();
    const index = this.activeElem;
    img.src = `${defaultModulePath + this.imageUrl + index}.jpg`;
    img.dataset.id = index;

    img.onload = function load() {
      self.arrayImages[index] = this;
      self.updateCompass(self.activeElem);
      self.ctx.drawImage(this, 0, 0, self.width, self.height);
      setTimeout(() => {
        self.preloader.hide();
        self.preloader.miniOn();
      }, 300);
      self.resizeCanvas();
      self.loadImage(0);
    };
  }

  loadImage(i, countRepeatLoad = 0) {
    const self = this;
    const img = new Image();
    const index = i;
    img.src = `${defaultModulePath + this.imageUrl + index}.jpg`;
    img.dataset.id = index;
    img.onload = function load() {
      self.arrayImages[index] = this;
      self.progressBarUpdate();
      if (index === self.numberSlide.max) {
        self.resizeCanvas();
        self.ctx.drawImage(self.arrayImages[self.activeElem], 0, 0, self.width, self.height);
        setTimeout(() => {
          self.preloader.miniOff();
          self.preloader.turnOff($(this.wrapper).find('.s3d__button'));
        }, 300);
        self.isRotating$.next(false);
        self.changeSvgActive(self.activeElem);
        self.emit('showActiveSvg');
        self.infoBox.disable(false);
        if (self.activeFlat) {
          self.emit('changeFlatActive', self.hoverFlatId$.value);
          self.infoBox.changeState('active', self.getFlat(self.activeFlat));
          $('.fs-preloader-precent').removeClass('s3d-show');
        }

        return index;
      }
      return self.loadImage(i + 1);
    };

    img.onerror = function (e) {
      console.error('load image error', e);
      if (countRepeatLoad === 5) {
        console.error('5 ---- load image error', e);
        self.sendResponsiveError(this, self);
      } else {
        self.loadImage(+this.dataset.id, countRepeatLoad + 1);
      }
    };
  }

  sendResponsiveError(elem, self) {
    const res = Object.assign(self.browser, {
      project: 'template--wp',
      url: elem.src || elem.dataset.id || 'пусто',
      type: 'error',
      text: 'new',
    });
    $.ajax('/wp-admin/admin-ajax.php', {
      method: 'POST',
      data: {
        data: res, action: '3dDebuger',
      },
    }).then(resolve => console.log(resolve));
  }

  // высчитывает прогресс загрузки картинок
  progressBarUpdate() {
    if (this.progress >= this.numberSlide.max) {
      setTimeout(() => {
        this.emit('progressBarHide');
      }, 300);
      return;
    }
    this.progress += 1;
    const percent = this.progress * (100 / (this.numberSlide.max + 1));
    this.emit('updateLoaderProgress', Math.ceil(percent));
  }
  // ---- загрузка картинок слайдера end ----

  resizeCanvas() {
    const factorW = this.width / this.height;
    const factorH = this.height / this.width;
    const canvas = $(`#js-s3d__${this.id}`);
    const width = this.wrapper.width();
    const height = this.wrapper.height();
    const diffW = this.width / width;
    const diffH = this.height / height;

    if (diffW < diffH) {
      canvas.width(width);
      canvas.height(width * factorH);
    } else {
      canvas.height(height);
      canvas.width(height * factorW);
    }

    this.centerSlider(this.wrapper[0]);
  }

  // центрует слайдер (после загрузки или resize)
  centerSlider(elem) {
    const scroll = (elem.scrollWidth - document.documentElement.offsetWidth) / 2;
    this.wrapper.scrollLeft(scroll);
  }

  // записывает начальные позиции мышки
  writingStartPosCursor(e) {
    this.x = e.pageX || e.targetTouches[0].pageX;
    this.pret = e.pageX || e.targetTouches[0].pageX;
  }

  // получить массив с номерами svg на которых есть polygon с data-id переданый аргументом
  getNumSvgWithFlat(id) {
    const data = $(`.js-s3d__svgWrap polygon[data-id=${id}]`).map((i, poly) => +poly.closest('.js-s3d__svgWrap').dataset.id).toArray();
    return (data ? data : []);
  }

  // start block  change slide functions
  // находит ближайший слайд у которого есть polygon(data-id) при необходимости вращает модуль к нему
  toSlideNum(id, slide) {
    let needChangeSlide;
    let pointsSlide;
    if (slide) {
      needChangeSlide = !slide.includes(this.activeElem);
      pointsSlide = slide;
    } else {
      pointsSlide = this.getNumSvgWithFlat(id);
      needChangeSlide = !pointsSlide.includes(this.activeElem);
    }
    if (needChangeSlide) {
      this.checkDirectionRotate(undefined, pointsSlide);
    }
    this.activeFlat = +id;
    this.hoverFlatId$.next(+id);
    this.emit('changeFlatActive', +id);
    this.scrollWrapToActiveFlat(this.determinePositionActiveFlat(id, pointsSlide[0]));
    this.infoBox.changeState('active', this.getFlat(+id));
  }

  // запускает callback (прокрутку слайда) пока активный слайд не совпадёт со следующим (выявленным заранее)
  repeatChangeSlide(fn, nextSlideId) {
    this.isRotating$.next(true);
    // const { rotateSpeed } = this;
    const rotateSpeed = this.rotateSpeed.reduce((acc, data) => {
      if ((data.min === nextSlideId && data.max === this.activeElem) ||
        (data.max === nextSlideId && data.min === this.activeElem)) {
        acc = data.ms;
      }
      return acc;
    }, this.rotateSpeedDefault);

    return setInterval(() => {
      fn();
      if (this.activeElem === nextSlideId) {
        this.cancelAnimateSlide();
        this.changeSvgActive(nextSlideId);
        this.emit('showActiveSvg');
        this.emit('changeFlatActive', this.hoverFlatId$.value);
        this.infoBox.disable(false);
        this.isRotating$.next(false);
        this.amountSlideForChange = 0;
      }
    }, rotateSpeed);
  }

  showDifferentPointWithoutRotate(arrayIdNewPoint, flatId) {
    let arraySlides;

    if (arrayIdNewPoint) {
      arraySlides = arrayIdNewPoint;
    } else {
      arraySlides = this.getNumSvgWithFlat(flatId);
    }

    if (!arraySlides || arraySlides.length === 0) {
      return;
    }

    this.rewindToPoint(arraySlides);
    const idNewPoint = arraySlides[0];

    this.ctx.drawImage(this.arrayImages[idNewPoint], 0, 0, this.width, this.height);
    this.activeElem = idNewPoint;
    this.changeSvgActive(idNewPoint);
    this.emit('showActiveSvg');

    this.isRotating$.next(false);
    if (flatId) {
      this.activeFlat = +flatId;
      this.hoverFlatId$.next(+flatId);
      this.emit('changeFlatActive', +flatId);
      this.infoBox.changeState('active', this.getFlat(+flatId));
    }
  }

  checkDirectionRotate(data, points = this.controlPoint) {
    if (this.isRotating$.value) return;
    this.emit('hideActiveSvg');
    this.rewindToPoint(points);
    const dataNextPoint = this.checkResult(points, data);
    let fn;
    if (dataNextPoint.direction === 'next') {
      fn = this['changeNext'];
    } else {
      fn = this['changePrev'];
    }
    this.repeat = this.repeatChangeSlide(fn, dataNextPoint.nextPoint);
  }

  checkResult(points, type) {
    if (type === 'next' || (type === undefined && ((this.nearestControlPoint.max - this.nearestControlPoint.min) / 2) + this.nearestControlPoint.min <= this.activeElem)
    ) {
      if (this.nearestControlPoint.max <= this.numberSlide.max) {
        return { direction: 'next', nextPoint: this.nearestControlPoint.max };
      }
      return { direction: 'next', nextPoint: points[0] };
    }
    if (this.nearestControlPoint.min > this.numberSlide.min) {
      return { direction: 'prev', nextPoint: this.nearestControlPoint.min };
    }
    return { direction: 'prev', nextPoint: points[points.length - 1] };
  }

  determinePositionActiveFlat(id, numSlide) {
    const element = $(`.js-s3d__svgWrap[data-id=${numSlide}] polygon[data-id=${id}]`);
    if (_.size(element) === 0) {
      return 0;
    } else {
      const pos = element[0].getBBox();
      const left = (pos.x + (element[0].getBoundingClientRect().width / 2)) - (document.documentElement.offsetWidth / 2);
      return left < 0 ? 0 : left;
    }
  }

  scrollWrapToActiveFlat(left) {
    this.wrapper.scrollLeft(left);
  }

  // остановка анимации и сброс данных прокрутки
  cancelAnimateSlide() {
    clearInterval(this.repeat);
    this.repeat = undefined;
    this.nearestControlPoint.min = this.numberSlide.min;
    this.nearestControlPoint.max = this.numberSlide.max;
  }

  // меняет слайд на следующий
  changeNext() {
    if (this.activeElem === this.numberSlide.max) {
      this.nearestControlPoint.max = this.controlPoint[0];
      this.nearestControlPoint.min = -1;
      this.activeElem = this.numberSlide.min;
    } else {
      this.activeElem++;
    }
    this.updateCompass(this.activeElem);
    this.ctx.drawImage(this.arrayImages[this.activeElem], 0, 0, this.width, this.height);
  }

  // меняет слайд на предыдщий
  changePrev() {
    if (this.activeElem === this.numberSlide.min) {
      this.nearestControlPoint.max = this.numberSlide.max + 1;
      this.nearestControlPoint.min = this.controlPoint[this.controlPoint.length - 1];
      this.activeElem = this.numberSlide.max;
    } else {
      this.activeElem--;
    }
    this.updateCompass(this.activeElem);
    this.ctx.drawImage(this.arrayImages[this.activeElem], 0, 0, this.width, this.height);
  }

  checkMouseMovement(e) {
    // get amount slide from a touch event
    this.x = e.pageX || e.targetTouches[0].pageX;
    this.amountSlideForChange += +((this.x - this.pret) / (window.innerWidth / this.numberSlide.max / this.mouseSpeed)).toFixed(0);
  }

  rewindToPoint(controlPoint) {
    this.cancelAnimateSlide();
    controlPoint.forEach(el => {
      if (+el < this.activeElem && +el > this.nearestControlPoint.min) {
        this.nearestControlPoint.min = +el;
      } else if (+el > this.activeElem && +el < this.nearestControlPoint.max) {
        this.nearestControlPoint.max = +el;
      }
    });

    if (this.nearestControlPoint.min === 0) {
      this.nearestControlPoint.min = controlPoint[controlPoint.length - 1] - this.numberSlide.max;
    }

    if (this.nearestControlPoint.max === this.numberSlide.max) {
      this.nearestControlPoint.max = controlPoint[0] + this.numberSlide.max;
    }
    if (!controlPoint.includes(this.activeElem)) {
      return true;
    }
    return false;
  }

  activeAnimateFrame(flag) {
    if (flag) {
      this.animates = this.animate();
    } else {
      window.cancelAnimationFrame(this.animates);
    }
  }

  animate() {
    if (this.amountSlideForChange >= 1) {
      this.changeNext();
      this.amountSlideForChange -= 1;
      this.pret = this.x;
    } else if (this.amountSlideForChange <= -1) {
      this.changePrev();
      this.amountSlideForChange += 1;
      this.pret = this.x;
    }
    this.animates = requestAnimationFrame(this.animate.bind(this));
  }
  // end block  change slide functions
}

export default SliderModel;
