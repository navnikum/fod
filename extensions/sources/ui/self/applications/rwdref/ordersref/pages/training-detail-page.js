define([], function() {
  'use strict';

  var PageModule = function PageModule() {};

  /**
   * Transform tasks reponse by parsing taskData attributes
   * @param {Object} Rest response
   * @return {Object} Transformed response
   */
  PageModule.prototype.createTaskResponse = function (response) {
    if (response && response.body && Array.isArray(response.body.items)) {
      response.body.items = response.body.items.map(function (item) {
        var newItem = Object.assign({}, item);
        newItem.UserTrainingTaskId = newItem.RraUserTrainingTasks.items.find(elt => elt.Username === newItem.Username).UserTrainingTaskId;
        try {
          newItem.TaskBody = JSON.parse(item.TaskBody);
        } catch (e) {
          console.warn('Invalid task data: ' + e);
        }
        return newItem;
      });
    }

    return response;
  };

  /**
   *
   * @param {String} taskData
   * @return {String}
   */
  PageModule.prototype.getFirstPendindTaskId = function (taskData) {
    let task = taskData.find(elt => elt.UserTrainingTaskStatus === "Pending");
    return task && task.TrainingTaskId;
  };

  /**
   *
   * @return {String}
   */
  PageModule.prototype.openNextIncompleteTask = function () {
    let nextExpandable = document.querySelector('oj-sp-expandable-list-item[data-incomplete=true]');
    if (nextExpandable) {
      nextExpandable.setExpandStatus(true);
    }
  };

  return PageModule;
});
