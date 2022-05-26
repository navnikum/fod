define(['vb/BusinessObjectsTransforms'], function(BOTransforms) {
  'use strict';

  var FragmentModule = function FragmentModule() {};

  FragmentModule.prototype.getCustomerName = function (item) {
    return item.data.FirstName + ' ' + item.data.LastName;
  }

  // Smart platform utilities

  /** Function for handling LOV oj-value-action events and seed suggestions. */
  FragmentModule.prototype.seedSuggestions = function (event) {
    window.oars_client.seedSuggestions(event);
  };
  
  /** Shows sparkle image.
   * @param {object} item - Element of oj-list-view.
   */
   FragmentModule.prototype.getSuggestionStyle = function(item) {
    return window.oars_client.sparkle.getSuggestionStyle(item);
  };

  /** CSS Class for divider between suggestions and base data.
   * @param {object} item - Element of oj-list-view.
  */
  FragmentModule.prototype.getSuggestionLineClass = function(item) {
    return window.oars_client.sparkle.getSuggestionLineClass(item);
  };

  FragmentModule.prototype.smartSearchProcessTextFilter = function(textFilterAttrs) {
    const textFilterAttributes = textFilterAttrs;

    return function (configuration, options, transformsContext) {
      const c = configuration;
      let o = options;
      let textValue;
      let isCompound;

      textValue = o && o.text;
      // allow '' values to perform a query
      if (textValue !== undefined && textValue !== null) {
        // choose the text fields that will be used in the text filtering and build a regular
        // attribute criterion
        const textFieldsToQuery = textFilterAttributes || transformsContext.textFilterAttributes || [];
        const tfcrs = { op: '$or', criteria: [] };

        textFieldsToQuery.forEach((tf) => {
          const tqfc = { op: '$co', attribute: tf, value: textValue };
          tfcrs.criteria.push(tqfc);
        });

        o = tfcrs;
      }

      return BOTransforms.request.filter(configuration, o);
    };
  };

  return FragmentModule;
});
