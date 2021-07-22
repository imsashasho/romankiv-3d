import $ from 'jquery';
import _ from 'lodash';
import SliderModel from './slider/sliderModel';
import SliderView from './slider/sliderView';
import SliderController from './slider/sliderController';
import Plannings from './plannings';
import FlatModel from './flat/flatModel';
import FlatController from './flat/flatController';
import FlatView from './flat/flatView';

function fsmConfig() {
  return {
    flyby: {
      desktop: {
        filter: true,
        filterTransition: true,
        controller: {
          filter: true,
          title: true,
          phone: true,
          compass: true,
          tabs: true,
          helper: true,
          infoBox: true,
          favourite: true,
          infrastructure: true,
          back: false,
        },
      },
      mobile: {
        filter: true,
        filterTransition: true,
        controller: {
          filter: true,
          title: true,
          phone: true,
          compass: false,
          tabs: true,
          helper: true,
          infoBox: true,
          favourite: true,
          infrastructure: true,
          back: false,
        },
      },
    },
    plannings: {
      desktop: {
        filter: true,
        filterTransition: false,
        wrap: 'plannings',
        controller: {
          filter: false,
          title: false,
          phone: true,
          compass: false,
          tabs: true,
          helper: false,
          infoBox: false,
          favourite: true,
          infrastructure: false,
          back: true,
        },
        loader: false,
      },
      mobile: {
        filter: true,
        filterTransition: true,
        wrap: 'plannings',
        controller: {
          filter: true,
          title: false,
          phone: true,
          compass: false,
          tabs: true,
          helper: false,
          infoBox: false,
          favourite: true,
          infrastructure: false,
          back: true,
        },
        loader: false,
      },
    },
    flat: {
      desktop: {
        filter: false,
        wrap: 'flat',
        controller: {
          filter: false,
          title: false,
          phone: true,
          compass: false,
          tabs: true,
          helper: false,
          infoBox: false,
          favourite: false,
          infrastructure: false,
          back: true,
        },
        loader: false,
      },
      mobile: {
        filter: false,
        wrap: 'flat',
        controller: {
          filter: false,
          title: false,
          phone: true,
          compass: false,
          tabs: true,
          helper: false,
          infoBox: false,
          favourite: false,
          infrastructure: false,
          back: true,
        },
        loader: false,
      },
    },
    favourites: {
      desktop: {
        filter: false,
        wrap: 'favourites',
        controller: {
          filter: false,
          title: false,
          phone: true,
          compass: false,
          tabs: true,
          helper: false,
          infoBox: false,
          favourite: false,
          infrastructure: false,
          back: true,
        },
        loader: false,
      },
      mobile: {
        filter: false,
        wrap: 'favourites',
        controller: {
          filter: false,
          title: false,
          phone: true,
          compass: false,
          tabs: true,
          helper: false,
          infoBox: false,
          favourite: false,
          infrastructure: false,
          back: true,
        },
        loader: false,
      },
    },
  };
}

