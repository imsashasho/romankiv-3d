import { BehaviorSubject } from 'rxjs';
import $ from 'jquery';
import _ from 'lodash';
import { fsm, fsmConfig } from '../fsm';
import { isDevice } from '../checkDevice';
import {
  preloader, debounce, preloaderWithoutPercent,
} from '../general/General';
import asyncRequest from '../async/async';
import EventEmitter from '../eventEmitter/EventEmitter';
import History from '../history';
import { HelperGif as Helper } from '../helper';
import InfoBox from '../infoBox';
import FilterModel from '../filter/filterModel';
import FilterView from '../filter/filterView';
import FilterController from '../filter/filterController';
import FlatsList from '../flatsList';
import PopupChangeFlyby from '../popupChangeFlyby';
import FavouritesModel from '../favourites/favouritesModel';
import FavouritesController from '../favourites/favouritesController';
import FavouritesView from '../favourites/favouritesView';
import placeElemInWrapperNearMouse from '../placeElemInWrapperNearMouse';

class AppModel extends EventEmitter {
  constructor(data) {
    super();
    this.config = data;
    this.generalWrapId = data.generalWrapId; // used for create wrapper slider

    this.preloader = preloader();
    this.preloaderWithoutPercent = preloaderWithoutPercent();
    this.favourites = {};
    this.defaultFlybySettings = {};
    this.getFlat = this.getFlat.bind(this);
    this.setFlat = this.setFlat.bind(this);
    this.updateFsm = this.updateFsm.bind(this);
    this.checkNextFlyby = this.checkNextFlyby.bind(this);
    this.changePopupFlyby = this.changePopupFlyby.bind(this);
    this.ActiveHouse = {
      value: undefined,
      get: () => this.value,
      set: num => {
        this.value = +num;
      },
    };
    this.compass = this.compass.bind(this);
    this.updateCurrentFilterFlatsId = this.updateCurrentFilterFlatsId.bind(this);
    this.currentFilterFlatsId$ = new BehaviorSubject([]);
    this.hoverFlatId$ = new BehaviorSubject(null);
    this.flatList = {};
    this.subject = new BehaviorSubject(this.flatList);
    this.fsmConfig = fsmConfig();
    this.fsm = fsm();
    this.isMobile = false;
    this.lang = document.querySelector('html').lang;
    this.infoBlockTranslateFlybyTexts = {
      ua: {
        1: 'Загальний план',
        2: 'Будинок 1',
        3: 'Будинок 2',
        4: 'Будинок 3 та 4',
        build: 'Будинок',
        complex: 'Зовнішній \n фасад',
        courtyard: 'Внутрішній \n фасад',
      },
      en: {
        1: 'Загальний план',
        2: 'House 1',
        3: 'House 2',
        4: 'House 3 та 4',
        build: 'House',
        complex: 'External \n facade',
        courtyard: 'Internal \n facade',
      },
      ru: {
        1: 'Общий план',
        2: 'Дом 1',
        3: 'Дом 2',
        4: 'Дом 3 и 4',
        build: 'Дом',
        complex: 'Внешний \n фасад',
        courtyard: 'Внутренний \n фасад',
      },
    };

    this.infoBlockTranslateFlybyWrapContainer = document.querySelector('.js-s3d-hover-translate');
    this.infoBlockTranslateFlybyContainer = document.querySelector('.js-s3d-hover-translate--text');
    this.infoBlockTranslateFlybyClosedContainer = document.querySelector('.js-s3d-hover-translate [data-closed]');
    this.infoBlockTranslateFlybyLinkContainer = document.querySelector('.js-s3d-hover-translate [data-link]');
  }

  set activeFlat(value) {
    this._activeFlat = _.toNumber(value);
  }

  get activeFlat() {
    return this._activeFlat;
  }

  selectSlideHandler(event) {
    const { type, flyby, side = 'outside' } = event.currentTarget.dataset;
    if (type && (type !== this.fsm.state || flyby !== this.fsm.settings.flyby || side !== this.fsm.settings.side)) {
      this.updateHistory({
        type, flyby, side, method: 'general',
      });
      this.updateFsm({
        type, flyby, side, method: 'general',
      });
    }
  }

  getFlat(val) {
    return val ? this.flatList[val] : this.flatList;
  }

  setFlat(val) {
    this.flatList[val.id] = val;
    this.subject.next(val);
  }

