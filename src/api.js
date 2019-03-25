const ev = new (require('events'))();
const util = require('util');
const fs = require('fs');
//const querystring = require("querystring");
var config = null;
var restApi = null;

var kintone = function (filePath) {
    config = new (require('./config'))(filePath);
    restApi = new (require('./restApi'))(config);
}

kintone.prototype.debugObjSet = function (_config, _restApi) {
    config = _config;
    restApi = _restApi;
 }

kintone.prototype.events = function () { }

kintone.prototype.events.on = function (event, func) {
    ev.removeAllListeners(event);
    ev.on(event, func);
}

kintone.prototype.events.off = function (event) {
    if (0 >= ev.listenerCount(event)){
        return false;
    }else{
        ev.removeAllListeners(event);
        return true;
    }
}

kintone.prototype.events.do = function (event, data) {
    ev.emit(event, data);
}

kintone.prototype.api = function (pathOrUrl, method, params, opt_callback, opt_errback) {

    switch (method) {
        case "GET":
            return restApi.get(pathOrUrl, params, opt_callback, opt_errback);
        case "POST":
            return restApi.post(pathOrUrl, params, opt_callback, opt_errback);
        case "PUT":
            return restApi.put(pathOrUrl, params, opt_callback, opt_errback);
        case "DELETE":
            return restApi.delete(pathOrUrl, params, opt_callback, opt_errback);
    }
}

kintone.prototype.postDataTrash = function (){
    restApi.postDataTrash();
}

kintone.prototype.api.url = function (_path, flg) {

    const path = _path.replace(".json", "");

    if (flg && config.data.guest_space_id && Number(config.data.guest_space_id) > 0) {
        return `https://${config.data.domain}/k/guest/${config.data.guest_space_id}${path.replace("/k", "")}.json`;
    }
    return `https://${config.data.domain}${path}.json`;
}

const querystring = function (_param){
    // params = {foo: 'bar', record: {key: ['val1', 'val2']}}
    // foo=bar&record.key[0]=val1&record.key[1]=val2
    const _parentKey = null;
    const _query = [];

    const exec = function (param, parentKey, query){
        if (Array.isArray(param)) {
            for (let i = 0, len = param.length; i < len; i++) {
                exec(param[i], parentKey ? `${parentKey}[${i.toString()}]` : `[${i.toString()}]`, query);
            }
        } else if (toString.call(param).slice(8, -1).toLowerCase() === 'object') {
            for (let key in param) {
                exec(param[key], parentKey ? `${parentKey}.${key}` : `${key}`, query);
            }
        } else {
            if (parentKey) {
                query.push(`${parentKey}=${param}`);
            }
        }
    }

    exec(_param, _parentKey, _query);
    return _query.join("&");

}
kintone.prototype.api.urlForGet = function (_path, params, opt_detectGuestSpace) {

    return querystring(params);
    /*const path = _path.replace(".json", "");
    var url = null;

    if (config.data.guest_space_id && Number(config.data.guest_space_id) > 0) {
        url = `https://${config.data.domain}/k/guest/${config.data.guest_space_id}${path.replace("/k", "")}.json`;
    }else{
        url = `https://${config.data.domain}${path}.json`;
    }
    return `${url}?${querystring.stringify(params)}`;*/
}

var csrfToken = null;
kintone.prototype.getRequestToken = function () {
    return csrfToken;
}

kintone.prototype.setRequestToken = function (_csrfToken) {
    csrfToken = _csrfToken;
}

var concurrencyLimit = {};
kintone.prototype.getConcurrencyLimit = function () {
    return Promise.resolve(concurrencyLimit);
}

kintone.prototype.setConcurrencyLimit = function (limit = 0, running = 0) {
    concurrencyLimit = { limit, running };
}

kintone.prototype.proxy = function (url, method, headers, data, callback, errback) {
    return restApi.proxy(url, method, headers, data, callback, errback);
}
kintone.prototype.proxy.upload = function (url, method, headers, data, callback, errback) {
    restApi.proxy_upload(url, method, headers, data, callback, errback);
}

kintone.prototype.app = function () { }
kintone.prototype.app.record = function () { }
kintone.prototype.mobile = function () { }
kintone.prototype.mobile.app = function () { }
kintone.prototype.mobile.app.record = function () { }

var desktopRecordId = null;
kintone.prototype.app.record.getId = function () {
    return desktopRecordId;
}

var mobileRecordId = null;
kintone.prototype.mobile.app.record.getId = function () { 
    return mobileRecordId;
}

kintone.prototype.app.record.setId = function (id) {
    desktopRecordId = id;
}

kintone.prototype.mobile.app.record.setId = function (id) {
    mobileRecordId = id;
}

var desktopRecord = null;
kintone.prototype.app.record.get = function () {
    return desktopRecord;
}

var mobileRecord = null;
kintone.prototype.mobile.app.record.get = function () {
    return mobileRecord;
}

kintone.prototype.app.record.set = function (record) {
    desktopRecord = record;
}

