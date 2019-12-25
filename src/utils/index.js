/* global window */
import classnames from 'classnames'
import lodash from 'lodash'
import config from './config'
import request from './request'
import { color } from './theme'
import moment from 'moment'

// 连字符转驼峰
String.prototype.hyphenToHump = function () {
    return this.replace(/-(\w)/g, (...args) => {
        return args[1].toUpperCase()
    })
}

// 驼峰转连字符
String.prototype.humpToHyphen = function () {
    return this.replace(/([A-Z])/g, '-$1').toLowerCase()
}

// 日期格式化
Date.prototype.format = function (format) {
    const o = {
        'M+': this.getMonth() + 1,
        'd+': this.getDate(),
        'h+': this.getHours(),
        'H+': this.getHours(),
        'm+': this.getMinutes(),
        's+': this.getSeconds(),
        'q+': Math.floor((this.getMonth() + 3) / 3),
        S: this.getMilliseconds(),
    }
    if (/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, `${this.getFullYear()}`.substr(4 - RegExp.$1.length))
    }
    for (let k in o) {
        if (new RegExp(`(${k})`).test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : (`00${o[k]}`).substr(`${o[k]}`.length))
        }
    }
    return format
}


/**
 * @param   {String}
 * @return  {String}
 */

const queryURL = (name) => {
    let reg = new RegExp(`(^|&)${name}=([^&]*)(&|$)`, 'i')
    let r = window.location.search.substr(1).match(reg)
    if (r != null) return decodeURI(r[2])
    return null
}

/**
 * 数组内查询
 * @param   {array}      array
 * @param   {String}    id
 * @param   {String}    keyAlias
 * @return  {Array}
 */
const queryArray = (array, key, keyAlias = 'key') => {
    if (!(array instanceof Array)) {
        return null
    }
    const item = array.filter(_ => _[keyAlias] === key)
    if (item.length) {
        return item[0]
    }
    return null
}

/**
 * 数组格式转树状结构
 * @param   {array}     array
 * @param   {String}    id
 * @param   {String}    pid
 * @param   {String}    children
 * @return  {Array}
 */
const arrayToTree = (array, id = 'id', pid = 'pid', children = 'children') => {
    let data = lodash.cloneDeep(array)
    let result = []
    let hash = {}
    data.forEach((item, index) => {
        hash[data[index][id]] = data[index]
    })

    data.forEach((item) => {
        let hashVP = hash[item[pid]]
        if (hashVP) {
            !hashVP[children] && (hashVP[children] = [])
            hashVP[children].push(item)
        } else {
            result.push(item)
        }
    })
    return result
}

const getTimeWithTZ = (time, timezone) =>{
    let localOffset = new Date().getTimezoneOffset() * 60 * 1000;
    return moment.utc(time).valueOf() + localOffset + (timezone * 60 * 60 * 1000);
}

const getCurrentTime = () =>{
    var now = new Date();
    console.log(now)
    return now.getTime()
}

const dateToTimeStarp = (inputDate) =>{
    var t = inputDate;  // 月、日、时、分、秒如果不满两位数可不带0.
    var T = new Date(t);  // 将指定日期转换为标准日期格式。Fri Dec 08 2017 20:05:30 GMT+0800 (中国标准时间)
    return T.getTime()
}

const dateToTimeStrapWithTZ = (inputDate, tz) => {
    return dateToTimeStarp(inputDate) - (tz * 60 * 60 * 1000)
}

const sliceArray = (inputArray) =>{
    const step = Math.ceil((inputArray.length) / 10);
    const object = JSON.parse(JSON.stringify(inputArray.pop()));

    let result = []
    for(var i=0;i<inputArray.length;i+=step){
        let data = inputArray.slice(i,i+10)
        result.push(data);
    }

    result.pop()
    result.push([object])
    return result
}

const getChartData = (inputArray) =>{
    let result = []
    if(inputArray.length<10){
        result = inputArray
        for(let i=0; i<result.length;i++){
            result[i].date = getLocalTime(result[i].date).substring(0,10)
            if(result[i].value < 0){
                result[i].value = result[i].value *(-1)
            }
        }
        return result;
    }else{
        let sliced = sliceArray(inputArray)
        for(let i=0; i<sliced.length; i++){
            let pointer = sliced[i]
            result.push(pointer[0])
        }

        for(let i=0; i<result.length;i++){
            result[i].date = getLocalTime(result[i].date).substring(0,10)
            if(result[i].value < 0){
                result[i].value = result[i].value *(-1)
            }
        }

        return result;
    }
}



const getLocalTime = (ns) =>{
    function formatDate(now) {
        var year=now.getFullYear();
        var month=now.getMonth()+1;
        if(month<10){
            month = '0'+month
        }
        var date=now.getDate();
        if(date<10){
            date = '0'+date
        }
        var hour=now.getHours();
        var minute=now.getMinutes();
        var second=now.getSeconds();
        return year+"/"+month+"/"+date+" "+hour+":"+minute+":"+second;
   }

   var d=new Date(ns);

    return formatDate(d)
}

const getSpecialTime = (ns) => {
    function formatDate(now) {
        var year=now.getFullYear();
        var month=now.getMonth()+1;
        var date=now.getDate();
        var hour=now.getHours();
        var minute=now.getMinutes();
        var second=now.getSeconds();
        return year+"-"+month+"-"+date
   }

   var d=new Date(ns);

    return formatDate(d)
}

const getDifferTime = (day) =>{
    return getCurrentTime() - day * (24 * 60 *60 *1000)
}

const getAppType = (inputString) => {
    let array = inputString.split('_')
    return array.pop().toLowerCase();
}

const getBeginTime = (input) => {
    return moment(input).startOf('day').valueOf()
}

const getEndTime = (input) => {
    return moment(input).startOf('day').valueOf() + (23*60*60*1000 + 59*60*1000 + 59*1000)
}

module.exports = {
    config,
    request,
    color,
    classnames,
    queryURL,
    queryArray,
    arrayToTree,
    dateToTimeStarp,
    getCurrentTime,
    getChartData,
    getDifferTime,
    getBeginTime,
    getEndTime,
    dateToTimeStrapWithTZ,
    getAppType,
    getTimeWithTZ
}
