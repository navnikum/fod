/** 
* @license 
* Copyright (c) 2020, 2021, Oracle and/or its affiliates. 
* Licensed under The Universal Permissive License (UPL), Version 1.0 
* as shown at https://oss.oracle.com/licenses/upl/ 
* @ignore 
*/

define([], function () {
  'use strict';

  var PageModule = function PageModule() { };

  /**
   *
   * @param {String} arg1
   * @return {String}
   */
  PageModule.prototype.calculateProductIndex = function (productId) {
    const links = Array.from(document.querySelectorAll('.orderline-productId'));
    const index = links.findIndex(elt => elt.getAttribute('data-product-id') === productId);
    return index;
  };

  return PageModule;
});
