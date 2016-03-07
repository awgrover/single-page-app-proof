angular.module("spa.controllers", ['ngSanitize', 'ngRoute']).controller("mainCtrl", function($log, $scope, pouchDB, $route){
  var db = pouchDB("test");

  var doc = {
    _id: "derp",
    content: "<div style='color: red'>derp route</div>"
  };

  //Per example https://github.com/angular-pouchdb/angular-pouchdb
  function error(err) {
   $log.error(err);
   }

   function get(res) {
     if (!res.ok) {
       return error(res);
     }
     console.log(res.id);
     return db.get(res.id);
   }

   function bind(res) {
     console.log(res);
     console.log($route.routes);

     $scope.doc = res;
   }

   db.post(doc)
     .then(get)
     .then(bind)
     .catch(error);

})
