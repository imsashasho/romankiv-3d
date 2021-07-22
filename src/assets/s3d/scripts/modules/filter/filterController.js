class FilterController {
  constructor(model, view) {
    this._model = model;
    this._view = view;

    view.on('resetFilter', () => {
      model.resetFilter();
    });
    view.on('changeFilterHandler', () => {
      model.filterFlatStart();
    });
    view.on('resizeHandler', () => {
      model.deb(model);
    });
  }
}

export default FilterController;