  init() {
    if (isDevice('mobile') || document.documentElement.offsetWidth <= 768) {
      $('.js-s3d__slideModule').addClass('s3d-mobile');
      this.isMobile = true;
    }

    this.history = new History({ updateFsm: this.updateFsm });
    this.history.init();
    this.preloader.turnOn();
    let requestUrl = `${defaultStaticPath}flats.json`;
    if (status === 'prod' || status === 'dev') {
      requestUrl = '/wp-admin/admin-ajax.php';
    }
    this.requestGetFlats(requestUrl, this.flatJsonIsLoaded.bind(this));

    this.infoBox = new InfoBox({
      activeFlat: this.activeFlat,
      updateFsm: this.updateFsm,
      history: this.history,
    });
    this.infoBlockTranslateFlybyLinkContainer.addEventListener('click', e => {
      const { flyby } = e.currentTarget.dataset;
      this.updateFsm({
        type: 'flyby',
        flyby,
      });
    });
    this.infoBlockTranslateFlybyClosedContainer.addEventListener('click', e => {
      this.clearStyleInfoBlockTranslateFlyby();
    });

    this.setDefaultConfigFlyby(this.config.flyby);
    // window.localStorage.removeItem('info')
    this.helper = new Helper();

    this.deb = debounce(this.resize.bind(this), 200);
  }

  setDefaultConfigFlyby(config) {
    const type = 'flyby';
    const flyby = Object.keys(config)[0];
    const side = Object.keys(config[flyby])[0];
    this.defaultFlybySettings = { type, flyby, side };
  }

  parseUrl() {
    const { searchParams } = new URL(window.location);
    const parseSearchParam = Object.fromEntries(searchParams.entries());
    return parseSearchParam;
  }

  getInfoBlockTranslateText(flyby) {
    return this.infoBlockTranslateFlybyTexts[this.lang][flyby];
  }

  infoBlockTranslateFlyby(e) {
    const { flyby } = e.target.dataset;
    const text = this.getInfoBlockTranslateText(flyby);
    this.infoBlockTranslateFlybyContainer.innerText = text;
    this.infoBlockTranslateFlybyLinkContainer.dataset.flyby = `${flyby}`;

    if (this.isMobile) {
      this.infoBlockTranslateFlybyWrapContainer.style = 'opacity: 1; top: auto; bottom: 0px; left: 0px; pointer-events: painted;';
      return;
    }

    const { x, y } = placeElemInWrapperNearMouse(this.infoBlockTranslateFlybyWrapContainer, document.documentElement, e, 30);
    this.infoBlockTranslateFlybyWrapContainer.style = `opacity: 1; top: ${y}px; left: ${x}px;`;
  }

  clearStyleInfoBlockTranslateFlyby() {
    this.infoBlockTranslateFlybyWrapContainer.style = '';
  }

  infoBlockTranslateFlybyHandler(e, type, flyby) {
    if (!this.isMobile) {
      this.selectSlideHandler(e);
      return;
    }
    if (type && type === 'flyby') {
      this.infoBlockTranslateFlyby(e);
      return;
    }
    this.clearStyleInfoBlockTranslateFlyby();
  }

  checkFirstLoadState() {
    $.ajax(`${defaultStaticPath}/structureFlats.json`).then(resp => {
      this.structureFlats = resp;
      this.checkFirstBlock();
    });
  }

  getParamDefault(searchParams, flat) {
    return this.getParamFlyby(searchParams, flat);
  }

  parseParam(params, key) {
    return _.has(params, key) ? { [key]: JSON.parse(params[key]) } : {};
  }

  getParamFlyby(searchParams) {
    const conf = {
      ...this.parseParam(searchParams, 'favourites'),
      type: searchParams.type ? searchParams.type : 'flyby',
      flyby: searchParams.flyby ? searchParams.flyby : '1',
      side: searchParams.side ? searchParams.side : 'outside',
    };

    const flatId = searchParams.id;
    const id = (flatId && this.getFlat(flatId)) ? { id: searchParams.id } : {};
    return { ...conf, ...id };
  }

  getParamPlannings(searchParams) {
    return {
      type: 'plannings',
    };
    // return searchParams;
  }

