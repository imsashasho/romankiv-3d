import $ from 'jquery';
import placeElemInWrapperNearMouse from './placeElemInWrapperNearMouse';

class InfoBox {
  constructor(data) {
    this.infoBox = '';
    this.hoverFlatId = null;
    this.activeFlat = data.activeFlat;
    this.updateFsm = data.updateFsm;
    this.state = 'static';
    this.stateConfig = ['static', 'hover', 'active'];
    this.history = data.history;
    this.isInfoBoxMoving = false;
    this.changeState = this.changeState.bind(this);
    this.disable = this.disable.bind(this);
    this.init();
  }

  init() {
    this.createInfo();
    this.infoBox.on('click', '[data-s3d-event=closed]', () => {
      this.updateState('static');
      this.removeSvgFlatActive();
    });

    this.infoBox.on('click', '[data-s3d-event=transition]', event => {
      event.preventDefault();
      if (_.has(event.currentTarget.dataset, 'id')) {
        this.activeFlat = +event.currentTarget.dataset.id;
      } else {
        return;
      }

      this.history.update({ type: 'flat', method: 'general', id: this.activeFlat });
      this.updateState('static');

      this.updateFsm({
        type: 'flat', method: 'general',
      }, this.activeFlat);
    });

    if (this.isInfoBoxMoving) {
      this.infoBox.addClass('s3d-infoBox__moving');
    }
  }

  removeSvgFlatActive() {
    $('.js-s3d__svgWrap .active-flat').removeClass('active-flat');
  }

  updateHoverFlat(id) {
    this.hoverFlatId$.next(id);
  }

  // updateState use only from this class. change state without check exceptions
  updateState(state, flat) {
    if (this.stateConfig.includes(state)) {
      this.state = state;
    }
    this.dispatch(flat);
  }

  changeState(value, flat = null) {
    const id = _.has(flat, 'id') ? _.toNumber(flat.id) : undefined;
    // debugger;
    if (this.state === 'active') {
      if (this.state !== value) {
        return;
      }
      console.log(id);
      this.hoverFlatId = id;
      this.updateInfo(flat);
      return;
    }

    if (checkValue(flat)) {
      this.updateState('static', null);
      return;
    }

    if (value === 'hover') {
      if (id === this.hoverFlatId) {
        // return;
      } else if (value === this.state) {
        this.hoverFlatId = id;
        this.updateInfo(flat);
      } else {
        this.updateState(value, flat);
      }
    } else if (value !== this.state) {
      this.updateState(value, flat);
    }
  }

  dispatch(flat) {
    switch (this.state) {
        case 'static':
          this.hoverFlatId = null;
          this.infoBox.removeClass('s3d-infoBox-active');
          this.infoBox.removeClass('s3d-infoBox-hover');

          break;
        case 'hover':
          this.hoverFlatId = +flat.id;
          this.infoBox.removeClass('s3d-infoBox-active');
          this.infoBox.addClass('s3d-infoBox-hover');
          this.updateInfo(flat, true);
          break;
        case 'active':
          this.hoverFlatId = +flat.id;
          this.infoBox.addClass('s3d-infoBox-active');
          this.infoBox.removeClass('s3d-infoBox-hover');
          this.infoBox.find('[data-s3d-update=id]').data('id', flat.id);
          this.updateInfo(flat, true);
          break;
        default:
          this.hoverFlatId = null;
          this.infoBox.removeClass('s3d-infoBox-active');
          this.infoBox.removeClass('s3d-infoBox-hover');
          break;
    }
  }

  update(flat, state) {
    this.updateInfo(flat);
    if (state !== undefined) {
      this.updateState(state);
    }
  }

  disable(value) {
    if (this.infoBox === '') {
      return;
    }

    if (value) {
      this.infoBox.addClass('s3d-infoBox__disable');
    } else {
      this.infoBox.removeClass('s3d-infoBox__disable');
    }
  }

  createInfo() {
    this.infoBox = $('[data-s3d-type=infoBox]');
  }

  updatePosition(e) {
    if (!this.isInfoBoxMoving) {
      return;
    }
    // передвигаем блок за мышкой
    // const pos = $('.s3d__wrap').offset();
    // const x = e.pageX - pos.left;
    // const y = e.pageY - pos.top;
    const { x, y } = placeElemInWrapperNearMouse(this.infoBox, $(window), e);
    this.infoBox.css({
      top: y,
      opacity: '1',
      left: x,
    });
  }

  updateInfo(e, ignore) {
    if (_.isUndefined(e)) {
      return;
    }
    const keys = ['rooms', 'floor', 'number', 'type'];
    keys.map(key => {
      this.infoBox.find(`[data-s3d-update=${key}]`)[0].textContent = `${e[key] || ''}`;
      return key;
    });
    this.infoBox.find('.js-s3d-add__favourites')[0].dataset.id = e.id;
    const elemUpdateId = this.infoBox[0].querySelectorAll('[data-s3d-update=id]');
    elemUpdateId.forEach(element => {
      const el = element;
      el.dataset.id = e.id;
    });
    // this.infoBox.find('[data-s3d-update=id]').data('id', e.id);
    // this.infoBox.find('[data-s3d-update=id]')[0].dataset.id = e.id;
    this.infoBox.find('[data-s3d-update=area]')[0].textContent = `${e.area || ''}`;
    this.infoBox.find('[data-s3d-update="image"]')[0].src = e['img_small'] ? e['img_small'] : `${defaultProjectPath}/s3d/images/examples/no-image.png`;
    // this.infoBox.find('[data-s3d-update=image]')[0].src = e['img_small'] ? defaultProjectPath + e['img_small'] : `${defaultProjectPath}/s3d/images/examples/no-image.png`;
    this.infoBox.find('[data-s3d-update=checked]')[0].checked = e.favourite || false;
  }
}
export default InfoBox;
