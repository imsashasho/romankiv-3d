import $ from 'jquery';
import EventEmitter from '../eventEmitter/EventEmitter';

class FavouritesView extends EventEmitter {
  constructor(model, elements) {
    super();
    this._model = model;
    this._elements = elements;

    $('.js-s3d__slideModule').on('click', '.js-s3d__favourites', () => {
      this.emit('clickFavouriteOpen');
    });
    $('.js-s3d__slideModule').on('change', '.js-s3d-add__favourites', event => {
      this.emit('clickFavouriteAdd', event);
    });
    $('.js-s3d-fv').on('click', '.js-s3d-card__close', event => {
      this.emit('removeElement', event);
    });
    $('.js-s3d-fv').on('click', '.js-s3d-card', event => {
      this.emit('clickElementHandler', event);
    });

    model.on('clearAllHtmlTag', tag => { this.clearHtml(tag); });
    model.on('updateFavouriteAmount', value => { this.updateAmount(value); });
    model.on('updateViewAmount', value => { this.viewAmountFavourites(value); });
    model.on('setInPageHtml', tag => { this.addElementInPage(tag); });
    model.on('removeElemInPageHtml', elem => { this.removeElemInPage(elem); });
    model.on('animateFavouriteElement', data => { this.animateFavouriteElement(data); });
  }

  removeElemInPage(element) {
    $(element).remove();
  }

  clearHtml(tag) {
    $(tag).remove();
  }

  addElementInPage(favourites) {
    $('.js-s3d-fv__list').append(...favourites);
  }

  updateAmount(value) {
    $('.js-s3d-favourites-amount').html(value);
    $('.js-s3d-favourites').attr('count', value);
    $('.js-s3d__amount-flat__selected').html(value);
  }

  viewAmountFavourites(flag) {
    if (flag) {
      $('.js-s3d-favorite__wrap').removeClass('s3d-hidden');
      $('.js-s3d-ctr__favourites-bg').addClass('s3d-show');
    } else {
      $('.js-s3d-favorite__wrap').addClass('s3d-hidden');
      $('.js-s3d-ctr__favourites-bg').removeClass('s3d-show');
    }
  }
}

export default FavouritesView;
