import $ from 'jquery';
import _ from 'lodash';

function asyncRequest(config) {
  let obj = {};

  if (!_.has(config, 'data.method') || config.data.method === 'GET') {
    obj = { type: 'GET' };
  } else {
    if (_.has(config, 'data.method')) {
      obj.type = config.data.method;
    }
    if (_.has(config, 'data.data')) {
      obj.data = config.data.data;
    }
  }
  $.ajax(config.url, obj)
    .then(response => {
      try {
        return JSON.parse(response);
      } catch (e) {
        return response;
      }
    })
    .then(response => config.callbacks(response))
    .catch(config.errors);
}

export default asyncRequest;