function fsm() {
  return {
    firstLoad: true,
    state: '',
    settings: {},
    transitions: {
      flyby: {
        general(config) {
          if (this[config.id] === undefined) {
            this.preloader.show();
            config['typeCreateBlock'] = 'canvas';
            this.emit('createWrapper', config);
            config['wrapper'] = $(`.js-s3d__wrapper__${config.id}`);
            const courtyardModel = new SliderModel(config);
            const courtyardView = new SliderView(courtyardModel, {
              wrapper: config['wrapper'],
              wrapperEvent: '.js-s3d__svgWrap',
            });
            const complexController = new SliderController(courtyardModel, courtyardView);
            this[config.id] = courtyardModel;
            courtyardModel.init();
            if (_.has(this, 'helper')) {
              this.helper.init();
            }
          } else {
            // this.emit('animateChangeBlock');
            // this.preloader.show();
            this.preloaderWithoutPercent.show();
            this.preloaderWithoutPercent.hide();
          }
          this.changeViewBlock(config.id);
          this.compass(this[config.id].currentCompassDeg);
          this.iteratingConfig();
        },
        search(config, change) {
          if (this[config.id] === undefined) {
            this.preloader.show();
            config['typeCreateBlock'] = 'canvas';
            this.emit('createWrapper', config);
            config['wrapper'] = $(`.js-s3d__wrapper__${config.id}`);
            const courtyardModel = new SliderModel(config);
            const courtyardView = new SliderView(courtyardModel, {
              wrapper: config['wrapper'],
              wrapperEvent: '.js-s3d__svgWrap',
            });
            const complexController = new SliderController(courtyardModel, courtyardView);
            this[config.id] = courtyardModel;
            courtyardModel.init(+config.flatId, config.settings.slide);
            if (_.has(this, 'helper')) {
              this.helper.init();
            }
          } else if (change) {
            this.preloaderWithoutPercent.show();
            this.preloaderWithoutPercent.hide();
            // this.emit('animateChangeBlock');
            this[config.id].showDifferentPointWithoutRotate(config.settings.slide, +config.flatId);
          } else {
            this[config.id].toSlideNum(+config.flatId, config.settings.slide);
          }

          this.changeViewBlock(config.id);
          this.compass(this[config.id].currentCompassDeg);
          this.iteratingConfig();
        },
        resize() {
          this.iteratingConfig();
        },
      },
      plannings: {
        general(config) {
          if (!this.plannings) {
            this.preloaderWithoutPercent.show();
            // this.preloader.show();
            // this.preloader.turnOff($('.js-s3d-ctr__open-filter'));
            this.plannings = new Plannings(config);
            this.plannings.init();
          } else {
            this.preloaderWithoutPercent.show();
            this.preloaderWithoutPercent.hide();
            // this.emit('animateChangeBlock');
          }
          this.changeViewBlock(this.fsm.state);
          this.iteratingConfig();
        },
        resize() {
          this.iteratingConfig();
        },
      },
      flat: {
        general(config) {
          if (!this.flat) {
            this.preloader.show();
            config['typeCreateBlock'] = 'div';
            const flatModel = new FlatModel(config);
            const flatView = new FlatView(flatModel, {});
            const flatController = new FlatController(flatModel, flatView);
            this.flat = flatModel;
            flatModel.init(config);
          } else {
            this.preloaderWithoutPercent.show();
            this.preloaderWithoutPercent.hide();
            // this.preloader.show();
            // this.emit('animateChangeBlock');
          }

          this.changeViewBlock(this.fsm.state);
          this.compass(this.flat.currentCompassDeg);
          this.iteratingConfig();
          this.flat.update(config);
        },
        resize() {
          this.iteratingConfig();
        },
      },
      favourites: {
        general() {
          if (this.fsm.firstLoad) {
            this.fsm.firstLoad = false;
          } else {
            this.preloaderWithoutPercent.show();
            // this.emit('animateChangeBlock');
          }
          // this.preloader.hide();
          if (this.favourites.templateCard) {
            this.favourites.updateFavouritesBlock();
          }
          this.changeViewBlock(this.fsm.state);
          this.preloaderWithoutPercent.hide();
          this.iteratingConfig();
        },
        resize() {
          this.iteratingConfig();
        },
      },
    },
    dispatch(state, actionName, self, payload) {
      let change = false;
      if (state.type !== this.state || +state.flyby !== this.settings.flyby || state.side !== this.settings.side) {
        this.changeState(state);
        if (state.type === 'flyby') {
          change = true;
        }
      }
      const actions = this.transitions[this.state];
      const action = this.transitions[this.state][actionName];

      const config = payload;
      config['settings'] = state;
      config['type'] = this.state;

      if (action) {
        action.call(self, config, change);
      }
    },
    changeState(conf) {
      // check valid state
      this.state = conf.type;
      this.settings['flyby'] = +conf.flyby || undefined;
      this.settings['side'] = conf.side || undefined;
      this.settings['type'] = conf.type || undefined;
    },
  };
}

export { fsm, fsmConfig };
