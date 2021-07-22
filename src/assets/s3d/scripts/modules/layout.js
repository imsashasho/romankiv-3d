class Layout {
  constructor(data) {
    this.type = data.type;
    // this.loader = data.loader
    this.wrapperId = data.idCopmlex;
    this.wrapper = $(`.js-s3d__wrapper__${this.wrapperId}`);
    this.click = data.click;
    this.configProject = data.configProject;
    this.scrollToBlock = data.scrollToBlock;
    this.update = this.update.bind(this);
    this.setFloorInPage = this.setFloorInPage.bind(this);
    this.changeCurrentFloor = data.changeCurrentFloor;
    this.floorEventType = 'mouseover'; // event for helper
    this.ActiveHouse = data.ActiveHouse;
    this.preloader = preloader();
  }

  init(conf) {
    this.update(conf);
    this.changeFloorHtml(conf);
    let event = {};
    this.wrapper.on('click', 'g', e => {
      e.preventDefault();
      this.activeSvg = $(e.target).closest('svg');
      $(this.activeSvg).css({ fill: '' });
      $('.s3d-floor__helper').css({ visibility: 'hidden', opacity: 0, top: '-10000px' });
      if (!isDevice()) {
        this.click(e, this.type);
      } else {
        this.updateInfoFloor(e);
        event = e;
        $('.s3d-floor__helper-close').on('click', () => {
          $('.s3d-floor__helper').css({ visibility: 'hidden', opacity: 0, top: '-10000px' });
        });
      }
    });

    $('.s3d-floor__helper').on('click', e => {
      if ($(e.target).closest('.s3d-floor__helper-close').length === 0) {
        $('.s3d-floor__helper').css({ visibility: 'hidden', opacity: 0, top: '-10000px' });
        this.click(event, this.type);
      }
    });
    if (isDevice()) {
      this.floorEventType = 'click';
    }
  }

  updateConfig(conf) {
    this.wrapperId = this.type;
    this.type = conf.type;
    this.section = conf.section;
    this.floor = conf.floor;
  }

  update(e) {
    // let data = {house: e.house, section: e.section, floor: e.floor};
    this.changeFloor(+e.floor);
    // this.getFloor(data, this.setFloorInPage);
  }

  changeFloor(num) {
    this.changeCurrentFloor(num);
    this.preloader.show();
    $('.js-s3d-nav-floor__left-num').data('active', num).html(num);
    $('.js-s3d-nav-floor__list .active').removeClass('active');
    $(`.js-s3d-nav-floor__list [data-nav-floor = ${num}]`).addClass('active');
    this.getFloor({ house: this.ActiveHouse.get(), floor: num }, this.setFloorInPage);
  }

  changeFloorHtml(conf) {
    const s3dSelectFloorTitle = 'Оберіть квартиру';
    const s3dSelectFloorName = 'поверх';
    const s3dSelectHouseName = 'дом';
    const { min } = this.configProject.floor;
    const activeFloor = conf.floor;
    const activeHouse = this.ActiveHouse.get();
    let florList = '';
    for (let i = min; i <= this.configProject.floor.max; i++) {
      florList += (+i === +activeFloor) ? `<span class="active" data-nav-floor="${activeFloor}">${activeFloor}</span>` : `<span data-nav-floor="${i}">${i}</span>`;
    }
    const panel = ` <div class="s3d-nav-floor__top">
                            <svg width="57" height="57" viewBox="0 0 57 57" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M52.7516 30.1518C51.7291 27.0909 50.7066 24.0299 49.6842 20.969C49.1957 19.507 46.434 19.5711 46.9758 21.193C47.564 22.9539 48.1522 24.7148 48.7404 26.4756C41.539 19.6661 32.4339 14.5944 22.2188 15.9004C15.478 16.7622 9.24346 20.2425 4.25121 24.7523C3.13316 25.7623 2.02646 26.8276 1.07601 28.0009C0.456862 28.7653 1.53342 31.2791 2.16319 30.5016C9.20162 21.8123 21.2883 16.4048 32.3532 19.1885C38.2514 20.6723 43.3616 24.1172 47.7785 28.209C45.8691 27.7916 43.9596 27.3743 42.0502 26.957C40.2756 26.5692 40.1693 29.0736 41.8287 29.4363C44.9813 30.1253 48.134 30.8144 51.2867 31.5034C52.003 31.66 53.0308 30.9874 52.7516 30.1518Z" fill="#FF1E3C"/></svg>
                            <span class="s3d-nav-floor__top--text"> ${s3dSelectFloorTitle} </span>
                        </div>
                        <div class="s3d-nav-floor__content js-s3d-nav-floor__hover">
                             <div class="s3d-nav-floor__house">
                                <span class="s3d-nav-floor__house-name">${s3dSelectHouseName}</span>
                                <span class="s3d-nav-floor__house-num js-s3d-nav-floor__house-num" data-active="${activeHouse}">${activeHouse}</span>
                                
                            </div>
                            <div class="s3d-nav-floor__left">
                                <span class="s3d-nav-floor__left-num js-s3d-nav-floor__left-num" data-active="${activeFloor}">${activeFloor}</span>
                                <span class="s3d-nav-floor__left-name">${s3dSelectFloorName}</span>
                            </div>
                            <div class="s3d-nav-floor__arrow">
                                <img class="s3d-nav-floor__up js-s3d-nav-floor__up" src="https://boston-wp.smarto.agency/wp-content/themes/boston/assets/images/common/floor-arrow.svg" alt="arrow" class="s3d-nav-floor__arrow-up">
                                <img class="s3d-nav-floor__down js-s3d-nav-floor__down" src="https://boston-wp.smarto.agency/wp-content/themes/boston/assets/images/common/floor-arrow.svg" alt="arrow" class="s3d-nav-floor__arrow-down">
                            </div>
                             <button type="button" class="s3d-nav-floor__button js-s3d-nav-floor__select">
                                <span>Сменить этаж:</span>
                                <img class="s3d-nav-floor__down" src="https://boston-wp.smarto.agency/wp-content/themes/boston/assets/images/common/floor-arrow.svg" alt="arrow" class="s3d-nav-floor__arrow-down">
                            </button>
                            <div class="s3d-nav-floor__list js-s3d-nav-floor__list">
                                   ${florList}
                            </div>
                        </div>`;
    createMarkup('div', `#js-s3d__wrapper__${this.wrapperId}`, {
      class: `s3d-nav-${this.wrapperId}`,
      content: panel,
    });

    if (!isDevice()) {
      $('.js-s3d-nav-floor__hover').on('mouseover', function () {
        const list = $('.js-s3d-nav-floor__list');
        const button = $('.js-s3d-nav-floor__select');
        list.addClass('active');
        button.addClass('active');
        $(this).addClass('.s3d-nav-floor-active');
        list.on('mouseout', event);
      });
    } else {
      $('.js-s3d-nav-floor__select').on('click', function () {
        const list = $('.js-s3d-nav-floor__list');
        const button = $('.js-s3d-nav-floor__select');
        if (!list.hasClass('active')) {
          closeNumList(this);
        } else {
          $(document).click(closeNumList);
          list.addClass('active');
          button.addClass('active');
        }
        list.toggleClass('active');
        button.toggleClass('active');
      });
    }

    function event() {
      $('.js-s3d-nav-floor__list').removeClass('active');
      $('.js-s3d-nav-floor__select').removeClass('active');
      $('.js-s3d-nav-floor__list').off('mouseout', event);
    }

    function closeNumList(e) {
      $('.js-s3d-nav-floor__list').removeClass('active');
      $(document).off('click', closeNumList);
    }

    $('.js-s3d-nav-floor__list').on('click', e => {
      const num = $(e.target).data('nav-floor');
      if (num) this.changeFloor(num);
    });

    $('.js-s3d-nav-floor__up').on('click', () => {
      const res = $('.s3d-nav-floor__left-num').data('active');
      if (res < this.configProject.floor.max) this.changeFloor(res + 1);
    });

    $('.js-s3d-nav-floor__down').on('click', () => {
      const res = $('.s3d-nav-floor__left-num').data('active');
      if (res > this.configProject.floor.min) this.changeFloor(res - 1);
    });
    // $(window).resize(this.resize);
  }

  getFloor(data, callback) {
    const dat = `action=getFloor&house=${data.house}&floor=${data.floor}`;
    $.ajax({
      type: 'POST',
      // url: '/wp-admin/apParse.php',
      url: '/wp-admin/admin-ajax.php',
      data: dat,
      success: res => callback(res),
    });
  }

  resize() {
    const width = $(document).width();
    const height = $(document).height();
    if (width <= 1024) {
      $('#js-s3d__floor svg').css({ width: '', height: `${$('#js-s3d__floor').width() - 20}px` });
      $('#js-s3d__floor').css({ width: '', height: `${$('#js-s3d__floor').width() - 20}px` });
    } else if (width > height) {
      $('#js-s3d__floor svg').css({ width: `${$('#js-s3d__floor').height()}px`, height: '100%' });
      $('#js-s3d__floor').css({ width: `${$('#js-s3d__floor').height()}px`, height: '100%' });
    } else {
      $('#js-s3d__floor svg').css({
        width: `${$('#js-s3d__floor').height()}px`,
        height: `${$('#js-s3d__floor').width()}px`,
      });
      $('#js-s3d__floor').css({
        width: `${$('#js-s3d__floor').height()}px`,
        height: `${$('#js-s3d__floor').width()}px`,
      });
    }
  }

  setFloorInPage(data) {
    $(`#js-s3d__${this.wrapperId}`).html(JSON.parse(data));
    updateSizeTip(1, $('.entrance-flats__item_floor--active'), '.svg-tip-plan-floor-', $('#floor--svg'));

    // this.resize();
    this.preloader.hide(this.type);
    $('#js-floor svg').on(this.floorEventType, this.updateInfoFloor);
    $('#js-floor svg polygon').on('mouseout', () => $('.s3d-floor__helper').css({ top: '', left: '', opacity: '' }));
  }

  updateInfoFloor(e) {
    // function getImage(src, callback){
    //     $.ajax({
    //         type: 'POST',
    //         // url: '/wp-admin/apParse.php',
    //         url: '/wp-admin/admin-ajax.php',
    //         data: `action=getImageCompress&src=${src}`,
    //         success: data => callback(data)
    //     })
    // }
    if (e.target.tagName === 'polygon') {
      // const height = $('.s3d-floor__helper').height();
      $('.s3d-floor__helper').css({ opacity: 0 });
      const Xinner = e.pageX || e.targetTouches[0].pageX;
      const Yinner = e.pageY || e.targetTouches[0].pageY;

      const param = $(e.target)[0].closest('g').dataset;
      // if (param.image) getImage(param.image, (data)=>{$('.js-s3d-floor__helper-img').html(data)});
      // if (param.hoverImage) {
      //     $('.js-s3d-floor__helper-img').attr('src', param.hoverImage);
      // } else
      if (param.image) {
        $('.js-s3d-floor__helper-img').attr('src', param.image);
      }
      if (param.type) $('.js-s3d-floor__helper-type').html(param.type);
      if (param.rooms) $('.js-s3d-floor__helper-flat').html(param.rooms);
      if (param.square) $('.js-s3d-floor__helper-area').html(param.square);
      if (param.living) $('.js-s3d-floor__helper-place').html(param.living);

      $('.s3d-floor__helper').css({
        visibility: 'visible', top: Yinner - 120, left: Xinner, opacity: 1,
      });
    } else {
      $('.s3d-floor__helper').css({
        visibility: 'hidden', top: '', left: '', opacity: '',
      });
    }
  }
}
