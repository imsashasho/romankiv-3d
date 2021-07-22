export function setNewPathAttr(inx, attr, elem){
	const src = elem.getAttribute(attr);
	const reg = /(.+)\/(.+)\.(.+)$/gm;
	const newSrc = src.replace(reg, `$1/${inx}.$3`);
	elem.setAttribute(attr, newSrc);
}

export function setNewPathAttrFromDataAttr(inx, attr, elem){
	const src = elem.dataset[attr];

	const reg = /(.+)\/(.+)\.(.+)$/gm;
	const newSrc = src.replace(reg, `$1/${inx}.$3`);
	elem.setAttribute(attr, newSrc);
}



export const _PATHS = {
	getVideoURL: (inx) => `./assets/images/home/video/${inx}.mp4`,
	getReverseVideoURL: (inx) => `./assets/images/home/video/${inx}-rev.mp4`,
	getPosterURL: (inx) => `./assets/images/home/${inx}.jpg` ,
}

export const eases = {
	ex: "expo.inOut",
	exI: "expo.in",
	exO: "expo.out",
	p4: "power4.inOut",
	p4I: "power4.in",
	p4O: "power4.out",
	p2: "power2.inOut",
	p2I: "power2.in",
	p2O: "power2.out",
	circ: "circ.inOut",
	circO: "circ.out",
	circI: "circ.in",
}



export const langDetect = function () {
  if (window.location.pathname.match(/ru/)) {
    return 'ru';
  } else if (window.location.pathname.match(/en/)) {
    return 'en';
  } else {
    return 'uk';
  }
};


export const convertURL2Obj = () => {
	if(window.location.search === '') return {}
	let array = window.location.search.replace('?', '').split('&').map(el => el.split('='));
	let obj = {};
	array.forEach(el => obj[el[0]] = el[1]);
	return obj;
}

export const convertObj2URLHomePage = (obj) => {
	if(isEmpty(obj)) return '';
	convertObj2URL(obj)
}

export const convertObj2URL = (obj) => {
	if(isEmpty(obj)) return '';
	
	let accStr = '?'
	for (var prop in obj) {
		accStr += `${prop}=${obj[prop]}&`
	}
	return accStr.slice(0, -1);
}

function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}
