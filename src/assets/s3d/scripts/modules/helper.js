import $ from 'jquery';
import gsap from 'gsap';
import BezierEasing from 'bezier-easing';

class Helper {
  constructor(data) {
    this.currentWindow = 0;
  }

  async init() {
    if (status === 'local') {
      await $.ajax(`${defaultModulePath}template/helper.php`)
        .then(helper => { this.helper = JSON.parse(helper); });
    } else {
      await $.ajax('/wp-admin/admin-ajax.php', {
        method: 'POST',
        data: { action: 'getHelper' },
      }).then(helper => { this.helper = JSON.parse(helper); });
    }

    $('.js-s3d__slideModule').append(this.helper);
    await $.ajax(`${defaultStaticPath}configHelper.json`)
      .then(responsive => this.setConfig(responsive));

    $('.js-s3d__helper__close').on('click', () => {
      this.hiddenHelper();
    });

    $('.js-s3d__helper__link').on('click', () => {
      $('.js-s3d__helper__content').removeClass('s3d-active');
      this.currentWindow++;
      if (this.conf.length <= this.currentWindow) {
        this.hiddenHelper();
        return;
      }
      this.update(this.conf[this.currentWindow]);
    });

    const openHelper = $('.js-s3d-ctr__open-helper');
    if (_.size(openHelper) > 0) {
      openHelper.on('click', () => {
        this.currentWindow = 0;
        this.update(this.conf[0]);
        this.showHelper();
      });
    }

    window.addEventListener('resize', () => {
      if (this.currentWindow >= this.conf.length) return;
      this.update(this.conf[this.currentWindow]);
    });

    if (window.localStorage.getItem('info')) return;
    this.update(this.conf[0]);
    this.showHelper();
  }

  setConfig(config) {
    let type = 'desktop';
    if (document.documentElement.offsetWidth < 992) {
      type = 'mobile';
    }
    const lang = $('html')[0].lang || 'ua';
    this.conf = config[type][lang];
  }

  update(conf) {
    const result = [];
    const wrap = $('.js-s3d__helper__active');
    const helper = $('.js-s3d__helper')[0];

    const promise = new Promise(callback => {
      wrap[0].style.opacity = 0;
      helper.style.opacity = 0;
      setTimeout(() => {
        callback();
      }, 250);
    });
    promise.then(() => {
      wrap.html('');
      if (_.isString(conf.elem)) {
        result.push(this.updateActiveElement($(conf.elem)[0]));
        result.push(this.createActiveElementBlock($(conf.elem)[0]));
      } else {
        conf.elem.forEach(name => {
          result.push(this.updateActiveElement($(name)[0]));
          result.push(this.createActiveElementBlock($(name)[0]));
        });
      }

      $('.js-s3d__helper')[0].dataset.step = this.currentWindow;
      wrap.append(...result);
      this.updateContent(conf);
    }).then(() => {
      helper.style.opacity = 1;
      wrap[0].style.opacity = 1;
    });
  }

  showHelper() {
    $('.js-s3d__helper-wrap').addClass('s3d-active');
  }

  hiddenHelper() {
    $('.js-s3d__helper-wrap').removeClass('s3d-active');
    window.localStorage.setItem('info', true);
  }

  updateContent(config) {
    const wrap = $('.js-s3d__helper-wrap');
    wrap.find('[data-type="title"]').html(config.title);
    wrap.find('[data-type="text"]').html(config.text);
    wrap.find('[data-type="next"]').html(config.linkName);
  }

  updateActiveElement(flat) {
    const node = flat.cloneNode(true);
    const cor = flat.getBoundingClientRect();
    node.style.position = 'absolute';
    node.style.transform = 'none';
    node.style.top = `${cor.y}px`;
    node.style.left = `${cor.x}px`;
    node.style.height = `${flat.offsetHeight}px`;
    node.style.width = `${flat.offsetWidth}px`;
    return node;
  }

  createActiveElementBlock(flat) {
    const node = document.createElement('div');
    const cor = flat.getBoundingClientRect();
    node.classList = 's3d__helper-event';
    node.style.position = 'absolute';
    node.style.transform = 'none';
    node.style.top = `${cor.y}px`;
    node.style.left = `${cor.x}px`;
    node.style.height = `${flat.offsetHeight}px`;
    node.style.width = `${flat.offsetWidth}px`;
    return node;
  }
}

