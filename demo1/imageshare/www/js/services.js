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
      getOwnImages: function(uid, start) {
        var deferral = $q.defer();
        return $http({
          method: 'get',
          url: CONSTANT.serverHost + CONSTANT.dbPath + uid,
          params: {
            start: start,
            limit:5,
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
 * @param objectKey
 * @param httpMethod  请求方法，如PUT，GET
 * @param contentType 实体mime类型，请求头不带Content-Type头时可以指定为""(空字符串)
 * @param headers x-kss-开头的请求头信息
 * 返回签名
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

