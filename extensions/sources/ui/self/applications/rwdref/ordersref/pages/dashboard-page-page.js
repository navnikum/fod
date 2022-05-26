define([], function() {
  'use strict';
 
  var PageModule = function PageModule() {};
  /**
   *
   * @param {String} arg1
   * @return {String}
   */
  PageModule.prototype.formatPayload = function(eventName, payload) {
    let res = 'event name: ' + eventName + ' \npayload: ';
    Object.keys(payload.context).forEach(function(key) {
      res = res.concat(key);
      res = res.concat(' : ');
      const temp = payload.context[key].oValueMap;
      const temp1 = Object.keys(temp)[0];
      res = res.concat(temp1);
      res = res.concat('\n');
    });
     return res;
  };
 
  PageModule.prototype.retrieveSearchParam = function(eventName, payload) {
     let res = '';
     Object.keys(payload.context).filter(key => key==='CATEGORY_NAME' ).forEach(function(key) {
      // res = res.concat(key);
      // res = res.concat(' : ');
      const temp = payload.context[key].oValueMap;
      const temp1 = Object.keys(temp)[0];
      res = res.concat(temp1);
    });
     res = '[{"filter":"ProductsLOV", "label":"'+res+'" ,"value":"'+res+'","filterLabel":"Products"},{"dependencies":[],"filter":"OrderDateRangeLOV","filterLabel":"Order Date","label":"Last Quarter","value":"LAST_QUARTER"}]';
     return res;
  };
 
  return PageModule;
});