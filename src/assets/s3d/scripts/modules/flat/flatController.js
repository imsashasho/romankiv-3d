class FlatController {
  constructor(model, view) {
    this._model = model;
    this._view = view;
    // view.on('clickBackHandler', event => {
    //   window.history.back()
    //   // this._model.history.stepBack({ type: 'complex', method: 'general' })
    //   // model.updateFsm('complex', 'general')
    // })
    view.on('clickFlatHandler', event => {
      event.preventDefault();
      this._model.history.update({ type: 'flat', method: 'general', id: event.currentTarget.dataset.id });
      this._model.getNewFlat(event.currentTarget.dataset.id);
    });
    view.on('flatReturnHandler', () => {
      this._model.history.update({ type: 'flyby', method: 'search', id: this._model.activeFlat });
      this._model.updateFsm({ type: 'flyby', method: 'search' }, this._model.activeFlat);
    });
    view.on('changeRadioType', event => {
      this._model.radioTypeHandler(event.currentTarget.dataset.type);
    });
    view.on('changeRadioView', event => {
      this._model.radioViewHandler(event.currentTarget.dataset.type);
    });
    view.on('changeRadioChecked', event => {
      this._model.radioCheckedHandler(event.currentTarget.control.checked);
    });
    view.on('updateHoverDataFlat', event => {
      this._model.updateMiniInfo(event);
    });

    view.on('clickPdfHandler', event => {
      this._model.getPdfLink(event.currentTarget.dataset.id);
    });
  }
}

export default FlatController;
