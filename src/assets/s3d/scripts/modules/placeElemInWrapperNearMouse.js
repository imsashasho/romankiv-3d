import $ from 'jquery';

const isFit = (pos, size, wrapBorder) => ((pos + size) >= wrapBorder);
const newPosition = (width, border, offset) => (border - width + offset);

function placeElemInWrapperNearMouse(el, wrap, event, offset = 10) {
  const polygonBoxOffset = $(event.target).offset();
  const polygonBox = event.target.getBoundingClientRect();
  // const polygonBox = event.target.getBBox();
  const mousePosition = {
    x: (polygonBoxOffset.left + polygonBox.width),
    y: (polygonBoxOffset.top),
  };
  const wrapperSize = { height: wrap.height(), width: wrap.width() };
  const elementSize = { height: el.height(), width: el.width() };
  const isWidthFit = isFit(mousePosition.x, elementSize.width, wrapperSize.width);
  const isHeightFit = isFit(mousePosition.y, elementSize.height, wrapperSize.height);
  const x = (isWidthFit) ? newPosition(elementSize.width, wrapperSize.width, offset) : mousePosition.x;
  const y = (isHeightFit) ? newPosition(elementSize.height, wrapperSize.height, offset) : mousePosition.y;
  return { x, y };
}
export default placeElemInWrapperNearMouse;
