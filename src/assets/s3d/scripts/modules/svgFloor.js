function updateSizeTip(divided, polygon = {}, tips = {}, svg = {}) {
  polygon.each((i, el) => {
    const tip = $(`${tips}${i}`);
    const widthSvgPhoto = svg.attr('viewBox').split(' ')[2];
    const bbox = el.getBBox();
    // const delta = 1;
    const width = (widthSvgPhoto / 7) * divided;
    const height = (widthSvgPhoto / 13) * divided;
    const center = {
      x: (bbox.x + (bbox.width / 2)),
      y: (bbox.y + (bbox.height / 2)),
    };
    tip.attr({
      x: center.x - (width / 2),
      y: center.y - (height / 2),
      width,
      height,
    });
  });
}

export default updateSizeTip;
