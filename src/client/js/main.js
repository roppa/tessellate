var tess = angular.module("tessell", [
  "ngRoute",
  'tessell.mosaic'
]);

tess.config(["$routeProvider", function ($routeProvider){
    $routeProvider
/*      .when('/events', {
        templateUrl: '../profile.html',
        controller: 'profileController'
      })
      .when('/events/create', {
        templateUrl: '../createEvent.html',
        controller: 'createEventController'
      })
      .when('/events/:id', {
        templateUrl: '',
        controller: ''
      })*/
      .when('/', {
        templateUrl: '../login.html', 
        controller: 'mainController',
      });
      // .otherwise({
      //   //default path is back to the profile page
      //   //the route auth validation will either load the profile view or the login view at '/'
      //   redirectTo: '/login'
      // });
  }]);

tess.run(function ($rootScope, $location){
  $rootScope.$on("$routeChangeStart", function (event, next, current){
    console.log("next---> ", next.$$route.authenticate);
    //TO DO: check if user is logged in. If not send them to the login page
  });
});

// globally available functions that make http requests to the server
tess.factory('httpRequestFactory', [ '$http', function ($http){
  var httpRequestFactory = {};
  httpRequestFactory.getUserProfile = function(){
    return $http({
      method: 'GET',
      url: '/loggedin'//TBD assuming the roure is something like user/:userId?
    }).then(function(response){
      httpRequestFactory.fullUserProfile = response;
      return response;
      //user profile information should be attached to this
      //expecting events they either have created or are a part of
      //expecting user display name
      //expectine user profile picture
      //set this information to the factory scope so we can grab it from any view we made need it for
    });
  };
  return httpRequestFactory;
}]);

tess.controller('mainController', [ '$scope', 'httpRequestFactory', '$location', function ($scope, httpRequestFactory, $location){
  $scope.getUserProfile = function(){
    httpRequestFactory.getUserProfile()
      .then(function(response){
        console.log("response from main controller --> ", response);
      });
  };
}]);

tess.controller('eventsProfileController', [ '$scope', 'eventFactory', function ($scope, eventFactory){
  $scope.joinEvent = function(){
    //TODO: code to join an exisiting event
  };
  $scope.createEvent = function(){
    //capture entered event code (if any) and send the user to the create event view
  };
  $scope.goToExisitingEvent = function(){
    //on clicking an event, take the user to that event mosaic page
  };
  $scope.userProfile = httpRequestFactory.fullUserProfile;
}]);

tess.controller('tessellCtrl', ['$scope', "eventFactory", "$location", function ($scope, eventFactory, $location){
  // $scope.eventTag = "";
  // console.log('loaded Ctrl: ', $scope.mainMosaicImage);
  $scope.mainMosaicImage = eventFactory.mainMosaicImage;
  $scope.checkForExistingEvent = function(){
    eventFactory.checkForExistingEvent($scope.eventTag);
  };
  $scope.dropzoneConfig = {
    'options': {
      'url': '/event/create', 
      'method': 'POST',
      'maxFiles': 1,
      'clickable': true,
      'autoProcessQueue': false,
      init: function(){
        dz = this;
        $('#submit-all').click(function(){
          dz.processQueue();
        });
      }
    },
    'eventHandlers': {
      'sending': function (file, xhr, formData) {
        // console.log(formData, file, xhr);
        formData.append("eventCode", $scope.eventTag);
      },
      'success': function (file, response) {
        $scope.getMosiacMap = eventFactory.getMosiacMap(response);
        $location.path('/mosaic');
        $scope.$apply();
      }
    }
  };
}]);

tess.factory('eventFactory', ["$http", function ($http){
  var eventFactory = {};
  eventFactory.mosaicRetrieved = false;
  eventFactory.getMosiacMap = function(response){
    // console.log(response);
    if(eventFactory.mosaicRetrieved === false){
      eventFactory.mainMosaicImage = response;
      eventFactory.mosaicRetrieved = true;
    }
    console.log('in factory');
    return response;
  };
  eventFactory.checkForExistingEvent = function(eventTag){
    $http.post('/event/join', {eventCode: eventTag})
      .then(function(response){
        // console.log(response);
      });
    // console.log('handling the event checking for', eventTag);
  };
  return eventFactory;
}]);


/**
* An AngularJS directive for Dropzone.js, http://www.dropzonejs.com/
* 
* Usage:
* 
* <div ng-app="app" ng-controller="SomeCtrl">
*   <button dropzone="dropzoneConfig">
*     Drag and drop files here or click to upload
*   </button>
* </div>
*/

tess.directive('dropzone', function () {
 return function (scope, element, attrs) {
   var config, dropzone;

   config = scope[attrs.dropzone];

   // create a Dropzone for the element with the given options
   dropzone = new Dropzone(element[0], config.options);

   // bind the given event handlers
   angular.forEach(config.eventHandlers, function (handler, event) {
     dropzone.on(event, handler);
   });
 };
});