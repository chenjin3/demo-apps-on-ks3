angular.module('app.controllers', [])

  .controller('cameraCtrl', function ($scope) {

  })

  .controller('callbackCtrl', function ($scope) {

  })

  .controller('meCtrl', ['$scope', '$q', 'Image', function ($scope, $q, Image) {
    var uid = JSON.parse(sessionStorage.getItem('user')).uid;
    $scope.start = 0;
    $q.when(Image.getOwnImages(uid)).then(function (res) {
      if (res && res.status == 200) {
        $scope.images = res.data;
      }
    }, function (err) {
      alert(err);
    })

  }])

  .controller('showCtrl', ['$scope', 'Image', '$q', function ($scope, Image, $q) {
    $scope.start = 0;
    $scope.moreDataCanBeLoaded = true;
    $scope.images = [];

    $scope.loadMore = function() {
      $q.when(Image.getAllImages($scope.start)).then(function (res) {
        if (res && res.status == 200) {
          $scope.images = $scope.images.concat(res.data);
          var count = res.data.length
          $scope.start += count;
          if(count == 0) {
            $scope.moreDataCanBeLoaded = false;
          }
          $scope.$broadcast('scroll.infiniteScrollComplete');
        }
      }, function (err) {
        alert(err);
      });
    };

    $scope.$on('$stateChangeSuccess', function() {
      $scope.loadMore();
    });
    //$scope.loadMore();

    $scope.share = function(url) {
      //alert(url);
      var params = {
        "text" : "",
        "imageUrl" : url,
        "title" : "分享标题",
        "titleUrl" : "http://www.mob.com",
        "description" : "测试的描述",
        "site" : "ShareSDK",
        "siteUrl" : "http://ks3.ksyun.com",
        "type" : $sharesdk.ContentType.Auto
      };

      $sharesdk.showShareMenu(null, params, 100, 100, function (res) {
        console.log(JSON.stringify(res));
      });

    }
  }])

  .controller('loginCtrl', ['$rootScope', '$scope', '$state', function ($rootScope, $scope, $state) {
    $scope.shareSDKLoginCallback = function(response) {
      alert("state = " + response.state + "\n user = " + JSON.stringify(response.data));
      if (response.state == $sharesdk.ResponseState.Success) {
        sessionStorage.setItem('user', JSON.stringify(response.data));
        $state.go("tabsController.page4");
      } else if (response.state == $sharesdk.ResponseState.Cancel) {
        alert('取消登录');
      } else if (response.state == $sharesdk.ResponseState.Fail) {
        alert('登录失败，请使用社交账号登录');
      }
    }

    $scope.sinaAuthBtnClickHandler = function () {
      $sharesdk.authorize($sharesdk.PlatformID.SinaWeibo, function (response) {
        $scope.shareSDKLoginCallback(response);
      });
    }
    $scope.wxAuthBtnClickHandler = function () {
      $sharesdk.authorize($sharesdk.PlatformID.WechatPlatform, function (response) {
        $scope.shareSDKLoginCallback(response);
      });
    }
    $scope.qqAuthBtnClickHandler = function () {
      $sharesdk.authorize($sharesdk.PlatformID.QQPlatform, function (response) {
        $scope.shareSDKLoginCallback(response);
      });
    }


    $scope.login = function () {
      //$sharesdk.cancelAuthorize($sharesdk.PlatformID.SinaWeibo, function(reqID, platform, state, error) {
      //  alert("cancel Weibo login : state = " + state + "\n error = " + error);
      //});
      cordova.exec(function (data) {
        alert(JSON.stringify(data));
        sessionStorage.setItem('user', JSON.stringify(data));
        $state.go("tabsController.page4");

      }, function (err) {
        alert('您尚未登录，请使用社交账号登录');
      }, "ShareSDK", "getLocalUserInfo", []);

    };


  }])


  .controller('tabsCtrl', ['$scope', '$state', '$ionicActionSheet', 'Camera', 'Ks3Token', 'CONSTANT', '$cordovaImagePicker', '$ionicLoading',
    function ($scope, $state, $ionicActionSheet, Camera, Ks3Token, CONSTANT, $cordovaImagePicker, $ionicLoading) {
      $scope.image = '';


      // ActionSheet选择项
      $scope.showImageUploadChoices = function (prop) {
        var hideSheet = $ionicActionSheet.show({
          buttons: [{
            text: '<b>拍照</b> 上传'
          }, {
            text: '从 <b>相册</b> 中选'
          }],
          titleText: '图片上传',
          cancelText: '取 消',
          cancel: function () {
            // add cancel code..
          },
          buttonClicked: function (index) {
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



      $scope.putImageToKs3 = function(imageURI, prop) {
        var fileName = imageURI.substr(imageURI.lastIndexOf('/') + 1);
        if (fileName.endWith('jpg') || fileName.endWith('png') || fileName.endWith('gif') || fileName.endWith('jpeg') || fileName.endWith('bmp')) {
          var user = JSON.parse(sessionStorage.getItem('user'));
          if (user.uid) {
            var objKey = Ks3.encodeKey(CONSTANT.dir + user.uid + '/' + fileName);
            var contentType = 'image/jpg';
            var headers = {
              'x-kss-acl': 'public-read',
              'x-kss-callbackurl': 'http://vaba2aiii6.proxy.qqbrowser.cc',
              'x-kss-callbackbody': 'objectKey=${key}&createTime=${createTime}&uid=' + user.uid + '&nickname=' + encodeURIComponent(user.nickname) + '&icon=' + user.icon
            };

            Ks3Token.signature(objKey, 'PUT', contentType, headers).then(function (resp) {
              $scope.authorization = resp.data;
              $scope.uploadimage(imageURI, objKey, contentType, headers, $scope.authorization, prop);
            }).finally(function () {

            });

          } else {
            alert('您还没有登录');
            $state.go('login');
          }
        } else {
          alert("请选择图片文件");
        }
      }

      // 读用户相册
      $scope.readalbum = function (prop) {
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

        $cordovaImagePicker.getPictures(options).then(function (results) {
          var imageURI = results[0];
          $scope.putImageToKs3(imageURI, prop);
        }, function (error) {
          alert(error);
        });
      };

      // 拍照
      $scope.taskPicture = function (prop) {
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
        Camera.getPicture(options).then(function (imageURI) {
          $scope.putImageToKs3(imageURI, prop);
        }, function (err) {
          alert("照相机：" + err);
        });

      }

      // 上传到KS3
      /**
       *
       * @param fileURL    文件url
       * @param objKey
       * @param contentType
       * @param authorization  服务器端计算的签名
       * @param prop
       */
      $scope.uploadimage = function (fileURL, objKey, contentType, headers, authorization, prop) {

        var serverUrl = Ks3.config.protocol + '://' + Ks3.config.baseUrl + '/' + CONSTANT.bucket + '/' + objKey;
        var methodType = 'PUT';
        var options = new FileUploadOptions();
        var token = authorization || 'KSS ' + Ks3.config.AK + ':' + Ks3.generateToken(Ks3.config.SK, Ks3.config.bucket, objKey, methodType, contentType, headers, '');

        headers['Authorization'] = token;
        headers['Content-Type'] = contentType;
        options.headers = headers;
        options.httpMethod = methodType;

        $ionicLoading.show({
          template: '上传中...'
        });


        var ft = new FileTransfer();
        ft.onprogress = function (progressEvent) {
          if (progressEvent.lengthComputable) {
            //loadingStatus.setPercentage(progressEvent.loaded / progressEvent.total);
            console.log("完成： " + (progressEvent.loaded / progressEvent.total * 100) + "%");
          } else {
            //loadingStatus.increment();
          }
        };


        ft.upload(fileURL, encodeURI(serverUrl), function (r) {
          console.log("Code = " + r.responseCode);
          console.log("Response = " + r.response);
          console.log("Sent = " + r.bytesSent);

          // 设置图片新地址
          //var resp = JSON.parse(r.response);
          //var link = resp.url;
          //console.log(link);

          $ionicLoading.hide();

          //跳转个人中心页面展示上传的图片
          $state.go('tabsController.page3',{},{reload: true});

        }, function (error) {
          alert("An error has occurred: Code = " + error.responseCode);
          console.log("upload error source " + error.source);
          console.log("upload error target " + error.target);
          console.log(JSON.stringify(error));
          $ionicLoading.hide();
        }, options);


      }

    }])


  .controller('payCtrl', function ($rootScope,$scope,$state, CONSTANT) {
    //初始化ping++
    (function(){
      var one_url='./lib/index.js';
      var sea_url='./lib/sea.js';
      var pingpp_one=function(){};

      window.pingpp_one=new pingpp_one();

      var e=document.createEvent('Event');
      e.initEvent('pingpp_one_ready',true,true);

      var use=function(){
        seajs.use(one_url,function(index){
          var t=index('./init');
          var s=index('./success');

          pingpp_one.prototype.init=function(opt,callback){
            t.init(opt,callback);
          };

          pingpp_one.prototype.success=function(callback,continueCallback){
            s.init(callback,continueCallback);
          };

          pingpp_one.prototype.resume=function(){
            t.resume();
          };

          document.dispatchEvent(e);
        });
      };
      if(!window.seajs){
        var script=document.createElement('script');
        script.type='text/javascript';
        script.src=sea_url;
        document.body.appendChild(script);
        script.onload=function(){
          use();
        };
      }
      else{
        use();
      }
    })();

    $scope.charge = {};
    var user = JSON.parse(sessionStorage.getItem('user'));
    if(user.platform == 997) { //wechat
        $scope.charge.wxOpenId = user.rawData.openid;
    }else{
      $scope.charge.wxOpenId = "";
    }
      $scope.pay = function() {
        //var amount = document.getElementById('amount').value;
        pingpp_one.init({
          app_id: 'app_iLWzr9iHybvTWjXL',                     //该应用在 ping++ 的应用 ID
          order_no: 'no1234567897',                     //订单在商户系统中的订单号
          amount: $scope.charge.amount,                                   //订单价格，单位：人民币 分
          // 壹收款页面上需要展示的渠道，数组，数组顺序即页面展示出的渠道的顺序
          // upmp_wap 渠道在微信内部无法使用，若用户未安装银联手机支付控件，则无法调起支付
          channel: ['alipay_wap', 'wx_pub', 'upacp_wap', 'yeepay_wap', 'jdpay_wap', 'bfb_wap'],
          charge_url: CONSTANT.serverHost + 'pay/createCharge',  //商户服务端创建订单的 url
          charge_param: {a: 1, b: 2},                      //(可选，用户自定义参数，若存在自定义参数则壹收款会通过 POST 方法透传给 charge_url)
          open_id: $scope.charge.wxOpenId,                      //(可选，使用微信公众号支付时必须传入)
          debug: true                                   //(可选，debug 模式下会将 charge_url 的返回结果透传回来)
        }, function (res) {
          //debug 模式下获取 charge_url 的返回结果
          if (res.debug && res.chargeUrlOutput) {
            console.log(res.chargeUrlOutput);
          }
          if (!res.status) {
            //处理错误
            alert(res.msg);
          }
          else {
            //debug 模式下调用 charge_url 后会暂停，可以调用 pingpp_one.resume 方法继续执行
            if (res.debug && !res.wxSuccess) {
              if (confirm('当前为 debug 模式，是否继续支付？')) {
                pingpp_one.resume();
              }
            }
            //若微信公众号渠道需要使用壹收款的支付成功页面，则在这里进行成功回调，
            //调用 pingpp_one.success 方法，你也可以自己定义回调函数
            //其他渠道的处理方法请见第 2 节
            else pingpp_one.success(function (res) {
              if (!res.status) {
                alert(res.msg);
              }
            }, function () {
              //这里处理支付成功页面点击“继续购物”按钮触发的方法，
              //例如：若你需要点击“继续购物”按钮跳转到你的购买页，
              //则在该方法内写入 window.location.href = "你的购买页面 url"
              alert("callback");
              $rootScope.open_outer_url(encodeURI('http://ks3.ksyun.com/'));
              //window.location.href = 'http://ks3.ksyun.com/';
              //$state.go('pay.callback');
            });
          }
        });
      };
  })

