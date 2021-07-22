import $ from 'jquery';

class AppController {
  constructor(model, view) {
    this._model = model;
    this._view = view;

    view.on('chooseSlider', event => this._model.selectSlideHandler(event));
    view.on('resize', () => model.deb(model));
    // view.on('openPopupChangeFlyby', event => model.)
    view.on('clickBackHandler', event => {
      window.history.back();
    });
    view.on('clickToHomeHandler', () => {
      this._model.history.update(model.defaultFlybySettings);
      model.updateFsm(model.defaultFlybySettings);
    });

    this.showFilterChange();
  }

  showFilterChange() {
    $('.js-s3d-controller__showFilter').on('click', () => {
      this._view.checkAvailableFlat();
    });
  }

  // $('.js-s3d-controller__elem').on('click', '.s3d-select', e => {
  // 	const { type } = e.currentTarget.dataset
  // 	if (type && type !== this.activeSection) {
  // 		this.history.update(type)
  // 		this.selectSlider(e, type)
  // 	}
  // })
}

export default AppController;
