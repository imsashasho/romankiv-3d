const isDevice = (type = 'mobile') => {
  if (type === 'ios') {
    return /iPhone|iPad|iPod/.test(navigator.userAgent);
  }
  return ((navigator.maxTouchPoints && navigator.maxTouchPoints > 2) || /Android|webOS|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini|iPhone|iPad|iPod/.test(navigator.userAgent));
};

const isBrowser = () => {
  const dataOS = [
    {
      string: navigator.platform,
      subString: 'Win',
      identity: 'Windows',
    },
    {
      string: navigator.platform,
      subString: 'Mac',
      identity: 'Mac',
    },
    {
      string: navigator.userAgent,
      subString: 'iPhone',
      identity: 'iPhone/iPod',
    },
    {
      string: navigator.platform,
      subString: 'Linux',
      identity: 'Linux',
    },
  ];
  const searchString = data => {
    for (let i = 0; i < data.length; i++) {
      const dataString = data[i].string;
      const dataProp = data[i].prop;
      if (dataString) {
        if (dataString.indexOf(data[i].subString) != -1) {
          return data[i].identity;
        }
      } else if (dataProp) {
        return data[i].identity;
      }
    }
    return undefined;
  };
  const OS = searchString(dataOS) || 'an unknown OS';
  const ua = navigator.userAgent;
  let tem;
  let	M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
  if (/trident/i.test(M[1])) {
    tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
    return { name: 'IE', version: (tem[1] || ''), platform: OS };
  }
  if (M[1] === 'Chrome') {
    tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
    if (tem != null) return { name: tem[1].replace('OPR', 'Opera'), version: tem[2], platform: OS };
  }
  M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
  tem = ua.match(/version\/(\d+)/i);
  if (tem != null) { M.splice(1, 1, tem[1]); }
  return { name: M[0], version: M[1], platform: OS };
};

export { isBrowser, isDevice };
