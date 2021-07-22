import $ from 'jquery';

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

      this.updateContent(conf);
      $('.js-s3d__helper')[0].dataset.step = this.currentWindow;
      wrap.append(...result);
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

export default Helper;