  getParam(searchParams, id) {
    const conf = {
      type: searchParams['type'],
    };

    switch (searchParams['type']) {
        case 'flyby':
          conf['flyby'] = _.has(searchParams, 'flyby') ? searchParams['flyby'] : '1';
          conf['side'] = _.has(searchParams, 'side') ? searchParams['side'] : 'outside';
          if (_.has(searchParams, 'method')) {
            conf['method'] = searchParams['method'];
          } else if (id) {
            conf['method'] = 'search';
          } else {
            conf['method'] = 'general';
          }
          break;
        default:
          conf['method'] = 'general';
          break;
    }
    if (!_.isUndefined(id)) {
      conf['id'] = id;
    } else {
      if (conf.type === 'flat') {
        conf.type = 'flyby';
        conf.flyby = '1';
        conf.side = 'outside';
      }
      this.history.replaceUrl(conf);
    }
    return conf;
  }

  getNameLoadState() {
    const searchParams = this.parseUrl();
    const id = _.has(searchParams, 'id') ? _.toNumber(searchParams.id) : undefined;
    const flat = this.getFlat(id);
    const hasConfigPage = Object.keys(this.config).includes(searchParams['type']);

    if (!_.has(searchParams, 'type') || !hasConfigPage) return this.getParamDefault(searchParams, flat);

    switch (searchParams['type']) {
        case 'flyby':
          return this.getParamFlyby(searchParams, flat);
        case 'plannings':
          return this.getParamPlannings(searchParams);
        default:
          return this.getParam(searchParams, id);
    }
  }

  checkFlatInSVG(id) { // получает id квартиры, отдает объект с ключами где есть квартиры
    const flyby = this.structureFlats;
    const result = {};
    for (const num in flyby) {
      for (const side in flyby[num]) {
        const type = flyby[num][side];
        for (const slide in type) {
          const hasId = type[slide].includes(+id);
          if (hasId && !_.has(result, [num])) {
            result[num] = {};
          }
          if (hasId && !_.has(result, [num, side])) {
            result[num][side] = [];
          }
          if (hasId) {
            result[num][side].push(+slide);
          }
        }
      }
    }
    return result;
  }

  checkFirstBlock() {
    const config = this.getNameLoadState();
    this.history.update(config);
    this.updateFsm(config, config.id);
  }

  prepareFlats(flats) {
    const nameFilterFlat = {
      all_room: 'area',
      floor: 'floor',
      rooms: 'rooms',
    };
    // filter only flats  id = 1
    const currentFilterFlatsId = flats.reduce((previous, current) => {
      // if (current['type_object'] === '1') {
      const flat = _.transform(current, (acc, value, key) => {
        const newValue = _.toNumber(value);
        const params = acc;
        let currentKey = key;
        if (_.has(nameFilterFlat, currentKey)) {
          currentKey = nameFilterFlat[currentKey];
        }
        if (!_.isNaN(newValue)) {
          params[currentKey] = newValue;
        } else {
          params[currentKey] = value;
        }
        return params;
      });
      flat['favourite'] = false;
      const key = flat.id;
      return { ...previous, [key]: flat };
    }, {});
    return currentFilterFlatsId;
  }

  flatJsonIsLoaded(data) {
    this.flatList = this.prepareFlats(data);
    const currentFilterFlatsId = Object.keys(this.flatList);
    this.currentFilterFlatsId$.next(currentFilterFlatsId);

    const generalConfig = {
      getFlat: this.getFlat,
      setFlat: this.setFlat,
      subject: this.subject,
      updateFsm: this.updateFsm,
      fsm: this.fsm,
      history: this.history,
      currentFilterFlatsId$: this.currentFilterFlatsId$,
      updateCurrentFilterFlatsId: this.updateCurrentFilterFlatsId,
      activeFlat: this.activeFlat,
      infoBlockTranslateFlybyHandler: this.infoBlockTranslateFlybyHandler.bind(this),
      clearStyleInfoBlockTranslateFlyby: this.clearStyleInfoBlockTranslateFlyby.bind(this),
      infoBlockTranslateFlyby: this.infoBlockTranslateFlyby.bind(this),
    };
    const filterModel = new FilterModel({ flats: this.getFlat(), updateCurrentFilterFlatsId: this.updateCurrentFilterFlatsId });
    // const filterModel = new FilterModel(generalConfig);
    const filterView = new FilterView(filterModel, {});
    const filterController = new FilterController(filterModel, filterView);
    // this.filter = filterModel;
    filterModel.init();
    this.filter = filterModel;
    const listFlat = new FlatsList(this);
    function getFlatDataById(id) {
      return listFlat.filter.flats[id];
    }

    this.popupChangeFlyby = new PopupChangeFlyby(this, getFlatDataById);

    const fvModel = new FavouritesModel(generalConfig);
    const fvView = new FavouritesView(fvModel, {});
    const fvController = new FavouritesController(fvModel, fvView);
    this.favourites = fvModel;
    fvModel.init();
    this.createStructureSvg();
    this.checkFirstLoadState();
  }

