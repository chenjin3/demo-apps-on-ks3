/**
 * Created by Marlon on 16/5/29.
 */
var ks3Filters=angular.module('app.filters',[]);

ks3Filters.filter('sortDate',function(){
  return function(timestamp) {
    var date = new Date(timestamp * 1000); //获取一个时间对象
    var year = date.getFullYear();  // 获取完整的年份(4位,1970)
    var month = date.getMonth();  // 获取月份(0-11,0代表1月)
    var day = date.getDate();  // 获取日(1-31)
    return year + '-' + (month +1) + '-' + day;
  };
});
