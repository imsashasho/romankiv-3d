import $ from 'jquery';
import _ from 'lodash';
import magnificPopup from 'magnific-popup';
import EventEmitter from '../eventEmitter/EventEmitter';
import {
  addBlur, unActive, preloader, updateFlatFavourite, compass, debounce,
} from '../general/General';
import asyncRequest from '../async/async';

class FlatModel extends EventEmitter {
  constructor(config) {
    super();
    this.type = config.type;
    this.id = config.id;
    this.changeViewBlock = config.changeViewBlock;
    this.imagesKeys = config.imagesKeys;
    this.generalWrapId = config.generalWrapId;
    this.activeFlat = config.activeFlat;
    this.hoverFlatId$ = config.hoverFlatId$;
    this.getFavourites = config.getFavourites;
    this.updateFavourites = config.updateFavourites;
    this.getFlat = config.getFlat;
    this.updateFsm = config.updateFsm;
    this.history = config.history;
    this.createWrap();
    this.wrapper = $(`.js-s3d__wrapper__${this.type}`);
    this.imagesType = '';
    this.imagesViewType = '';
  }

  init(config) {
    this.preloader = preloader();
    // получаем разметку квартиры с планом этажа
    this.activeFlat = +config.flatId;
    // this.getPlane(config);
  }

  createWrap() {
    // все 3 обертки нужны, без них на мобилке пропадает прокрутка и всё ломается
    const wrap1 = createMarkup('div', { class: `s3d__wrap js-s3d__wrapper__${this.type} s3d__wrapper__${this.type}` });// const wrap2 = createMarkup(conf.typeCreateBlock, { id: `js-s3d__${conf.id}` })
    $(this.generalWrapId).append(wrap1);
  }

  update(config) {
    this.activeFlat = +config.flatId;
    this.getPlane(config);
  }

  // получаем разметку квартиры с планом этажа
  getPlane(config) {
    if (status === 'prod' || status === 'dev') {
      asyncRequest({
        url: '/wp-admin/admin-ajax.php',
        data: {
          method: 'POST',
          data: `action=createFlat&id=${config.activeFlat}`,
        },
        callbacks: this.setPlaneInPage.bind(this),
      });
    } else {
      asyncRequest({
        url: `${defaultModulePath}template/flat.php`,
        callbacks: this.setPlaneInPage.bind(this),
      });
    }
  }

  // вставляем разметку в DOM вешаем эвенты
  setPlaneInPage(response) {
    this.emit('setHtml', response);
    this.checkPlaning();
    this.checkFavouriteApart();
    $('.js-s3d-flat__image').magnificPopup({
      type: 'image',
      showCloseBtn: true,
    });

    setTimeout(() => {
      this.preloader.turnOff($('.js-s3d__select[data-type="flat"]'));
      this.preloader.hide();
    }, 600);
  }

  radioTypeHandler(types) {
    const imgUrlObj = this.getFlat(this.activeFlat).images[types];
    this.imagesType = types;
    this.emit('showViewButton', false);
    const keys = Object.keys(imgUrlObj);
    if (keys.length > 1) {
      this.emit('showViewButton', true);
    }
    $(`.js-s3d__radio-view [value=${keys[0]}]`).prop('checked', true);
    this.radioViewHandler(keys[0]);
  }

  getNewFlat(id) {
    if (status === 'prod' || status === 'dev') {
      asyncRequest({
        url: '/wp-admin/admin-ajax.php',
        data: {
          method: 'POST',
          data: `action=halfOfFlat&id=${id}`,
        },
        callbacks: response => {
          console.log();
          this.updateFlat(response, id);
        },
      });
    } else {
      console.log('запрос для замены квартиры');
    }
  }

  updateFlat(flat, id) {
    this.activeFlat = id;
    this.hoverFlatId$.next(id);
    this.emit('updateFlatData', { flat, id });
    this.checkPlaning();
    this.checkFavouriteApart();
  }

  checkFavouriteApart() {
    this.updateFavourites();
    const favourite = this.getFavourites();
    // if (favourite.length > 0) {
    //   $('.s3d-flat__favourites').removeClass('s3d-hidden');
    //   $('.js-s3d-favourites-amount').html(favourite.length);
    // }

    $('.s3d-flat__like input').prop('checked', favourite.includes(+this.activeFlat));
  }

  checkPlaning() {
    const textButtons = {
      ua: {
        with: '',
        without: '',
        rePlanning: '',
      },
      en: {
        with: 'with',
        without: 'without',
        rePlanning: 're-planning',
      },
      ru: {
        with: '',
        without: '',
        rePlanning: '',
      },
    }
    this.emit('changeClassShow', { element: '.js-s3d-flat .show', flag: false });
    const flat = this.getFlat(this.activeFlat);
    const size = _.size(flat.images);
    if (size === 0) {
      this.emit('updateImg', '/s3d/images/examples/no-image.png');
      return;
    }
    const keys = Object.keys(flat.images);

    this.imagesType = keys[0];
    this.imagesViewType = Object.keys(flat.images[keys[0]])[0];
    this.emit('clearRadioElement', '.js-s3d-flat__buttons-type');
    console.log(window.location);
    if (size > 1) {
      for (const imageKey in flat.images) {
        console.log(imageKey);
        this.emit('createRadioElement', {
          wrap: '.js-s3d-flat__buttons-type',
          type: imageKey,
          name: 'type',
        });
      }
    }

    $(`.js-s3d__radio-type[data-type=${this.imagesType}] input`).prop('checked', true);
    this.radioTypeHandler(this.imagesType);
  }

  radioViewHandler(viewType) {
    this.imagesViewType = viewType;
    const obj = this.getFlat(this.activeFlat).images;
    const image = obj[this.imagesType][viewType];
    const checked = $('.js-s3d__radio-view-change input');
    if (viewType === '2d') {
      checked.prop('checked', false);
    } else {
      checked.prop('checked', true);
    }
    this.emit('updateImg', image);
  }

  radioCheckedHandler(value) {
    if (value) {
      $('.js-s3d__radio-view[data-type="3d"]').click();
    } else {
      $('.js-s3d__radio-view[data-type="2d"]').click();
    }
  }

  updateMiniInfo(event) {
    if (event.currentTarget && event.currentTarget.hasAttribute('data-id')) {
      this.emit('updateDataFlats', this.getFlat(+event.currentTarget.dataset.id));
    } else {
      this.emit('updateDataFlats', this.getFlat(this.activeFlat));
    }
  }

  getPdfLink(id) {
    $.ajax('/wp-admin/admin-ajax.php', {
      method: 'POST',
      data: {
        action: 'createPdf',
        id,
      },
    })
      .then(resp => JSON.parse(resp))
      .then(url => {
        const pdfLink = document.querySelector('.initClickPdf');
        if (pdfLink) {
          pdfLink.remove();
        }
        document.body.insertAdjacentHTML('beforebegin', `<a class="initClickPdf" target="_blank" href="${url}"></a>`);
        document.querySelector('.initClickPdf').click();
      });
  }
}

export default FlatModel;