  // createSvgStructureFlats
  createStructureSvg() {
    const flyby = {}
    const conf = this.config.flyby
    for (const num in conf) {
      flyby[num] = {}
      for (const side in conf[num]) {
        const type = conf[num][side]
        flyby[num][side] = {}
        type.controlPoint.forEach(slide => {
          flyby[num][side][slide] = []
          $.ajax(`/wp-content/themes/${nameProject}/assets/s3d/images/svg/flyby/${num}/${side}/${slide}.svg`).then(responsive => {
            const list = [...responsive.querySelectorAll('polygon')];
            flyby[num][side][slide] = list.map(el => +el.dataset.id);
          });
        });
      }
    }
    setTimeout(() => {
      console.log(JSON.stringify(flyby));
    }, 10000);
  }

  changePopupFlyby(config, id) {
    this.popupChangeFlyby.updateContent(id);
    this.popupChangeFlyby.openPopup(config);
  }

  compass(deg) {
    this.emit('updateCompassRotate', deg);
  }

  updateHistory(name) {
    if (this['history'] && this['history'].update) {
      this.history.update(name);
      return true;
    }
    return false;
  }

  changeViewBlock(name, delay = 400) {
    const self = this;
    setTimeout(() => {
      self.emit('changeBlockActive', name);
    }, delay);
  }

  // showAvailableFlat() {
  // 	// $('.js-s3d-ctr__showFilter--input').click();
  // 	if ($('.js-s3d-ctr__showFilter--input').prop('checked')) {
  // 		// $('.js-s3d-ctr__showFilter--input').prop('checked',false);
  // 		$('.js-s3d-svg__point-group').css({ opacity: '1', display: 'flex' })
  // 	} else {
  // 		// $('.js-s3d-ctr__showFilter--input').prop('checked',true);
  // 		// $('#js-s3d__wrapper polygon').css({'opacity': ''});
  // 		$('.js-s3d-svg__point-group').css({ opacity: '0', display: 'none' })
  // 	}
  // }

  requestGetFlats(url, myCallback) {
    let method = 'POST';
    if (status === 'prod' || status === 'dev') {
      method = 'POST';
    } else {
      method = 'GET';
    }
    asyncRequest({
      url,
      data: {
        method,
        data: 'action=getFlats',
      },
      callbacks: myCallback,
      errors: error => {
        console.log('error', error);
      },
    });
  }

  updateCurrentFilterFlatsId(value) {
    this.currentFilterFlatsId$.next(value);
  }

  updateFavourites() {
    this.favourites.updateFavourites();
  }

  getFavourites() {
    if (_.has(this, 'favourites')) {
      return this.favourites.getFavourites();
    }
    return false;
  }

