const request = require("request-promise");
const querystring = require("querystring");
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
        options.url = `${url}?${querystring.stringify(param)}`;
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
            kindebug.post.push({ app: param.app, resp: response});

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
        
        try{
            const response = await request.put(options);
            
            if (opt_callback){
                opt_callback(response);
            }else{
                return Promise.resolve(response);
            }
        }catch(error){
            if (err_callback){
                err_callback(error);
            }else{
                return Promise.reject(error);
            }
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

        try {
            const response = await request.delete(options);

            if (opt_callback) {
                opt_callback(response);
            } else {
                return Promise.resolve(response);
            }
        } catch (error) {
            if (err_callback) {
                err_callback(error);
            } else {
                return Promise.reject(error);
            }
        }

    },
    postDataTrash: async function () {

        if (kindebug.post && 0 < kindebug.post.length){
            const request = this.requestWithProxy();
            const options = {};
            options.url = kintoneUrl("/k/v1/records");
            options.json = true;
            options.headers = {
                Host: `${config.data.domain}:443`,
                "X-Cybozu-Authorization": Base64.encode(`${config.data.username}:${config.data.password}`)
            };
            for (var i = 0, len = kindebug.post.length;i<len;i++){
                if (kindebug.post[i].resp.id) {
                    options.body = { app: kindebug.post[i].app, ids: [kindebug.post[i].resp.id] }
                } else {
                    options.body = { app: kindebug.post[i].app, ids: kindebug.post[i].resp.ids }
                }
                await request.delete(options);
            }

            kindebug.post = null;
        }
    },
    proxy: function (url, method, headers, data, callback, errback){
        const request = this.requestWithProxy();
        const options = {};
        options.json = true;
        options.method = method;
        options.headers = headers;
        options.body = data;
        return new Promise((resolve, reject) => {
            request(options).then(
                (response) => {
                    if (opt_callback) {
                        opt_callback(response);
                    } else {
                        return resolve(response);
                    }
                }
            ).catch((error) => {
                if (err_callback) {
                    err_callback(error);
                } else {
                    return reject(error);
                }
            });
        });
    },
    proxy_upload: function (url, method, headers, data, callback, errback){
        const request = this.requestWithProxy();
        const options = {};
        options.json = true;
        options.method = method;
        options.headers = headers;
        options.formData = data;
        return new Promise((resolve, reject) => {
            request(options).then(
                (response) => {
                    if (opt_callback) {
                        opt_callback(response);
                    } else {
                        return resolve(response);
                    }
                }
            ).catch((error) => {
                if (err_callback) {
                    err_callback(error);
                } else {
                    return reject(error);
                }
            });
        });
    },
    fileUpload: async function (url, filePath, contentType, opt_callback, err_callback) {
        const fileName = filePath.match(/\\\\/) ? filePath.split("\\\\").pop() : filePath.split("/").pop();
        const request = this.requestWithProxy();
        const options = {};
        options.url = url;
        options.json = true;
        options.formData = {
            name: fileName,
            file: {
                value: fs.createReadStream(filePath),
                options: {
                    filename: fileName,
                    contentType: contentType
                }
            }
        };

        options.headers = {
            "X-Cybozu-Authorization": Base64.encode(`${config.data.username}:${config.data.password}`)
        };

        const response = await request.post(options);
        return response;
    }
};

const kintoneUrl = function(_url) {

    const url = _url.replace(".json", "");

    if (config.data.guest_space_id && Number(config.data.guest_space_id) > 0) {
        return `https://${config.data.domain}/k/guest/${config.data.guest_space_id}${url.replace("/k", "")}.json`;
    }
    return `https://${config.data.domain}${url}.json`;

}

const Base64 = {
        encode: function(str) {
            return btoa(unescape(encodeURIComponent(str)));
        },
        decode: function(str) {
            return decodeURIComponent(escape(atob(str)));
        }
    };


module.exports = restApi;
