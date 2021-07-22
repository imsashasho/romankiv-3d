import ionRangeSlider from 'ion-rangeslider';
import $ from 'jquery';
import _ from 'lodash';
import EventEmitter from '../eventEmitter/EventEmitter';
import {
  addBlur, debounce,
} from '../general/General';

// for update filter params. set new nameParam in functions (getTypeFilterParam, getMinMaxParam )
class FilterModel extends EventEmitter {
  constructor(config) {
    super();
    this.types = {
      area: 'range',
      floor: 'range',
      rooms: 'checkbox',
      option: 'option',
    };
    this.configProject = {};
    this.updateCurrentFilterFlatsId = config.updateCurrentFilterFlatsId;
    this.flats = config.flats;
  }

  init() {
    this.configProject = this.createFilterParam(this.flats);
    this.emit('setAmountAllFlat', _.size(this.flats));
    this.filterFlatStart();
    this.deb = debounce(this.resize.bind(this), 500);
  }

  // запускает фильтр квартир
  filterFlatStart() {
    addBlur('.js-s3d-filter__table');
    addBlur('.s3d-pl__right');
    const filterSettings = this.getFilterParam(this.configProject);
    this.updateAllParamFilter(filterSettings);
    const flats = this.startFilter(this.flats, filterSettings);
    this.emit('setAmountSelectFlat', flats.length);
    this.updateCurrentFilterFlatsId(flats);

    this.emit('showSelectElements', flats);
  }

  createFilterParam(flats) {
    let filterParams = {};
    for (const type in this.types) {
      const typeNames = this.types[type];
      let param = {};
      let rangeParam;
      switch (typeNames) {
          case 'range':
            rangeParam = this.createParam(flats, type, this.createRangeParam.bind(this));
            _.forIn(rangeParam, (setting, key) => {
              param[key] = {
                type: 'range',
                elem: this.createRange(setting),
              };
            });
            break;
          case 'checkbox':
            param = this.createParam(flats, type, this.createCheckedParam);
            break;
          case 'option':
            param = this.createParam(flats, type, this.createOptionParam);
            break;
          default:
            param = {};
            break;
      }
      filterParams = {
        ...filterParams,
        ...param,
      };
    }
    return filterParams;
  }

  createParam(flats, keyFilter, callback) {
    const data = Object.keys(flats);
    const configProject = data.reduce((acc, key) => {
      const flat = flats[key];
      return { ...acc, ...callback(flat, keyFilter, acc) };
    }, {});
    return configProject;
  }

  // нужно переписать #change
  createRangeParam(flat, name, acc) {
    if (!_.has(flat, name)) {
      return acc;
    }
    const setting = acc;
    if (!setting[name]) {
      setting[name] = { min: flat[name], max: flat[name] };
      return setting;
    }
    if (flat[name] < setting[name].min) {
      setting[name].min = flat[name];
    }
    if (flat[name] > setting[name].max) {
      setting[name].max = flat[name];
    }
    setting[name].type = name;
    return setting;
  }

  createCheckedParam(flat, name, acc) {
    if (!_.has(flat, name)) {
      return acc;
    }
    const elements = document.querySelectorAll(`.js-s3d-filter__${name} [data-type = ${name}]`);
    const value = [];
    elements.forEach(element => {
      value.push(_.toNumber(element.dataset[name]));
    });
    const params = {
      type: 'checkbox',
      elem: elements,
      value,
    };
    return { [name]: params };
  }

  createOptionParam(flat, name) {
    const elements = document.querySelectorAll(`.js-s3d-filter__select [data-type= ${name}]`);
    const value = [];
    elements.forEach(element => {
      value.push(element.dataset[name]);
    });
    const params = {
      type: 'option',
      elem: elements,
      value,
    };
    return { [name]: params };
  }

  // создает range slider (ползунки), подписывает на события
  createRange(config) {
    if (config.type !== undefined) {
      const self = this;
      const { min, max } = config;
      const $min = $(`.js-s3d-filter__${config.type}__min--input`);
      const $max = $(`.js-s3d-filter__${config.type}__max--input`);
      $(`.js-s3d-filter__${config.type}--input`).ionRangeSlider({
        type: 'double',
        grid: false,
        min,
        max,
        from: min || 0,
        to: max || 0,
        step: config.step || 1,
        onStart: updateInputs,
        onChange: updateInputs,
        onFinish(e) {
          updateInputs(e);
          self.filterFlatStart({ min: e.from, max: e.to, ...{ type: config.type } });
        },
        onUpdate: updateInputs,
      });
      const instance = $(`.js-s3d-filter__${config.type}--input`).data('ionRangeSlider');
      instance.update({
        min,
        max,
        from: min,
        to: max,
      });

      function updateInputs(data) {
        $min.prop('value', data.from);
        $max.prop('value', data.to);
      }

      $min.on('change', function () { changeInput.call(this, 'from'); });
      $max.on('change', function () { changeInput.call(this, 'to'); });

      function changeInput(key) {
        let val = $(this).prop('value');
        if (key === 'from') {
          if (val < min) val = min;
          else if (val > instance.result.to) val = instance.result.to;
        } else if (key === 'to') {
          if (val < instance.result.from) val = instance.result.from;
          else if (val > max) val = max;
        }

        instance.update(key === 'from' ? { from: val } : { to: val });
        $(this).prop('value', val);
        self.filterFlatStart({ min: instance.result.from, max: instance.result.to, ...{ type: config.type } });
      }
      return instance;
    }
    return null;
  }