  updateFsm(data, id) {
    let config;
    let settings = data;
    let nameMethod;

    if (_.has(data, 'method') && data.method === 'search' && id) {
      nameMethod = data.method;
    } else if (_.has(data, 'method') && data.method !== 'search') {
      nameMethod = data.method;
    } else {
      nameMethod = 'general';
    }

    if (data.type === 'flyby' && _.has(data, 'slide') && _.size(data.slide) > 0) {
      settings = data;
      config = this.config[settings.type][+settings.flyby][settings.side];
    } else if (data.type === 'flyby' && id) {
      if (id) {
        settings = this.checkNextFlyby(data, id);
      }
      const type = _.has(settings, 'type') ? settings.type : this.defaultFlybySettings.type;
      const flyby = _.has(settings, 'flyby') ? +settings.flyby : this.defaultFlybySettings.flyby;
      const side = _.has(settings, 'side') ? settings.side : this.defaultFlybySettings.side;

      if (settings === null) {
        settings = {
          type,
          flyby,
          side,
        };
      }
      config = this.config[type][flyby][side];
    } else if (data.type === 'flyby') {
      const type = _.has(data, 'type') ? data.type : this.defaultFlybySettings.type;
      const flyby = _.has(data, 'flyby') ? +data.flyby : this.defaultFlybySettings.flyby;
      const side = _.has(data, 'side') ? data.side : this.defaultFlybySettings.side;
      settings = {
        type,
        flyby,
        side,
      };

      config = this.config[data.type || this.defaultFlybySettings.type][+data.flyby || this.defaultFlybySettings.flyby][data.side || this.defaultFlybySettings.side];
      if (_.isUndefined(config)) {
        console.error('updateFsm  has type but has not another parameters');
        return;
      }
    } else {
      config = this.config[data.type];
    }

    if (id) {
      this.activeFlat = +id;
      config.flatId = +id;
    }
    config.type = data.type;
    config.ActiveHouse = this.ActiveHouse;
    config.activeFlat = this.activeFlat;
    config.hoverFlatId$ = this.hoverFlatId$;
    config.compass = this.compass;
    config.updateFsm = this.updateFsm;
    config.getFavourites = this.getFavourites.bind(this);
    config.updateFavourites = this.updateFavourites.bind(this);
    config.getFlat = this.getFlat;
    config.setFlat = this.setFlat;
    config.subject = this.subject;
    config.currentFilterFlatsId$ = this.currentFilterFlatsId$;
    config.updateCurrentFilterFlatsId = this.updateCurrentFilterFlatsId;
    config.history = this.history;
    config.infoBox = this.infoBox;

    config.infoBlockTranslateFlybyHandler = this.infoBlockTranslateFlybyHandler.bind(this);
    config.clearStyleInfoBlockTranslateFlyby = this.clearStyleInfoBlockTranslateFlyby.bind(this);
    config.infoBlockTranslateFlyby = this.infoBlockTranslateFlyby.bind(this);

    this.fsm.dispatch(settings, nameMethod, this, config);
  }

  iteratingConfig(delay = 400) {
    const width = document.documentElement.offsetWidth;
    const typeDevice = width > 992 ? 'desktop' : 'mobile';
    const state = this.fsmConfig[this.fsm.state][typeDevice];

    setTimeout(() => {
      for (const key in state) {
        if (state[key] instanceof Object && !(state[key] instanceof Function)) {
          for (const i in state[key]) {
            switch (i) {
                // не проверяет ключ вызывает функцию передает boolean
                case state[key][i] !== 'boolean':
                  break;
                case 'filter':
                  this.controllerFilterShow(state[key][i]);
                  break;
                case 'title':
                  this.controllerTitleShow(state[key][i]);
                  break;
                case 'phone':
                  this.controllerPhoneShow(state[key][i]);
                  break;
                case 'compass':
                  this.controllerCompassShow(state[key][i]);
                  break;
                case 'tabs':
                  this.controllerTabsShow(state[key][i]);
                  break;
                case 'helper':
                  this.controllerHelperShow(state[key][i]);
                  break;
                case 'infoBox':
                  this.controllerInfoBoxShow(state[key][i]);
                  break;
                case 'infrastructure':
                  this.controllerInfraShow(state[key][i]);
                  break;
                case 'favourite':
                  this.controllerFavouriteShow(state[key][i]);
                  break;
                case 'back':
                  this.controllerBackShow(state[key][i]);
                  break;
                default:
                  break;
            }
          }
        } else {
          switch (key) {
              // не проверяет ключ вызывает функцию передает boolean
              case state[key] !== 'boolean':
                break;
              case 'filter':
                this.filterShow(state[key]);
                break;
              case 'filterTransition':
                this.filterTransition(state[key]);
                break;
              default:
                break;
          }
        }
      }
    }, delay);
  }

  filterShow(flag) {
    this.emit('changeClass', { target: '.js-s3d-filter', flag, changeClass: 's3d-show' });
  }

  filterTransition(flag) {
    this.emit('changeClass', { target: '.js-s3d-filter', flag, changeClass: 'active-filter' });
  }

  controllerFilterShow(flag) {
    this.emit('changeClass', { target: '.js-s3d-ctr__open-filter', flag, changeClass: 's3d-show' });
  }

  controllerCompassShow(flag) {
    this.emit('changeClass', { target: '.js-s3d-ctr__compass', flag, changeClass: 's3d-show' });
  }

  controllerInfraShow(flag) {
    this.emit('changeClass', { target: '.js-s3d-ctr__open-infra', flag, changeClass: 's3d-show' });
  }

