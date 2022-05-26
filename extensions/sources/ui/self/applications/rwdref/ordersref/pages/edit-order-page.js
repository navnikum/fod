/**
* @license
* Copyright (c) 2020, 2021, Oracle and/or its affiliates.
* Licensed under The Universal Permissive License (UPL), Version 1.0
* as shown at https://oss.oracle.com/licenses/upl/
* @ignore
*/

define([
  "ojs/ojcontext",
  "ojs/ojconverter-number",
  "ojs/ojbufferingdataprovider",
  "ojs/ojlistdataproviderview"
  ], function(
  Context,
  NumberConverter,
  BufferingDataProvider,
  ListDataProviderView
) {
  "use strict";

  var bufferingDP;

  var PageModule = function PageModule() { };

  PageModule.prototype.createBufferingDP = function(baseDP) {
    bufferingDP = new BufferingDataProvider(baseDP);
    // Return a ListDataProviderView for use with the table so that we can set initial sortCriteria

    return new ListDataProviderView(bufferingDP, {
      sortCriteria: [{ attribute: "OrderLineId", direction: "ascending" }],
    });
  };

  PageModule.prototype.addItem = function(key, data) {
    bufferingDP.addItem({ metadata: { key: key }, data: data });
  };

  PageModule.prototype.removeItem = function(key, data) {
    bufferingDP.removeItem({ metadata: { key: key }, data: data });
  };

  PageModule.prototype.updateItem = function(key, data) {
    bufferingDP.updateItem({ metadata: { key: key }, data: data });
  };

  PageModule.prototype.getSubmittableItems = function() {
    return bufferingDP.getSubmittableItems();
  };

  PageModule.prototype.resetChanges = function() {
    bufferingDP.resetAllUnsubmittedItems();
  };

  PageModule.prototype.setSubmittedStatus = function(status) {
    const items = bufferingDP.getSubmittableItems();
    if (items) {
      items.forEach(function(item) {
        bufferingDP.setItemStatus(item, status);
      });
    }
  };

  PageModule.prototype.calculateTotalAmount = function() {
    return bufferingDP.fetchByOffset({ offset: 0 }).then(function(value) {
      var total = 0;
      var rows = value.results;
      if (rows) {
        for (var i = 0; i < rows.length; i++) {
          total += rows[i].data.Amount;
        }
      }

      return total;
    });
  };

  PageModule.prototype.getLineItemsCount = function() {
    return bufferingDP.getTotalSize().then(function(size) {
      return size;
    });
  };

  PageModule.prototype.getTableIsReady = function(tableId) {
    const tableEle = document.getElementById(tableId);

    return Context.getContext(tableEle).getBusyContext().isReady();
  };

  PageModule.prototype.getQuantityFromRawValue = function(rawValue) {
    const numberConverter = new NumberConverter.IntlNumberConverter({
      roundingMode: 'FLOOR',
      maximumFractionDigits: 0,
      roundDuringParse: true,
    });

    try {
      const parsedQuantity = numberConverter.parse(rawValue);

      return parsedQuantity;
    } catch (error) {
      return 0;
    }
  };

  PageModule.prototype.focusInputNumber = function(index) {
    const quantityField = document.getElementById('order-line-qty-' + index + '|input');
    if (quantityField) {
      quantityField.focus();
      quantityField.select();
    }
  };

  PageModule.prototype.propagateProductIdClickEvent = function(currIndex) {
    const productIdEle = document.querySelector(`.orderline-productId[data-index='${currIndex}']`);
    if (productIdEle) {
      productIdEle.click();
    }
  };

  PageModule.prototype.ojInputAddressFormatStyleMapping = config => ({
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

  PageModule.prototype.getFormattedAddress = function(address) {
    const formattedAddress = {};
    if (address && address.AddressLine1) {
      formattedAddress.Address1 = address.AddressLine1;
      formattedAddress.Address2 = address.AddressLine2;
      formattedAddress.Address3 = address.AddressLine3;
      formattedAddress.Address4 = address.AddressLine4;
      formattedAddress.City = address.City;
      formattedAddress.Country = address.Country;
      formattedAddress.County = address.County;
      formattedAddress.PostalCode = address.PostalCode;
      formattedAddress.Province = address.Province;
      formattedAddress.State = address.State;
    }

    return formattedAddress;
  };

  return PageModule;
});