class HelperGif {
  constructor(data) {
    this.currentWindow = 0;
    this.easing = new BezierEasing(0, 1, 1, 0);
    this.animation = gsap.timeline({ duration: 0.4, ease: this.easing });
  }

  async init() {
    await $.ajax(`${defaultModulePath}template/helperGif.php`)
      .then(helper => {
        // document.querySelector('.js-s3d__slideModule')
        document.querySelector('body')
          .insertAdjacentHTML('afterend', JSON.parse(helper));
      });

    this.wrap = document.querySelector('.js-s3d__helper-gif-wrap');

    await $.ajax(`${defaultStaticPath}configHelperGif.json`)
      .then(responsive => this.setConfig(responsive));

    $('.js-s3d__helper-gif__close').on('click', () => {
      this.hiddenHelper();
    });

    $('.js-s3d__helper-gif__link').on('click', () => {
      this.currentWindow++;
      if (this.conf.length <= this.currentWindow) {
        this.hiddenHelper();
        return;
      }
      this.update(this.conf[this.currentWindow]);
    });

    const openHelper = $('.js-s3d-ctr__open-helper');
    if (_.size(openHelper) > 0) {
      openHelper.on('click', () => {
        this.currentWindow = 0;
        this.update(this.conf[0]);
        this.showHelper();
      });
    }
    // window.addEventListener('resize', () => {
    //   if (this.currentWindow >= this.conf.length) return;
    //   this.update(this.conf[this.currentWindow]);
    // });

    if (window.localStorage.getItem('info')) return;
    this.updateContent(this.conf[0], () => {
      this.triggerGif(this.currentWindow);
    });
    this.wrap.querySelector('[data-all_count]').innerHTML = this.conf.length;
    setTimeout(() => {
      this.showHelper();
    }, 500);
  }

  setConfig(config) {
    let type = 'desktop';
    if (document.documentElement.offsetWidth < 992) {
      type = 'mobile';
    }
    const lang = $('html')[0].lang || 'ua';
    this.conf = config[type][lang];
  }

  update(conf) {
    this.updateContent(conf, () => {
      this.triggerGif(this.currentWindow, 'hide');
      this.triggerGif(this.currentWindow + 1);
    });
  }

  showHelper() {
    this.wrap.classList.add('s3d-active');
  }

  hiddenHelper() {
    this.wrap.classList.remove('s3d-active');
    window.localStorage.setItem('info', true);
    this.triggerGif(this.currentWindow, 'hide');
  }

  updateContent(config, cb) {
    const helper = document.querySelector('.js-s3d__helper-gif');
    helper.dataset.step = this.currentWindow;

    const titleContainer = this.wrap.querySelector('[data-type="title"]');
    const closeContainer = this.wrap.querySelector('[data-type="close"]');
    const groupContainer = this.wrap.querySelector('.s3d__helper-gif__group');
    const countCurrentContainer = this.wrap.querySelector('[data-current_count]');

    this.animation
      .fromTo(titleContainer, { opacity: 1 }, { opacity: 0 })
      .fromTo(closeContainer, { opacity: 1 }, { opacity: 0 }, '<')
      .fromTo(groupContainer, { opacity: 1 }, { opacity: 0 }, '<')
      .then(() => {
        titleContainer.innerHTML = config.title;
        closeContainer.innerHTML = config.close;
        countCurrentContainer.innerHTML = this.currentWindow + 1;
        cb();
        this.animation
          .fromTo(titleContainer, { opacity: 0 }, { opacity: 1 })
          .fromTo(closeContainer, { opacity: 0 }, { opacity: 1 }, '<')
          .fromTo(groupContainer, { opacity: 0 }, { opacity: 1 }, '<');
      }, '>');
  }

  triggerGif(num, type = 'show') {
    const numId = (num > 0) ? num : 1;
    const container = document.getElementById(`animated-svg-${numId}`);
    const easing = new BezierEasing(0, 1, 1, 0);
    const animate = gsap.timeline({ direction: 1.8, ease: easing });
    const prevAlpha = (type === 'hide') ? 1 : 0;
    const pastAlpha = (type === 'hide') ? 0 : 1;
    container.contentDocument
      .querySelector('svg')
      .dispatchEvent(new Event('click'));
    animate.fromTo(container, { autoAlpha: prevAlpha }, { autoAlpha: pastAlpha });
  }
}


export { Helper, HelperGif };
