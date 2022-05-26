/**
* @license
* Copyright (c) 2020, 2021, Oracle and/or its affiliates.
* Licensed under The Universal Permissive License (UPL), Version 1.0
* as shown at https://oss.oracle.com/licenses/upl/
* @ignore
*/

define([
  'ojs/ojconverter-number',
  'vb/BusinessObjectsTransforms',
], function(
  NumberConverter,
  BOTransforms
) {
  'use strict';

  var FlowModule = function FlowModule() {
  };

  FlowModule.prototype.navigationItems = function(permissions, roles, translations) {
    let items = [
        {
          id: 'welcome',
          label: translations.format('app','WELCOME_PAGE_TITLE'),
          icon: 'oj-ux-ico-home',
        },
        {
          id: 'manage-orders',
          label: translations.format('app','ORDERS_PAGE_TITLE'),
          icon: 'oj-ux-ico-contact-card',
        },
        {
          id: 'inventory',
          label: translations.format('app','NAVIGATION_INVENTORY'),
          icon: 'oj-ux-ico-notes',
        },
        {
          id: 'my-training',
          label: translations.format('app','NAVIGATION_TRAINING'),
          icon: 'oj-ux-ico-instructor-training',
        },
    ];
    if (roles.indexOf("CUSTOM_FND_RRA_DASHBOARD_ROLE") > -1 && permissions.indexOf("/vbcs/fnd/rra/managerView") > -1) {
      items.push({
        id: 'dashboard',
        label: 'Analytics',
        icon: 'oj-ux-ico-analytics',
      });
    }

    return items;
  };

  FlowModule.prototype.toResourceUrl = function(applicationUrl) {
    return (partialUrl) => {
      if (partialUrl && applicationUrl) {
        return new URL('resources/' + partialUrl, applicationUrl).href;
      }
    };
  };

  // SmartPlatform Start

  // Uncomment for testing in DT.
  // window.oars_client.configure({
  //   skipClsCheck: true,
  //   showAllLogMessages: true,
  //   skipProfileCheck: true,
  //   logLevel: 'trace',
  //   aiUrl: 'https://slc15znm.us.oracle.com:8089/testSuggestion3'
  // });

  // Smart platform utilities

  /** Function for handling LOV oj-value-action events and seed suggestions. */
  FlowModule.prototype.seedSuggestions = function(event) {
    window.oars_client.seedSuggestions(event);
  };

  /** Shows sparkle image.
   * @param {object} item - Element of oj-list-view.
   */
  FlowModule.prototype.getSuggestionStyle = function(item) {
    return window.oars_client.sparkle.getSuggestionStyle(item);
  };

  /** CSS Class for divider between suggestions and base data.
   * @param {object} item - Element of oj-list-view.
  */
  FlowModule.prototype.getSuggestionLineClass = function(item) {
    return window.oars_client.sparkle.getSuggestionLineClass(item);
  };

  /**
   * Decorates existing DataProvider with suggestions and select UX behavior.
   * @param {object} args.baseDataProvider - Source of data.
   * @param {string} args.subject - Suggestions subject.
   * @param {'ai' | 'smart-platform'} [args.source] - Source of data.
   * @param {'mru' | 'mfu'} [args.policyHint] - Policy of suggestions, it could specify algorithm of suggestions.
   * @param {number} [args.maxSuggestions] - Suggestions result cannot exceed this limit.
   * @param {string} [args.behavior] - Describes behavior of returning DataProvider. Default value is inline.
   * @returns {DataProvider<K, D>} - DataProvider with suggestions.
   */
  FlowModule.prototype.createDataProviderWithSuggestions = function(args) {
    return window.oars_client.createDataProvider(args);
  };

  FlowModule.prototype.processTextFilter = function(textFilterAttrs) {
    const textFilterAttributes = textFilterAttrs;

    return function(configuration, options, transformsContext) {
      const c = configuration;
      let o = options;
      let textValue;

      textValue = o && o.text;
      // allow '' values to perform a query
      if (textValue !== undefined && textValue !== null) {
        // choose the text fields that will be used in the text filtering and build a regular
        // attribute criterion
        const textFieldsToQuery = textFilterAttributes || transformsContext.textFilterAttributes || [];
        const tfcrs = { op: '$or', criteria: [] };

        textFieldsToQuery.forEach(tf => {
          const tqfc = { op: '$co', attribute: tf, value: textValue };
          tfcrs.criteria.push(tqfc);
        });

        o = tfcrs;
      }

      return BOTransforms.request.filter(configuration, o);
    };
  };

  FlowModule.prototype.orderDrawerGetProductNavigationInfo = function(currentIndex, indexMove) {
    const result = {
      currentIndex,
      previous: {
        display: 'disabled',
        productId: undefined,
      },
      next: {
        display: 'disabled',
        productId: undefined,
      },
    };

    const productLinks = document.querySelectorAll('.orderline-productId');
    if (currentIndex < productLinks.length) {
      currentIndex += indexMove;
      result.currentIndex = currentIndex;
      if (currentIndex > 0) {
        result.previous.display = 'on';
        result.previous.productId = productLinks[currentIndex - 1].getAttribute('data-product-id');
      }
      if (currentIndex < productLinks.length - 1) {
        result.next.display = 'on';
        result.next.productId = productLinks[currentIndex + 1].getAttribute('data-product-id');
      }
    }

    return result;
  };

  return FlowModule;
});
