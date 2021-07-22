function loader(callback, config, nameProject) {
  const arrTimes = [];
  let i = 0; // start
  const timesToTest = 3;
  const tThreshold = 70; // ms
  const numImage = 43;
  const testImage = `${defaultModulePath + config.imageUrl + config.activeSlide || numImage}.jpg`; // small image in your server
  const dummyImage = new Image();
  let isConnectedFast = false;

  testLatency(avg => {
    isConnectedFast = {
      fastSpeed: (avg <= tThreshold),
      middleTime: avg,
      checkImage: numImage,
    };
    /** output */
    callback(isConnectedFast);
    return avg;
  });

  /** test and average time took to download image from server, called recursively timesToTest times */
  function testLatency(cb) {
    const tStart = new Date().getTime();
    if (i < timesToTest - 1) {
      dummyImage.src = `${testImage}?t=${tStart}`;
      dummyImage.onload = function () {
        const tEnd = new Date().getTime();
        const tTimeTook = tEnd - tStart;
        arrTimes[i] = tTimeTook;
        testLatency(cb);
        i++;
      };

      dummyImage.onerror = function () {
        const tEnd = new Date().getTime();
        const tTimeTook = tEnd - tStart;
        arrTimes[i] = tTimeTook;
        testLatency(cb);
        i++;
      };
    } else {
      /** calculate average of array items then callback */
      const sum = arrTimes.reduce((a, b) => a + b);
      const avg = sum / arrTimes.length;
      cb(avg);
    }
  }
}

export default loader;