kintone.prototype.mobile.app.record.set = function (record) {
    mobileRecord = record;
}

var desktopQueryCondition = null;
kintone.prototype.app.getQueryCondition = function () {
    return desktopQueryCondition;
}

var mobileQueryCondition = null;
kintone.prototype.mobile.app.getQueryCondition = function () {
    return mobileQueryCondition;
}

kintone.prototype.app.setQueryCondition = function (condition) {
    desktopQueryCondition = condition;
}

kintone.prototype.mobile.app.setQueryCondition = function (condition) {
    mobileQueryCondition = condition;
}

var desktopQuery = null;
kintone.prototype.app.getQuery = function () {
    return desktopQuery;
}

var mobileQuery = null;
kintone.prototype.mobile.app.getQuery = function () {
    return mobileQuery;
}

kintone.prototype.app.setQuery = function (query) {
    desktopQuery = query;
}

kintone.prototype.mobile.app.setQuery = function (query) {
    mobileQuery = query;
}

var desktopId = null;
kintone.prototype.app.getId = function () {
    return desktopId;
}

var mobileId = null;
kintone.prototype.mobile.app.getId = function () {
    return mobileId;
}

kintone.prototype.app.setId = function (id) {
    desktopId = id;
}

kintone.prototype.mobile.app.setId = function (id) {
    mobileId = id;
}

var desktopLookupTargetAppId = null;
kintone.prototype.app.getLookupTargetAppId = function () {
    return desktopLookupTargetAppId;
}

var mobileLookupTargetAppId = null;
kintone.prototype.mobile.app.getLookupTargetAppId = function () {
    return mobileLookupTargetAppId;
}

kintone.prototype.app.setLookupTargetAppId = function (id) {
    desktopLookupTargetAppId = id;
}

kintone.prototype.mobile.app.setLookupTargetAppId = function (id) {
    mobileLookupTargetAppId = id;
}

var desktopRelatedRecordsTargetAppId = null;
kintone.prototype.app.getRelatedRecordsTargetAppId = function () {
    return desktopRelatedRecordsTargetAppId;
}

var mobileRelatedRecordsTargetAppId = null;
kintone.prototype.mobile.app.getRelatedRecordsTargetAppId = function () {
    return mobileRelatedRecordsTargetAppId;
}

kintone.prototype.app.getRelatedRecordsTargetAppId = function (id) {
    desktopRelatedRecordsTargetAppId = id;
}

kintone.prototype.mobile.app.getRelatedRecordsTargetAppId = function (id) {
    mobileRelatedRecordsTargetAppId = id;
}

var loginUser = null;
kintone.prototype.getLoginUser = function () {
    return loginUser;
}

/*"userinfo": {
    "FFSYS_Kintone": {
        "code": "sample",
        "email": "sample@sample.com",
        "employeeNumber": "",
        "extensionNumber": "",
        "id": "1",
        "isGuest": "false",
        "language": "ja",
        "mobilePhone": "09012345678",
        "name": "sample",
        "phone": "0426-12-3456",
        "timezone": "Asia/Tokyo",
        "url": "http://sample.com"
    }
}*/
kintone.prototype.setLoginUser = function (_loginUser) {
    loginUser = _loginUser;
}

var uiVersion = null;
kintone.prototype.getUiVersion = function () {
    return uiVersion;
}

kintone.prototype.setUiVersion = function (_uiVersion) {
    uiVersion = _uiVersion;
}

kintone.prototype.app.record.setFieldShown = function (fieldCode, isShown) {
    if (null == document) {return null;}
    const element = document.getElementById(fieldCode);
    if (element){
        isShown ? element.style.display = "block" : element.style.display = "none";
    }
}

kintone.prototype.mobile.app.record.setFieldShown = function (fieldCode, isShown) {
    if (null == document) { return null; }
    const element = document.getElementById(fieldCode);
    if (element) {
        isShown ? element.style.display = "block" : element.style.display = "none";
    }
}

kintone.prototype.app.record.setGroupFieldOpen = function (fieldCode, isOpen) {
    if (null == document) { return null; }
    const element = document.getElementById(fieldCode);
    if (element) {
        isOpen ? element.style.display = "block" : element.style.display = "none";
    }
}

kintone.prototype.mobile.app.record.setGroupFieldOpen = function (fieldCode, isOpen) {
    if (null == document) { return null; }
    const element = document.getElementById(fieldCode);
    if (element) {
        isOpen ? element.style.display = "block" : element.style.display = "none";
    }
}

kintone.prototype.app.record.getFieldElement = function (fieldCode) {
    if (null == document) { return null; }
    return document.getElementById(fieldCode);
}

var MenuSpaceId = null;
kintone.prototype.app.record.setHeaderMenuSpaceElement = function (_MenuSpaceId, str) {
    if (null == document) { return ; }
    if (null == _MenuSpaceId) { return ; }
    MenuSpaceId = _MenuSpaceId;
    document.body.innerHTML = `<div id='${MenuSpaceId}'>${str}</div>`;
}

