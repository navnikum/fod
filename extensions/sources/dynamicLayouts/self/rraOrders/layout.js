define([], function() {
  'use strict';

  var LayoutModule = function LayoutModule() {};

  LayoutModule.prototype.getFormattedAddressStyle = config => ({
    items: config.body.items.map(item => {
      let addressStyleFormatItems;
      if (item.AddressStyleFormatLayout.items && Array.isArray(item.AddressStyleFormatLayout.items)) {
        addressStyleFormatItems = item.AddressStyleFormatLayout.items;
      } else {
        addressStyleFormatItems = item.AddressStyleFormatLayout;
      }

      // eslint-disable-next-line prefer-object-spread
      return Object.assign({
        addressStyleFormat: addressStyleFormatItems.map(subItem => ({
          attributeLabel: subItem.AttributeLabel,
          attributeName: subItem.AttributeName,
          lineNumber: subItem.LineNumber,
          linePosition: subItem.Position,
          delimiterBefore: subItem.DelimeterBefore,
          delimiterAfter: subItem.DelimiterAfter,
          uppercase: subItem.UppercaseFlag,
          required: subItem.MandatoryFlag,
        })),
      }, item);
    }),
  });

  LayoutModule.prototype.getFormattedAddress = function(address1, address2, city, state, postalCode, country) {
    return {
      Address1: address1,
      Address2: address2,
      City: city,
      State: state,
      PostalCode: postalCode,
      Country: country,
    };
  };

  return LayoutModule;
});
