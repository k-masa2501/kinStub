const ev = new (require('events'))();
const fs = require('fs');
var config = null;
var restApi = null;

var kintone = function (arg) {
    if ("object" === typeof arg){
        config = arg;
    }else{
        config = (require('./config'))(arg);
    }
    restApi = new (require('./restApi'))(config);
}

kintone.prototype.debugObjSet = function (_config, _restApi) {
    config = _config;
    restApi = _restApi;
}

kintone.prototype.debugSetPluginId = function (id) {
    this.$PLUGIN_ID = id;
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
        default:
            return;
    }
}

kintone.prototype.postDataTrash = function (){
    return restApi.postDataTrash();
}

kintone.prototype.api.url = function (_path, flg) {

    const path = _path.replace(".json", "");

    if (flg && config.guest_space_id && Number(config.guest_space_id) > 0) {
        return `https://${config.domain}/k/guest/${config.guest_space_id}${path.replace("/k", "")}.json`;
    }
    return `https://${config.domain}${path}.json`;
}

const querystring = function (_param){
    const _query = [];
    const _parentKey = null;

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

    const path = _path.replace(".json", "");
    var url = null;

    if (config.guest_space_id && Number(config.guest_space_id) > 0) {
        url = `https://${config.domain}/k/guest/${config.guest_space_id}${path.replace("/k", "")}.json`;
    }else{
        url = `https://${config.domain}${path}.json`;
    }
    return `${url}?${querystring(params)}`;
}

var csrfToken = null;
kintone.prototype.getRequestToken = function () {
    return csrfToken;
}

kintone.prototype.setRequestToken = function (_csrfToken) {
    csrfToken = _csrfToken;
}

var concurrencyLimit = {limit:0, running:0};
kintone.prototype.api.getConcurrencyLimit = function () {
    return Promise.resolve(concurrencyLimit);
}

kintone.prototype.api.setConcurrencyLimit = function (limit = 0, running = 0) {
    concurrencyLimit = { limit, running };
}