kintone.prototype.app.record.getHeaderMenuSpaceElement = function () {
    if (null == document) { return null; }
    if (null == MenuSpaceId) { return document.body; }
    return document.getElementById(MenuSpaceId);
}

kintone.prototype.app.record.setSpaceElement = function (id, str) {
    if (null == document) { return; }
    if (null == id) { return; }
    document.body.innerHTML = `<div id='${id}'>${str}</div>`;
}

kintone.prototype.app.record.getSpaceElement = function (id) {
    if (null == document) { return null; }
    return document.getElementById(id);
}

kintone.prototype.mobile.app.record.setSpaceElement = function (id, str) {
    if (null == document) { return; }
    if (null == id) { return; }
    document.body.innerHTML = `<div id='${id}'>${str}</div>`;
}

kintone.prototype.mobile.app.record.getSpaceElement = function (id) {
    if (null == document) { return null; }
    return document.getElementById(id);
}

kintone.prototype.app.setFieldElements = function (fieldCode, count, str) {
    if (null == document) { return null; }
    var innerHTML = `<div>`;
    for (var i=0;i<count;i++){
        innerHTML += `<div class='${fieldCode}'>${str}</div>`
    }
    innerHTML += '</div>';
    document.body.innerHTML = innerHTML;
}

kintone.prototype.app.getFieldElements = function (fieldCode) {
    if (null == document) { return null; }
    return document.getElementsByClassName(fieldCode);
}

var headerMenuSpaceElementId = null;
kintone.prototype.app.setHeaderMenuSpaceElement = function (_MenuSpaceId, str) {
    if (null == document) { return; }
    if (null == _MenuSpaceId) { return; }
    headerMenuSpaceElementId = _MenuSpaceId;
    document.body.innerHTML = `<div id='${headerMenuSpaceElementId}'>${str}</div>`;
}

kintone.prototype.app.getHeaderMenuSpaceElement = function () {
    if (null == document) { return null; }
    if (null == headerMenuSpaceElementId) { return document.body; }
    return document.getElementById(headerMenuSpaceElementId);
}

var headerSpaceElementId= null;
kintone.prototype.app.setHeaderSpaceElement = function (_headerSpaceElementId, str) {
    if (null == document) { return; }
    if (null == _headerSpaceElementId) { return; }
    headerSpaceElementId = _headerSpaceElementId;
    document.body.innerHTML = `<div id='${headerSpaceElementId}'>${str}</div>`;
}

kintone.prototype.app.getHeaderSpaceElement = function () {
    if (null == document) { return null; }
    if (null == headerSpaceElementId) { return document.body; }
    return document.getElementById(headerSpaceElementId);
}



var mobileHeaderSpaceElementId = null;
kintone.prototype.mobile.app.setHeaderSpaceElement = function (_mobileHeaderSpaceElementId, str) {
    if (null == document) { return; }
    if (null == _mobileHeaderSpaceElementId) { return; }
    mobileHeaderSpaceElementId = _mobileHeaderSpaceElementId;
    document.body.innerHTML = `<div id='${mobileHeaderSpaceElementId}'>${str}</div>`;
}

kintone.prototype.mobile.app.getHeaderSpaceElement = function () {
    if (null == document) { return null; }
    if (null == mobileHeaderSpaceElementId) { return document.body; }
    return document.getElementById(mobileHeaderSpaceElementId);
}

kintone.prototype.plugin = function () { }
kintone.prototype.plugin.app = function () { }

var pluginConfg = null;
kintone.prototype.plugin.app.setConfig = function (config, callback) {
    pluginConfg = config;
    if (callback) {
        callback();
    }
}

kintone.prototype.plugin.app.getConfig = function (PLUGIN_ID) {
    return pluginConfg;
}

var proxyConfig = {};
kintone.prototype.plugin.app.setProxyConfig = function(url, method, headers, data, callback){
    proxyConfig[url] = proxyConfig[url] || {};
    proxyConfig[url][method] = { headers, data };
    if (callback){
        callback();
    }
}

kintone.prototype.plugin.app.getProxyConfig = function(url, method){
    if (proxyConfig[url] && proxyConfig[url][method]){
        return proxyConfig[url][method];
    }
}

kintone.prototype.plugin.app.proxy = function (pluginId, url, method, headers, data, callback, errback) {
    if (proxyConfig[url] && proxyConfig[url][method]) {
        const newHeaders = Object.assign(proxyConfig[url][method].headers, headers);
        const newData = Object.assign(proxyConfig[url][method].data, data);
        return restApi.proxy(url, method, newHeaders, newData, callback, errback);
    }else{
        return restApi.proxy(url, method, headers, data, callback, errback);
    }
}

kintone.prototype.plugin.app.proxy.upload = function (url, method, headers, data, callback, errback) {
    restApi.proxy_upload(url, method, headers, data, callback, errback);
}

kintone.prototype.Promise = Promise;

module.exports = kintone;
//test
