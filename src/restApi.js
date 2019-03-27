const request = require("request-promise");
const btoa = require('btoa');

var config = null;
const kindebug = {post: null};

var restApi = function(settings) {
    config = settings;
};

restApi.prototype = {
    requestWithProxy: function() {
        if (config.data.proxy){
            return request.defaults(
                { 'proxy': `${config.data.proxy}` });
        }else{
            return request;
        }
    },
    get: async function(url, param, opt_callback = null, err_callback = null) {
        const request = this.requestWithProxy();
        const options = {};
        options.url = url;
        options.body = param;
        options.json = true;
        options.headers = {
            "X-Cybozu-Authorization": Base64.encode(`${config.data.username}:${config.data.password}`)
        };

        var response = null;

        try{
            response = await request.get(options);
        }catch(error){
            response = error.error || error;
            if (err_callback){
                err_callback(response);
                return;
            }else{
                return Promise.reject(response);
            }
        }

        if (opt_callback) {
            opt_callback(response);
            return;
        } else {
            return Promise.resolve(response);
        }
    },
    post: async function (url, param, opt_callback = null, err_callback = null) {
        const request = this.requestWithProxy();
        const options = {};
        options.url = url;
        options.body = param;
        options.json = true;
        options.headers = {
            "X-Cybozu-Authorization": Base64.encode(`${config.data.username}:${config.data.password}`)
        };

        var response = null;

        try {
            response = await request.post(options);
            kindebug.post = kindebug.post || new Array();
            kindebug.post.push({ url: options.url, app: param.app, resp: response});

        } catch (error) {
            if (err_callback) {
                err_callback(error);
                return;
            } else {
                return Promise.reject(error);
            }
        }

        if (opt_callback) {
            opt_callback(response);
            return;
        } else {
            return Promise.resolve(response);
        }
    },
    put: async function(url, param, opt_callback = null, err_callback = null) {
        const request = this.requestWithProxy();
        const options = {};
        options.url   = url;
        options.body  = param;
        options.json  = true;
        options.headers = {
            "X-Cybozu-Authorization": Base64.encode(`${config.data.username}:${config.data.password}`)
        };
        
        var response = null;

        try{
            response = await request.put(options);
            
        }catch(error){
            if (err_callback){
                err_callback(error);
                return;
            }else{
                return Promise.reject(error);
            }
        }

        if (opt_callback) {
            opt_callback(response);
            return;
        } else {
            return Promise.resolve(response);
        }
    },
    delete: async function (url, param, opt_callback = null, err_callback = null) {
        const domain = url.match(/https:\/\/(.*.cybozu.com)\/{0,1}.*/)[1];
        const request = this.requestWithProxy();
        const options = {};
        options.url = url;
        options.body = param;
        options.json = true;
        options.headers = {
            Host: `${domain}:443`,
            "X-Cybozu-Authorization": Base64.encode(`${config.data.username}:${config.data.password}`)
        };

        var response = null;

        try {
            response = await request.delete(options);

        } catch (error) {
            if (err_callback) {
                err_callback(error);
                return;
            } else {
                return Promise.reject(error);
            }
        }

        if (opt_callback) {
            opt_callback(response);
            return;
        } else {
            return Promise.resolve(response);
        }
    },
    postDataTrash: async function () {

        if (kindebug.post && 0 < kindebug.post.length){
            const request = this.requestWithProxy();
            const options = {};
            options.json = true;
            options.headers = {
                "X-Cybozu-Authorization": Base64.encode(`${config.data.username}:${config.data.password}`)
            };
            for (var i = 0, len = kindebug.post.length;i<len;i++){
                const url = kindebug.post[i].url.split("/");
                url[url.length-1] = "records.json";
                options.url = url.join("/");
                if (kindebug.post[i].resp.id) {
                    options.body = { app: kindebug.post[i].app, ids: [kindebug.post[i].resp.id] }
                } else {
                    options.body = { app: kindebug.post[i].app, ids: kindebug.post[i].resp.ids }
                }
                try{
                    await request.delete(options);
                }catch(e){/** */}
            }

            kindebug.post = null;
            return;
        }
    },
    proxy: async function (url, method, headers, data, opt_callback, err_callback){
        const request = this.requestWithProxy();
        const options = {};
        options.url = url;
        options.method = method;
        options.headers = headers;
        options.body = data;
        options.resolveWithFullResponse = true;

        var response = null;

        try {
            response = await request(options);

        } catch (error) {
            if (err_callback) {
                err_callback(error);
                return;
            } else {
                return Promise.reject(error);
            }
        }

        if (opt_callback) {
            opt_callback(response.statusCode, response.body, response.headers);
            return;
        } else {
            return Promise.resolve([response.body, response.statusCode, response.headers]);
        }
    },
    proxy_upload: async function (url, method, headers, data, opt_callback, err_callback){
        const request = this.requestWithProxy();
        const options = {};
        const errorObj = null;
        options.url = url;
        options.method = method;
        options.headers = headers;
        options.formData = data;
        options.resolveWithFullResponse = true;

        var response = null;

        try {
            response = await request(options);

        } catch (error) {
            if (err_callback) {
                err_callback(error);
                return;
            } else {
                return Promise.reject(error);
            }
        }

        if (opt_callback) {
            opt_callback(response.statusCode, response.body, response.headers);
            return;
        } else {
            return Promise.resolve([response.body, response.statusCode, response.headers]);
        }
    }
};

const Base64 = {
        encode: function(str) {
            return btoa(unescape(encodeURIComponent(str)));
        },
        decode: function(str) {
            return decodeURIComponent(escape(atob(str)));
        }
    };


module.exports = restApi;
