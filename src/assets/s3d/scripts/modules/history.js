class History {
  constructor(data) {
    this.history = [];
    this.startHistory = {};
    this.updateFsm = data.updateFsm;
    this.update = this.update.bind(this);
    this.replaceUrl = this.replaceUrl.bind(this);
    this.stepBack = this.stepBack.bind(this);
  }

  init() {
    window.onpopstate = e => {
      this.stepBack(e.state);
    };
  }

  // pageLoad() {
  //   if (window.history.state === null) {
  // window.history.replaceState(
  //   {
  //     isBackPage: true,
  //   },
  //   null,
  //   null,
  // )
  // window.history.pushState(
  //   {
  //     isBackPage: true,
  //   },
  //   null,
  //   null,
  // )
  // }
  // }

  stepBack(data) {
    if (data === null) {
      const config = this.history;
      this.updateFsm(config, _.has(config, 'id') ? +config.id : undefined);
    } else {
      this.updateFsm(data, _.has(data, 'id') ? data.id : undefined);
    }
  }

  update(name) {
    window.history.pushState(
      name, '3dModule', this.createUrl(name),
    );
    this.history = name;
  }

  replaceUrl(name) {
    window.history.replaceState(
      name, '3dModule', this.createUrl(name),
    );
  }

  createUrl(data) {
    const entries = Object.entries(data);
    const href = entries.reduce((acc, [key, value]) => {
      // if (key === 'type') {
      //   return `${acc}&s3d_${key}=${value}`;
      // }
      return `${acc}&${key}=${value}`;
    }, '?');
    // let href = `?s3d_type=${data.type}`;
    //
    // if (data.method === 'search') {
    //   href += `&method=${data.method}`;
    // }
    // if (data.flyby) {
    //   href += `&flyby=${data.flyby}`;
    // }
    // if (data.side) {
    //   href += `&side=${data.side}`;
    // }
    // if (+data.id) {
    //   href += `&id=${data.id}`;
    // }
    return href;
  }

  // createUrl(data) {
  //   let href = `?s3d_type=${data.type}`;
  //
  //   if (data.method === 'search') {
  //     href += `&method=${data.method}`;
  //   }
  //   if (data.flyby) {
  //     href += `&flyby=${data.flyby}`;
  //   }
  //   if (data.side) {
  //     href += `&side=${data.side}`;
  //   }
  //   if (+data.id) {
  //     href += `&id=${data.id}`;
  //   }
  //   return href;
  // }
}

export default History;