  controllerHelperShow(flag) {
    this.emit('changeClass', { target: '.js-s3d-ctr__open-helper', flag, changeClass: 's3d-show' });
  }

  controllerTitleShow(flag) {
    this.emit('changeClass', { target: '.js-s3d-ctr__title', flag, changeClass: 's3d-show' });
  }

  controllerPhoneShow(flag) {
    this.emit('changeClass', { target: '.js-s3d-ctr__call', flag, changeClass: 's3d-show' });
  }

  controllerFavouriteShow(flag) {
    this.emit('changeClass', { target: '.s3d-ctr__favourites', flag, changeClass: 's3d-show' });
  }

  controllerTabsShow(flag) {
    this.emit('changeClass', { target: '.js-s3d-ctr__elem', flag, changeClass: 's3d-show' });
  }

  controllerInfoBoxShow(flag) {
    this.emit('changeClass', { target: '.js-s3d-infoBox', flag, changeClass: 's3d-show' });
  }

  controllerBackShow(flag) {
    this.emit('changeClass', { target: '.js-s3d-ctr__return', flag, changeClass: 's3d-show' });
  }

  resize() {
    this.iteratingConfig();
  }

  checkNextFlyby(data, id) {
    if (_.isUndefined(id) || !_.has(data, 'type')) {
      return {
        type: 'flyby',
        flyby: _.has(data, 'flyby') ? this.defaultFlybySettings.flyby : 1,
        side: _.has(data, 'side') ? this.defaultFlybySettings.side : 'outside',
        method: 'general',
        change: false,
      };
    }

    const includes = this.checkFlatInSVG(id);
    const setting = this.fsm.settings;
    if (_.size(includes) === 0) {
      return null;
    }

    if (_.has(includes, [data.flyby, data.side])) {
      return {
        type: 'flyby',
        flyby: data.flyby,
        side: data.side,
        method: 'search',
        slide: includes[data.flyby][data.side],
        change: false,
      };
    }
    if (_.has(includes, [setting.flyby, setting.side])) {
      return {
        type: 'flyby',
        flyby: setting.flyby,
        side: setting.side,
        method: 'search',
        slide: includes[setting.flyby][setting.side],
        change: false,
      };
    }

    const key1 = Object.keys(includes);
    const key2 = Object.keys(includes[key1[0]]);
    const slide = includes[key1[0]][key2[0]];
    let change = false;
    if (setting.type !== 'flyby' || setting.flyby !== key1 || setting.side !== key2) {
      change = true;
    }

    return {
      type: 'flyby',
      flyby: key1[0],
      side: key2[0],
      method: 'search',
      slide,
      change,
    };
  }
}


// функция нужна только для скролла мышкой
// AppModel.prototype.scrollBlock = function (e, active) {
// 	// if (this.filter) {
// 	// 	this.filter.hidden()
// 	// }
// 	const ind = this.activeSectionList.findIndex(el => { if (el === active) return true })
// 	if (this.animateFlag && this.activeSectionList.length >= 2) {
// 		this.complex.hiddenInfo()
// 		this.animateFlag = false
// 		if (e.originalEvent && e.originalEvent.wheelDelta / 120 > 0) {
// 			this.animateBlock('translate', 'up')
// 			if (ind > 0) {
// 				this.updateHistory(this.activeSectionList[ind - 1])
// 				this.scrollToBlock(600)(this.activeSectionList[ind - 1])
// 			} else if (ind === 0) {
// 				this.updateHistory(this.activeSectionList[this.activeSectionList.length - 1])
// 				this.scrollToBlock(600)(this.activeSectionList[this.activeSectionList.length - 1])
// 			}
// 		} else if (e.originalEvent && e.originalEvent.wheelDelta / 120 < 0) {
// 			this.animateBlock('translate', 'down')
// 			if (ind < this.activeSectionList.length - 1) {
// 				this.updateHistory(this.activeSectionList[ind + 1])
// 				this.scrollToBlock(600)(this.activeSectionList[ind + 1])
// 			} else if (ind === this.activeSectionList.length - 1) {
// 				this.updateHistory(this.activeSectionList[0])
// 				this.scrollToBlock(600)(this.activeSectionList[0])
// 			}
// 		} else {
// 			console.log('AppModel.prototype.scrollBlock')
// 			this.animateBlock('translate', 'down')
// 			this.scrollToBlock(600)(active)
// 		}
// 	}
// }


export default AppModel;
