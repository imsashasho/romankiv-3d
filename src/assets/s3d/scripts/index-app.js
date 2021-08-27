import BehaviorSubject from 'rxjs';
import $ from 'jquery';
import i18next from 'i18next';
import Input from './modules/input';
import loader from './modules/loaderTime';
import { isBrowser, isDevice } from './modules/checkDevice';
import {
  addBlur, unActive, preloader, updateFlatFavourite, compass, debounce,
} from './modules/general/General';
import CreateMarkup from './modules/markup';
import AppController from './modules/app/app.controller';
import AppModel from './modules/app/app.model';
import AppView from './modules/app/app.view';

document.addEventListener('DOMContentLoaded', global => {
  preloader().show();
  init();
});

// window.nameProject = 'montreal';
window.nameProject = 'bogun';
window.defaultProjectPath = `/wp-content/themes/${window.nameProject}/assets/`;
window.defaultModulePath = `/wp-content/themes/${window.nameProject}/assets/s3d/`;
window.defaultStaticPath = `/wp-content/themes/${window.nameProject}/static/`;
// window.status = 'local';
window.status = 'dev';
// window.status = 'prod';

async function loadLangFile(lang) {
  const result = await $.ajax(`${defaultStaticPath}language/${lang}.json`);
  return result;
}

async function init() {
  window.createMarkup = CreateMarkup;
  // let config;
  const config = await $.ajax(`${defaultStaticPath}settings.json`).then(resolve => resolve);
  const languageContainer = document.querySelector('.screen__lang');
  if (languageContainer) {
    document.querySelector('.header__call').insertAdjacentElement('beforeBegin', languageContainer);
  }

  const lang = document.querySelector('html').lang || 'ua';
  const langTexts = await loadLangFile(lang);
  i18next.init({
    lng: lang,
    debug: true,
    resources: {
      [lang]: langTexts,
    },
  });
  new Promise(resolve => {
    loader(resolve, config.flyby[1].outside, nameProject);
  }).then(value => {
    document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    if (!value.fastSpeed) {
      // else speed slowly update link with light image
      // for (const pr in config) {
      // if (config[pr].imageUrl || window.status !== 'local') {
      //   config[pr].imageUrl += 'mobile/';
      // }
      // }
    }

    config.flyby[1].outside['browser'] = Object.assign(isBrowser(), value);
    const app = new AppModel(config);
    const appView = new AppView(app, {
      switch: $('.js-s3d__select'),
      wrapper: $('.js-s3d__slideModule'),
    });
    const appController = new AppController(app, appView);
    app.init();
    $(window).resize(() => {
      document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    });
  });
}

window.checkValue = val => !val || val === null || val === undefined || (typeof val === 'number' && isNaN(val));
