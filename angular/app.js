angular.module("spa", ['pouchdb', 'spa.controllers', 'ngRoute']);

//inject pouchdb service so its available to all controllers
angular.module("spa").service('service', function(pouchDB) {
  var db = pouchDB('name');
});

angular.module("spa").config(function($routeProvider){
  //TODO:  Look into HTTP Interceptors so when $http is used for AJAX requests, then we can point it to POUCH for content/data
  //https://docs.angularjs.org/api/ng/service/$http

  //TODO: generate this dynamically -- see if pouchDB is injected
  $routeProvider
      // route for the home page
      .when('/', {
          templateUrl : "main.html",
          controller  : 'mainCtrl'
      })
      .when('/pouch/:url', { //Basically just inject the "content" field of the DB
        template: "<div ng-bind-html='content'></div>",
        controller: function($scope, content){
          $scope.content = content
        },
        resolve: {
          content: function($route, pouchDB){
            var url = $route.current.params.url;
            console.log(url);
            var db = pouchDB("test");
            return db.get(url).then(function(res){
              console.log(res.content);
              return res.content;
            }).catch(function(err){
              return "Error: " + err.message;
            });
          }
        }
      })
});

angular.module("spa").run(function(){

});

//http://stackoverflow.com/questions/20909525/load-controller-dynamically-based-on-route-group

// app.config(function($controllerProvider, $compileProvider, $filterProvider, $provide) {
//   app.register = {
//     controller: $controllerProvider.register,
//     directive: $compileProvider.directive,
//     filter: $filterProvider.register,
//     factory: $provide.factory,
//     service: $provide.service
//   };
// });
