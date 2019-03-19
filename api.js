const EventEmitter = require('events');
const ev = new EventEmitter();
const util = require('util');
const fs = require('fs');
var config = null;
var restApi = null;

var kintone = function (filePath) {
    config = new (require('./config'))(filePath);
    restApi = new (require('./restApi'))(config);
}

kintone.prototype.Promise = Promise;

kintone.prototype.api = async function (pathOrUrl, method, params, opt_callback, opt_errback) {

    switch (method) {
        case "GET":
        case "get":
            return await restApi.get(pathOrUrl, params, opt_callback, opt_errback);
            break;
        case "POST":
        case "post":
            return await restApi.post(pathOrUrl, params, opt_callback, opt_errback);
            break;
        case "PUT":
        case "put":
            return await restApi.put(pathOrUrl, params, opt_callback, opt_errback);
            break;
        case "DELETE":
        case "delete":
            return await restApi.delete(pathOrUrl, params, opt_callback, opt_errback);
            break;
    }

}

kintone.prototype.api.fileUpload = async function (url, fileName) {
    return await restApi.fileUpload(url, fileName);
 }

kintone.prototype.proxy = function () { }
kintone.prototype.proxy.upload = async function (Url, method, headers, params, opt_callback, opt_errback) { 


}

kintone.prototype.api.url = function (url, flg) {
    
    const url = _url.replace(".json", "");

    if (config.data.guest_space_id && Number(config.data.guest_space_id) > 0) {
        return `https://${config.data.domain}/k/guest/${config.data.guest_space_id}${url.replace("/k", "")}.json`;
    }
    return `https://${config.data.domain}${url}.json`;
}

kintone.prototype.events = function () { }

kintone.prototype.events.on = function (event, func) {
    ev.removeAllListeners(event);
    ev.on(event, func);
}

kintone.prototype.events.do = function (event, data) {
    ev.emit(event, data);
}

kintone.prototype.events.off = function (event) {
    ev.removeAllListeners(event);
}

kintone.prototype.app = function () { }

var customizeGetId = null;
kintone.prototype.app.setId = function (id) { 
    customizeGetId = id; 
}

kintone.prototype.app.getId = function () { 
    if (customizeGetId){
        var tmp = customizeGetId;
        customizeGetId = null;
        return tmp;
    }else{
        return config.data.AppID;
    }
}

kintone.prototype.app.getHeaderMenuSpaceElement = function () { 
    var _document = document;
    if (_document){
        return _document.body; 
    }else{
        return null; 
    }
}

kintone.prototype.app.getFieldElements = function(str){
    return document.getElementsByClassName(str);
}

kintone.prototype.app.record = function () { }

var customizeRecordGetId = null;
kintone.prototype.app.record.setId = function (id) { 
    customizeRecordGetId = id; 
}
kintone.prototype.app.record.getId = function () { 
    if (customizeRecordGetId){
        var tmp = customizeRecordGetId;
        customizeAppId = null;
        return tmp;
    }else{
        return config.data.showDetailRecordId; 
    }
}

kintone.prototype.app.record.getHeaderMenuSpaceElement = function () { 
    var _document = document;
    if (_document){
        return _document.body; 
    }else{
        return null; 
    }
}

kintone.prototype.plugin = function () { }
kintone.prototype.plugin.app = function () { }
const pluginConfg = null;
kintone.prototype.plugin.app.setConfig = function (config, callback) {
    pluginConfg = config;
    if (callback){
        callback();
    }
}

kintone.prototype.plugin.app.getConfig = function (PLUGIN_ID) { 
    return pluginConfg;
}

kintone.prototype.getLoginUser = function () {
    return config.data.userinfo[this.userinfo];
}

kintone.prototype.setLoginUser = function (userinfo) {
    this.userinfo = userinfo;
}

kintone.prototype.setPluginId = function (id) {
    this.$PLUGIN_ID = id;
}

module.exports = kintone;
//test
