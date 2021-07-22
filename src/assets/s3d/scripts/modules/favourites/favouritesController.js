import $ from 'jquery';

class FavouritesController {
  constructor(model, view) {
    this._model = model;
    this._view = view;

    view.on('clickFavouriteOpen', () => {
      model.openFavouritesHandler();
    });

    view.on('clickFavouriteAdd', event => {
      model.addFavouritesHandler(event, +event.currentTarget.dataset.id);
    });

    view.on('removeElement', event => {
      const element = $(event.target).closest('.js-s3d-card');
      model.removeElemStorage(element.data('id'));
      view.removeElemInPage(element);
    });

    view.on('clickElementHandler', event => {
      if (event.target.classList.contains('js-s3d-card__close') || event.target.classList.contains('js-s3d-add__favourites')) return;
      model.selectElementHandler(+event.currentTarget.dataset.id);
    });
  }
}

export default FavouritesController;
