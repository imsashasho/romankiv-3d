document.addEventListener('DOMContentLoaded', global => {
  init()
})

const nameProject = 'template'
const { BehaviorSubject } = rxjs
const status = 'local'
// const status = 'dev'
// const status = 'prod'

function init() {
  window.createMarkup = CreateMarkup
  const config = {
    flyby: {
      1: {
        outside: {
          id: 'flyby_1_outside',
          generalWrapId: '#js-s3d__wrapper',
          imageUrl: `/wp-content/themes/${nameProject}/assets/s3d/images/${nameProject}/complex/`,
          class: 'js-s3d__wrapper',
          numberSlide: {
            min: 0,
            max: 119,
          },
          controlPoint: [29, 60, 88, 117],
          activeSlide: 29,
          mouseSpeed: 1,
          startDegCompass: 28,
        },
        inside: {
          id: 'flyby_1_inside',
          generalWrapId: '#js-s3d__wrapper',
          imageUrl: `/wp-content/themes/${nameProject}/assets/s3d/images/${nameProject}/courtyard/`,
          class: 'js-s3d__wrapper',
          numberSlide: {
            min: 0,
            max: 119,
          },
          controlPoint: [12, 42, 72, 108],
          activeSlide: 12,
          mouseSpeed: 1,
          startDegCompass: 28,
        },
      },
    },
    favourites: {
      id: 'favourites',
      generalWrapId: '.js-s3d__slideModule',
    },
    flat: {
      id: 'flat',
      generalWrapId: '.js-s3d__slideModule',
    },
    plannings: {
      id: 'plannings',
      generalWrapId: '.js-s3d__slideModule',
    },
  }

  new Promise(resolve => {
    loader(resolve, config.flyby[1].outside.activeSlide)
  }).then(value => {
    document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`)
    if (!value.fastSpeed) {
      // else speed slowly update link with light image
      for (const pr in config) {
        if (config[pr].imageUrl) {
          config[pr].imageUrl += 'mobile/'
        }
      }
    }
    if (isDevice('mobile') || document.documentElement.offsetWidth <= 768) {
      $('.js-s3d__slideModule').addClass('s3d-mobile')
    }

    config.flyby[1].outside['browser'] = Object.assign(isBrowser(), value)
    const app = new AppModel(config)
    const appView = new AppView(app, {
      switch: $('.js-s3d__select'),
      wrapper: $('.js-s3d__slideModule'),
    })
    const appController = new AppController(app, appView)
    app.init()

    $(window).resize(() => {
      document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`)
    })
  })
}

window.checkValue = val => !val || val === null || val === undefined || (typeof val === 'number' && isNaN(val))
