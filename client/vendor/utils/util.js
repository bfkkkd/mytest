function formatDayAndTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}
function formatDay(date,str) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()
  return [year, month, day].map(formatNumber).join(str);
}
function formatTime(date,str) {
  var hour = date.getHours()
  var minute = date.getMinutes()
  // var second = date.getSeconds()
  return [hour, minute].map(formatNumber).join(str);
}
function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}
function setBtnDefault(page){
  const st = setTimeout(function(){
        page.setData({
          btnLoad: !page.data.btnLoad,
          btnDisabled: !page.data.btnDisabled
        });
        clearTimeout(st);
  },1500);
}
function setBtnLoading(page){
    page.setData({
      btnLoad: !page.data.btnLoad,
      btnDisabled: !page.data.btnDisabled
    })
    setBtnDefault(page);
}
module.exports = {
  formatDayAndTime,
  formatDay,
  formatTime,
  setBtnLoading,
}
