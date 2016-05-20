angular.module('app.controllers', [])

.controller('cameraCtrl', function($scope) {

})

.controller('meCtrl', function($scope) {

})

.controller('showCtrl', function($scope) {

})

.controller('loginCtrl', function($scope) {

})



.controller('tabsCtrl',['$scope', '$state', '$ionicActionSheet', 'Camera', 'Ks3Token','CONSTANT','$cordovaImagePicker',
    function($scope, $state, $ionicActionSheet, Camera, Ks3Token, CONSTANT,$cordovaImagePicker) {
    $scope.image = '';


    // 图片选择项
    $scope.showImageUploadChoices = function(prop) {
      var hideSheet = $ionicActionSheet.show({
        buttons: [{
          text: '<b>拍照</b> 上传'
        }, {
          text: '从 <b>相册</b> 中选'
        }],
        titleText: '图片上传',
        cancelText: '取 消',
        cancel: function() {
          // add cancel code..
        },
        buttonClicked: function(index) {
          // 相册文件选择上传
          if (index == 1) {
            $scope.readalbum(prop);
          } else if (index == 0) {
            // 拍照上传
            $scope.taskPicture(prop);
          }
          return true;
        }
      });

    };


    // 读用户相册
    $scope.readalbum = function(prop) {
      if (!window.imagePicker) {
        alert('目前您的环境不支持相册上传。')
        return;
      }

      var options = {
        maximumImagesCount: 1,
        width: 800,
        height: 800,
        quality: 80
      };

      $cordovaImagePicker.getPictures(options).then(function(results) {
        var uri = results[0],
          name = uri;
        if (name.indexOf('/')) {
          var i = name.lastIndexOf('/');
          name = name.substring(i + 1);
        }



        // 获取Ks3的token数据
        var policy = {
          "expiration": new Date(getExpires(3600)*1000).toISOString(), //一小时后
          "conditions": [
            ["eq","$bucket", CONSTANT.bucket],
            ["starts-with", "$key", ""],
            ["starts-with","$acl", "public-read"],
            ["starts-with", "$name", ""],   //表单中传了name字段，也需要加到policy中
            ["starts-with", "$x-kss-meta-custom-param1",""]  //必须只包含小写字符
            ,["starts-with", "$Cache-Control",""]
            ,["starts-with", "$Expires", ""]
            ,["starts-with", "$Content-Type",""]
            ,["starts-with", "$Content-Encoding",""]
          ]
        };
        $scope.stringToSign = Ks3.Base64.encode(JSON.stringify(policy));

        Ks3Token.signature($scope.stringToSign).then(function(resp) {
          $scope.signatureFromPolicy = resp.data;
          $scope.uploadimage(uri, prop);
        }).finally(function() {
        });
      }, function(error) {
        alert(error);
      });
    };

    // 拍照
    $scope.taskPicture = function(prop) {
      if (!navigator.camera) {
        alert('请在真机环境中使用拍照上传。')
        return;
      }

      var options = {
        quality: 75,
        targetWidth: 800,
        targetHeight: 800,
        saveToPhotoAlbum: false
      };
      Camera.getPicture(options).then(function(imageURI) {
        $scope.uploadimage(imageURI);
        var name = imageURI;
        if (name.indexOf('/')) {
          var i = name.lastIndexOf('/');
          name = name.substring(i + 1);
        }

        // 获取UPYUN的token数据
        Upyun.token(name, 1000).then(function(resp) {
          $scope.signatureFromPolicy = resp.data;
          $scope.uploadimage(imageURI, prop);
        }).finally(function() {});

      }, function(err) {
        alert("照相机：" + err);
      });

    }

    // 上传到KS3
    $scope.uploadimage = function(uri, prop) {
      var fileURL = uri;
      var options = new FileUploadOptions();
      options.fileKey = "file";
      options.fileName = fileURL.substr(fileURL.lastIndexOf('/') + 1);
      options.mimeType = "image/jpeg";
      options.chunkedMode = true;

      //支持https 上传
      if (window.location.protocol === 'https:') {
        Ks3.config.protocol = 'https';
      } else {
        Ks3.config.protocol = 'http';
      }
      var ks3UploadUrl =  Ks3.config.protocol + '://' + Ks3.ENDPOINT[Ks3.config.region] + '/';


      var ks3Options = {
        KSSAccessKeyId: Ks3.config.AK,
        policy: $scope.stringToSign,
        signature: $scope.signatureFromPolicy,
        bucket_name: CONSTANT.bucket,
        key: '${filename}',
        acl: "public-read",
        'Cache-Control': 'max-age=600',                //设置缓存多少秒后过期
        'Expires': new Date(getExpires(600) * 1000)   //设置文件访问缓存过期时间600s
      };


      options.params = ks3Options;

      var ft = new FileTransfer();
      $ionicLoading.show({
        template: '上传中...'
      });
      ft.upload(fileURL, ks3UploadUrl  + CONSTANT.bucket, function(data) {
        // 设置图片新地址
        var resp = JSON.parse(data.response);
        var link = resp.url;
        console.log(link)
        $scope.image = link;
        var element = document.getElementsByName("AssistImageName");
        element[0].src = link;
        element[1].src = link;

        //TODO: 跳转个人中心页面展示上传的图片
        $state.go('tabsController.page3', {'url': link});

        $ionicLoading.hide();
      }, function(error) {
        alert(JSON.stringify(error));
        $ionicLoading.hide();
      }, options);
    }

  }])
