angular.module('app.services', [])

.factory('Image', ['$http','$q','CONSTANT',function($http, $q, CONSTANT){
    var service = {
      getAllImages: function(start) {
        var deferral = $q.defer();
        return $http({
          method: 'get',
          url: CONSTANT.serverHost + CONSTANT.dbPath,
          params:{
            start: start,
            limit: 5,
            sort:{
              "createTime": -1
            }
          },
          cache: false
        }).then(function(res) {
          deferral.resolve(res);
          return deferral.promise;
        })
      },
      getOwnImages: function(uid) {
        var deferral = $q.defer();
        return $http({
          method: 'get',
          url: CONSTANT.serverHost + CONSTANT.dbPath + uid,
          params: {
            start: 0,
            sort:{
              "createTime": -1
            }
          },
          cache: false
        }).then(function(res) {
          deferral.resolve(res);
          return deferral.promise;
        })
      }
    };
    return service;
}])

/**
 * 拍照功能
 */
  .factory('Camera', function($q) {
    return {
      getPicture: function(options) {
        var q = $q.defer();
        navigator.camera.getPicture(function(result) {
          // Do any magic you need
          q.resolve(result);
        }, function(err) {
          q.reject(err);
        }, options);

        return q.promise;
      }
    }
  })

/**
 * 获取Ks3的签名信息
 * 前端传递描述post表单域的policy文档（经过base64编码）
 * 返回post表单上传签名
 */
  .factory('Ks3Token', function($http , CONSTANT) {
    return {
      signature: function(objKey,httpMethod,contentType, headers) {
        return $http ({
            method: "POST",
            url: CONSTANT.serverHost + "index/token",
            data: {
              key: objKey,
              method: httpMethod,
              contentType: contentType,
              headers: headers
            },
            cache: true
          });
      }
    }
  })



.service('BlankService', [function(){

}]);

