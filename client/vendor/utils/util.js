function formatDayAndTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute].map(formatNumber).join(':')
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

function formatAddress(building, floor, unit, config) {
    building = building || 0 
    floor = floor || 0
    unit = unit || 0
    if (config.buildings[0] != "?栋") {
        config.buildings.unshift("?栋")
        config.floors.unshift("?层")
        config.units.unshift("?单元")
    } 
    console.log(config)
    return config.buildings[building].replace(/栋/, "-") + config.floors[floor].replace(/层/, "") + formatNumber(config.units[unit].replace(/单元/, ""))
  //return Number(building) + "-" + Number(floor) + formatNumber(Number(unit))
}

module.exports = {
  formatDayAndTime,
  formatDay,
  formatTime,
  formatAddress,
}
