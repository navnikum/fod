/**
* @license
* Copyright (c) 2020, 2021, Oracle and/or its affiliates.
* Licensed under The Universal Permissive License (UPL), Version 1.0
* as shown at https://oss.oracle.com/licenses/upl/
* @ignore
*/

define([], function() {
  'use strict';

  var PageModule = function PageModule() {};

  PageModule.prototype.getJourneyBadgeStatus = function(journeyStatus) {
    let badgeStatus;
    switch (journeyStatus) {
    case 'Pending':
      badgeStatus = 'warning';
      break;
    case 'Overdue':
      badgeStatus = 'danger';
      break;
    case 'Completed':
      badgeStatus = 'success';
      break;
    default:
      badgeStatus = 'neutral';
      break;
    }

    return badgeStatus;
  };

  PageModule.prototype.sort = function (configuration, options, context) {
    const c = configuration;

    if (options && Array.isArray(options) && options.length > 0) {
      const firstItem = options[0];
      if (firstItem.attribute) {
        const dir = firstItem.direction === 'descending' ? 'desc' : 'asc';
        let newUrl = c.url;
        newUrl = `${newUrl}&orderBy=${firstItem.attribute}:${dir}`;
        c.url = newUrl;
      }
    }

    return c;
  };

  return PageModule;
});
