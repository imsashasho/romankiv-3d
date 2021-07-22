function paginationScroll(wrap, showFlatList, currentShowAmount, callback) {
  if (wrap.scrollTop > (wrap.scrollHeight - (wrap.offsetHeight * 1.5)) && currentShowAmount <= showFlatList.length) {
    callback(showFlatList, wrap, checkCountShowElemInPage(wrap, showFlatList, currentShowAmount));
  }
}

function checkCountShowElemInPage(wrap, showFlatList, currentShowAmount) {
  const countEl = showFlatList.length;
  const el = wrap.querySelector(`[data-id="${showFlatList[0]}"]`);
  const elWidth = el.offsetWidth;
  const elHeight = el.offsetHeight;
  const wrapHeight = wrap.offsetHeight;
  const wrapWidth = wrap.offsetWidth;
  const amount = Math.ceil(((wrapWidth / elWidth) + (wrapHeight / elHeight)) * 1.5);

  if ((wrap.scrollHeight - elHeight - wrap.offsetHeight) < wrap.scrollTop && amount < countEl) {
    if (currentShowAmount + amount <= countEl) {
      return amount;
    }
    return (countEl - currentShowAmount);
  }
  return amount;
}

export default paginationScroll;
