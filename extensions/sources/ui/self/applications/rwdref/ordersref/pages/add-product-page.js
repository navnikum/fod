define([], function() {
  'use strict';

  var PageModule = function PageModule() {};

  PageModule.prototype.checkWithUser = function() {
    var self = this;
    var checkPromise = new Promise(function(resolve) {
      // save away the reference to the promise resolvling function
      self.userInputComplete = resolve;

      // Show the dialog
      document.getElementById('dirtyDataWarningDialog').open();
    });

    return checkPromise;
  };

  PageModule.prototype.userResponse = function(response) {
    var self = this;
    if (self.userInputComplete) {
      self.userInputComplete(response);
      delete self.userInputComplete;
    }
  };

  PageModule.prototype.defaultEstimatedArrivalDate = function(avgLeadTimeDays) {
    let arrival = new Date();
    if (!isNaN(parseInt(avgLeadTimeDays))) {
      arrival.setDate(arrival.getDate() + parseInt(avgLeadTimeDays));
    }
    return arrival.toISOString();
  };

  PageModule.prototype.calculateMinDeactivationDate = function(activationDate) {
    let deactivationDate = new Date(activationDate ? activationDate : new Date());
    if (activationDate) {
      deactivationDate.setDate(deactivationDate.getDate() + 1);
    }
    return deactivationDate.toISOString().split('T')[0];
  };

  return PageModule;
});
