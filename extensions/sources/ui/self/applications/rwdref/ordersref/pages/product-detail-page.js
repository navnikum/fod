/** 
* @license 
* Copyright (c) 2020, 2021, Oracle and/or its affiliates. 
* Licensed under The Universal Permissive License (UPL), Version 1.0 
* as shown at https://oss.oracle.com/licenses/upl/ 
* @ignore 
*/

define([], function () {
  'use strict';

  var PageModule = function PageModule(context) {
    this._eventHelper = context.getEventHelper();
  };

  PageModule.prototype.subscribeForAfterFetch = function (sdp) {
    sdp.addEventListener("afterfetch", (event) => {
      this._eventHelper.fireCustomEvent('onUpdateFetchSize', { fetchSize: event.detail.fetchSize });
    });
  };

  return PageModule;
});
