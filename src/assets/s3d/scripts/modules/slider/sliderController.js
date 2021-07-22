import { isDevice } from '../checkDevice';

class SliderController {
  constructor(model, view) {
    this._model = model;
    this._view = view;

    if (!isDevice('mobile')) {
      view.on('mouseKeyDown', event => model.sliderRotateStart(event));
      view.on('mouseMove', event => model.mouseMoveHandler(event));
      view.on('mouseKeyUp', event => model.sliderRotateEnd(event));
    }
    view.on('keyPress', event => model.keyPressHandler(event));
    view.on('touchPolygon', event => { model.touchPolygonHandler(event); });
  }
}

export default SliderController;