kintone.prototype.proxy = function (url, method, headers, data, callback, errback) {
    return restApi.proxy(url, method, headers, data, callback, errback);
}
kintone.prototype.proxy.upload = function (url, method, headers, data, callback, errback) {
    return restApi.proxy_upload(url, method, headers, data, callback, errback);
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
kintone.prototype.app.getLookupTargetAppId = function (fieldCode) {
    return desktopLookupTargetAppId ? desktopLookupTargetAppId[fieldCode] : null;
}

var mobileLookupTargetAppId = null;
kintone.prototype.mobile.app.getLookupTargetAppId = function (fieldCode) {
    return mobileLookupTargetAppId ? mobileLookupTargetAppId[fieldCode] : null;
}

kintone.prototype.app.setLookupTargetAppId = function (fieldCode, id) {
    desktopLookupTargetAppId = desktopLookupTargetAppId || {};
    desktopLookupTargetAppId[fieldCode] = id ;
}

kintone.prototype.mobile.app.setLookupTargetAppId = function (fieldCode, id) {
    mobileLookupTargetAppId = mobileLookupTargetAppId || {};
    mobileLookupTargetAppId[fieldCode] = id;
}

var desktopRelatedRecordsTargetAppId = null;
kintone.prototype.app.getRelatedRecordsTargetAppId = function (fieldCode) {
    return desktopRelatedRecordsTargetAppId[fieldCode];
}

var mobileRelatedRecordsTargetAppId = null;
kintone.prototype.mobile.app.getRelatedRecordsTargetAppId = function (fieldCode) {
    return mobileRelatedRecordsTargetAppId[fieldCode];
}

kintone.prototype.app.setRelatedRecordsTargetAppId = function (fieldCode, id) {
    desktopRelatedRecordsTargetAppId = desktopRelatedRecordsTargetAppId || {};
    desktopRelatedRecordsTargetAppId[fieldCode] = id;
}

kintone.prototype.mobile.app.setRelatedRecordsTargetAppId = function (fieldCode, id) {
    mobileRelatedRecordsTargetAppId = mobileRelatedRecordsTargetAppId || {};
    mobileRelatedRecordsTargetAppId[fieldCode] = id;
}

var loginUser = null;
kintone.prototype.getLoginUser = function () {
    if (loginUser){
        return loginUser;
    } else if (config.userinfo){
        return config.userinfo.default;
    }else{
        return null;
    }
}

kintone.prototype.setLoginUser = function (_loginUser = null) {
    if (_loginUser){
        if (!_loginUser.hasOwnProperty('id')) return;
        if (!_loginUser.hasOwnProperty('code')) return;
        if (!_loginUser.hasOwnProperty('name')) return;
        if (!_loginUser.hasOwnProperty('email')) return;
        if (!_loginUser.hasOwnProperty('url')) return;
        if (!_loginUser.hasOwnProperty('employeeNumber')) return;
        if (!_loginUser.hasOwnProperty('phone')) return;
        if (!_loginUser.hasOwnProperty('mobilePhone')) return;
        if (!_loginUser.hasOwnProperty('extensionNumber')) return;
        if (!_loginUser.hasOwnProperty('timezone')) return;
        if (!_loginUser.hasOwnProperty('isGuest')) return;
        if (!_loginUser.hasOwnProperty('language')) return;
        loginUser = _loginUser;
    }
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

kintone.prototype.app.record.getSpaceElement = function (id) {
    if (null == document) { return null; }
    return document.getElementById(id);
}

kintone.prototype.mobile.app.record.getSpaceElement = function (id) {
    if (null == document) { return null; }
    return document.getElementById(id);
}

kintone.prototype.app.getFieldElements = function (fieldCode) {
    if (null == document) { return null; }
    const htmlCollection = document.getElementsByClassName(fieldCode);
    const arrayCollection = [];
    for (var i = 0, len = htmlCollection.length; i < len; i++) {
        arrayCollection.push(htmlCollection[i]);
    }
    return arrayCollection;
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

kintone.prototype.portal = function () { };
var contentSpaceElementId= null;
kintone.prototype.portal.setContentSpaceElement = function (_contentSpaceElementId, str) {
    if (null == document) { return; }
    if (null == _contentSpaceElementId) { return; }
    contentSpaceElementId = _contentSpaceElementId;
    document.body.innerHTML = `<div id='${contentSpaceElementId}'>${str}</div>`;
}

kintone.prototype.portal.getContentSpaceElement = function () {
    if (null == document) { return null; }
    if (null == contentSpaceElementId) { return document.body; }
    return document.getElementById(contentSpaceElementId);
}

kintone.prototype.mobile.portal = function () { };
var mobileContentSpaceElementId = null;
kintone.prototype.mobile.portal.setContentSpaceElement = function (_mobileContentSpaceElementId, str) {
    if (null == document) { return; }
    if (null == _mobileContentSpaceElementId) { return; }
    mobileContentSpaceElementId = _mobileContentSpaceElementId;
    document.body.innerHTML = `<div id='${mobileContentSpaceElementId}'>${str}</div>`;
}

kintone.prototype.mobile.portal.getContentSpaceElement = function () {
    if (null == document) { return null; }
    if (null == mobileContentSpaceElementId) { return document.body; }
    return document.getElementById(mobileContentSpaceElementId);
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
        const newHeaders = Object.assign(headers, proxyConfig[url][method].headers);
        const newData = Object.assign(typeof data === "string" ? JSON.parse(data) : data, proxyConfig[url][method].data);
        return restApi.proxy(url, method, newHeaders, typeof data === "string" ? JSON.stringify(newData) : newData, callback, errback);
    }else{
        return restApi.proxy(url, method, headers, data, callback, errback);
    }
}

kintone.prototype.plugin.app.proxy.upload = function (pluginId, url, method, headers, data, callback, errback) {
    return restApi.proxy_upload(url, method, headers, data, callback, errback);
}

kintone.prototype.Promise = Promise;

module.exports = kintone;