  // сбросить значения фильтра
  resetFilter() {
    this.emit('hideSelectElements');
    for (const key in this.configProject) {
      const param = this.configProject[key];

      switch (param.type) {
          case 'range':
            param.elem.update({ from: param.elem.result.min, to: param.elem.result.max });
            break;
          case 'checkbox':
            // eslint-disable-next-line no-param-reassign
            param.elem.forEach(el => { el.checked = el.checked ? false : ''; });
            break;
          case 'option':
            // eslint-disable-next-line no-param-reassign
            param.elem.forEach(el => { el.checked = el.checked ? false : ''; });
            break;
          default:
            break;
      }
    }
    const flatsKeys = Object.keys(this.flats);
    this.updateCurrentFilterFlatsId(flatsKeys);
    this.emit('setAmountSelectFlat', flatsKeys.length);
  }

  updateAllParamFilter(filterSettings) {
    for (const key in filterSettings) {
      const select = filterSettings[key];
      const typeFilterParam = this.getTypeFilterParam(key)
      let { value } = _.cloneDeep(select);
      switch (typeFilterParam) {
          case 'checkbox':
            if (_.isArray(value) && value.length === 0) {
              for (let i = +this.configProject[key].min; i <= +this.configProject[key].max; i++) {
                value.push(i);
              }
            }
            value = value.join(', ');
            this.emit('updateMiniInfo', {
              type: key, value, key: 'amount',
            });
            break;
          case 'range':
            this.emit('updateMiniInfo', {
              type: key, value: select.min, key: 'min',
            });
            this.emit('updateMiniInfo', {
              type: key, value: select.max, key: 'max',
            });
            break;
          default:
            break;
      }
    }
  }

  getTypeFilterParam(name) {
    for (const type in this.types) {
      if (this.types[type].includes(name)) return type;
    }
    return null;
  }

  // поиск квартир по параметрам фильтра
  startFilter(flats, settings) {
    const flatsId = Object.keys(flats);
    return flatsId.filter(id => {
      const settingColl = Object.entries(settings);
      return settingColl.every(([name, value]) => {
        const hasKey = _.has(flats, [id, name]);
        if (!hasKey) return false;
        switch (value.type) {
            case 'range':
              return this.checkRangeParam(flats[id], name, value);
            case 'checkbox':
              return this.checkСheckboxParam(flats[id], name, value);
            case 'option':
              return this.checkOptionParam(flats[id], name, value);
            default:
              break;
        }
        return false;
      });
    });
  }

  checkRangeParam(flat, key, value) {
    return (_.has(flat, key)
      && flat[key] >= value.min
      && flat[key] <= value.max);
  }

  checkСheckboxParam(flat, key, value) {
    return (_.includes(value.value, flat[key]) || _.size(value.value) === 0);
  }

  checkOptionParam(flat, key, value) {
    if (value.value.length === 0) return true;
    return value.value.some(name => flat[key][name]);
  }

  // добавить возможные варианты и/или границы (min, max) в список созданых фильтров
  getFilterParam(filter) {
    const settings = {};
    for (const key in filter) {
      const { type } = filter[key];
      switch (type) {
          case 'checkbox':
            settings[key] = {};
            settings[key]['value'] = [];
            filter[key].elem.forEach(el => {
              if (el.checked) {
                settings[key].value.push(_.toNumber(el.dataset[key]));
              }
            });
            break;
          case 'range':
            settings[key] = {};
            settings[key]['min'] = filter[key].elem.result.from;
            settings[key]['max'] = filter[key].elem.result.to;
            break;
          case 'option':
            settings[key] = {};
            settings[key]['value'] = [];
            filter[key].elem.forEach(el => {
              if (el.checked) {
                settings[key].value.push(el.dataset[key]);
              }
            });
            break;
          default:
            break;
      }
      settings[key].type = type;
    }
    return settings;
  }

  resize() {
    this.emit('hideFilter');
  }
}

export default FilterModel;
