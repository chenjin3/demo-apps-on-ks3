angular.module('app.services', [])

.factory('BlankFactory', [function(){

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
      signature: function(stringToSign) {
        return $http ({
            method: "POST",
            url: CONSTANT + "token",
            data: stringToSign,
            cache: true
          });
      }
    }
  })



.service('BlankService', [function(){

}]);

