const request = require("request-promise");
const querystring = require("querystring");
const btoa = require('btoa');

var config = null;

const testData = function(filePath){
    config = new (require('./config'))(filePath);
}

testData.prototype = {
    load: async function(appID, data) {
        await this.post(kintoneUrl("/k/v1/records"), {app: appID}, data);
    },
    get: async function(url, param) {
        const request = requestWithProxy();
        const options = {};
        options.url     = `${url}?${querystring.stringify(param)}`;
        options.json    = true;
        options.headers = {
            Host: `${config.data.domain}:443`,
            "X-Cybozu-Authorization": Base64.encode(`${config.data.username}:${config.data.password}`)
        };
        const response = await request.get(options);
        return response;
    },
    post: async function(url, param) {
        const request = requestWithProxy();
        const options = {};
        options.url     = url;
        options.body    = param;
        options.json    = true;
        options.headers = {
            Host: `${config.data.domain}:443`,
            "X-Cybozu-Authorization": Base64.encode(`${config.data.username}:${config.data.password}`)
        };
        const response = await request.post(options);
        return response;
    },
    put: async function(url, param) {
        const request = requestWithProxy();
        const options = {};
        options.url     = url;
        options.body    = param;
        options.json    = true;
        options.headers = {
            Host: `${config.data.domain}:443`,
            "X-Cybozu-Authorization": Base64.encode(`${config.data.username}:${config.data.password}`)
        };
        const response = await request.put(options);
        return response;
    },
    delete: async function(url, param) {
        const request = requestWithProxy();
        const options = {};
        options.url     = url;
        options.body    = param;
        options.json    = true;
        options.headers = {
            Host: `${config.data.domain}:443`,
            "X-Cybozu-Authorization": Base64.encode(`${config.data.username}:${config.data.password}`)
        };
        const response = await request.delete(options);
        return response;
    },
    fileUpload: function (url, filePath, contentType, opt_callback, err_callback) {
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
            Host: `${config.data.domain}:443`,
            "X-Cybozu-Authorization": Base64.encode(`${config.data.username}:${config.data.password}`)
        };

        const response = await request.post(options);
        return response;
    }
}

const kintoneUrl = function(_url) {

    const url = _url.replace(".json", "");

    if (config.data.guest_space_id && Number(config.data.guest_space_id) > 0) {
        return `https://${config.data.domain}/k/guest/${config.data.guest_space_id}${url.replace("/k", "")}.json`;
    }
    return `https://${config.data.domain}${url}.json`;

}

const requestWithProxy = function() {
    if (config.data.proxy){
        return request.defaults(
            { 'proxy': `${config.data.proxy}` });
    }else{
        return request;
    }
}

const Base64 = {
    encode: function(str) {
        return btoa(unescape(encodeURIComponent(str)));
    },
    decode: function(str) {
        return decodeURIComponent(escape(atob(str)));
    }
};

module.exports = testData;
