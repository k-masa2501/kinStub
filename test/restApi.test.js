(function () {
    "use strict";
    const btoa = require('btoa');
    const fs = require('fs');

    function sleep(time) {

        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve();
            }, time);
        });
    }

    describe('test restApi.js.', function () {

        this.timeout(15000);

        var restApi = null;
        var config = null;
        const testData = {};

        before(async function () { 
            config = new (require('../src/config.js'))("./test/.setting.json");
            config.data.domain = process.env.KINTONE_DOMAIN;
            config.data.username = process.env.KINTONE_USERNAME;
            config.data.password = process.env.KINTONE_PASSWORD;
            if (process.env.HTTP_PROXY) { config.data.proxy = process.env.HTTP_PROXY; }
            restApi = new (require('../src/restApi.js'))(config);
            testData.get = await restApi.post(
                `https://${config.data.domain}//k/v1/records.json`,
                { app: "7", records: [{ single_line_string: { value: "aaaa" } }, { single_line_string: { value: "bbbb" } }] },
                null,
                null
            );
        });

        beforeEach(function () { });

        it('get success.', async function () {
            const url = `https://${config.data.domain}//k/v1/record.json`;
            const param = { app: "7", id: testData.get.ids[0]};
            const result = await restApi.get(url, param, null, null);
            chai.assert(result.record.single_line_string.value, "aaaa");
        });

        it('get success by multiple items.', async function () {
            const url = `https://${config.data.domain}//k/v1/records.json`;
            const param = { app: "7" };
            const result = await restApi.get(url, param, null, null);
            chai.assert.isOk(0 < result.records.length);
        });

        it('get success by promise.', function (done) {
            const url = `https://${config.data.domain}//k/v1/record.json`;
            const param = { app: "7", id: testData.get.ids[0] };
            restApi.get(url, param, null, null).then(
                function(result){
                    chai.assert(result.record.single_line_string.value, "aaaa");
                    done();
                },
                function(error){
                    done(error);
                }
            );
        });

        it('get success by callback.', function (done) {
            const url = `https://${config.data.domain}//k/v1/record.json`;
            const param = { app: "7", id: testData.get.ids[0] };
            restApi.get(url, param,
                function (result) {
                    chai.assert(result.record.single_line_string.value, "aaaa");
                    done();
                },
                function (error) {
                    done(error);
                });
        });

        it('get faild reason not exist record id.', async function () {
            const url = `https://${config.data.domain}//k/v1/record.json`;
            const param = { app: "7", id: 10000 };
            var result = null;
            try {
                await restApi.get(url, param, null, null);
                result = true;
            } catch (error) {
                chai.assert.isOk(error);
            }
            if (result) { throw new Error(); }
        });

        it('get faild by promise(not exist record id).', function (done) {
            const url = `https://${config.data.domain}//k/v1/record.json`;
            const param = { app: "7", id: 10000 };

                restApi.get(url, param, null, null).then(
                    function(resp){
                        done(resp);
                    },
                    function(error){
                        chai.assert.isOk(error.message);
                        done();
                    }
                );
        });

        it('get faild by callback(not exist record id).', function (done) {
            const url = `https://${config.data.domain}//k/v1/record.json`;
            const param = { app: "7", id: 10000 };

            restApi.get(url, param,
                function (resp) {
                    done(resp);
                },
                function (error) {
                    chai.assert.isOk(error.message);
                    done();
                }
            );
        });

        it('get faild reason not exist domain.', function (done) {
            const url = `https://aaaaaacybozu.com/k/v1/record.json`;
            const param = { app: "7", id: testData.get.ids[0] };
            restApi.get(url, param,
                function (resp) {
                    done(resp);
                },
                function (error) {
                    chai.assert.isOk(error);
                    done();
                }
            );
        });

        it('get success but promise throw new error.', function (done) {
            const url = `https://${config.data.domain}//k/v1/record.json`;
            const param = { app: "7", id: testData.get.ids[0] };
            restApi.get(url, param, null, null).then(
                function (result) {
                    throw new Error("promise throw new error.");
                },
                function (error) { 
                    done(error);
                },
            ).catch(function (e) {
                chai.assert.isOk(e);
                done();
            });
        });

        it('post success.', async function () {
            const url = `https://${config.data.domain}//k/v1/record.json`;
            const param = { app: "7", record: { single_line_string: { value: "cccc" } } };
            const result = await restApi.post(url, param, null, null);
            chai.assert.isOk(result.id);
        });

        it('post success by multiple records.', async function () {
            const url = `https://${config.data.domain}//k/v1/records.json`;
            const param = { app: "7", records: [{ single_line_string: { value: "ddd" } }, { single_line_string: { value: "bbbb" } }] };
            const result = await restApi.post(url, param, null, null);
            chai.assert.isOk(result.ids);
        });

        it('post success by promise.', function (done) {
            const url = `https://${config.data.domain}//k/v1/record.json`;
            const param = { app: "7", record: { single_line_string: { value: "eeee" } } };
            restApi.post(url, param, null, null).then(
                function(resp){
                    chai.assert.isOk(resp.id);
                    done();
                },
                function(error){
                    done(error);
                }
            );
        });
        
        it('post success by callback.', function (done) {
            const url = `https://${config.data.domain}/k/v1/record.json`;
            const param = { app: "7", record: { single_line_string: { value: "ffff" } } };
            restApi.post(url, param, 
                function(resp){
                    chai.assert.isOk(resp.id);
                    done();
                }, 
                function(error){
                    done(error);
                }
            );
        });

        it('post faild reason app not exist.', async function () {
            const url = `https://${config.data.domain}/k/v1/record.json`;
            const param = { app: "10000", record: { single_line_string: { value: "gggg" } } };
            var result = false;
            try{
                await restApi.post(url, param, null, null);
                result = true;
            }catch(error){
                chai.assert.isOk(error);
            }
            if (result) { throw new Error(); }
        });

        it('post faild by promise(app not exist).', function (done) {
            const url = `https://${config.data.domain}//k/v1/record.json`;
            const param = { app: "10000", record: { single_line_string: { value: "hhhh" } } };
            restApi.post(url, param, null, null).then(
                function(resp){
                    done(resp);
                },
                function(error){
                    chai.assert.isOk(error.message);
                    done();
                }
            );
        });
        
        it('post faild by callback(app not exist).', function (done) {
            const url = `https://${config.data.domain}//k/v1/record.json`;
            const param = { app: "10000", record: { single_line_string: { value: "iiii" } } };
            restApi.post(url, param, 
                function(resp){
                    done(resp);
                }, 
                function(error){
                    chai.assert.isOk(error.message);
                    done();
                }
            );
        });

        it('put success.', async function () {
            const url = `https://${config.data.domain}//k/v1/record.json`;
            const param = { app: "7", id:testData.get.ids[0], record: { single_line_string: { value: "jjjj" } } };
            const result = await restApi.put(url, param, null, null);
            chai.assert.isOk(result.revision);
        });

        it('put success by multiple records.', async function () {
            const url = `https://${config.data.domain}//k/v1/records.json`;
            const param = { app: "7", records: [{id:testData.get.ids[0], record:{ single_line_string: { value: "kkkk" } }}, { id:testData.get.ids[1], record:{single_line_string: { value: "bbbb" } }}] };
            const result = await restApi.put(url, param, null, null);
            chai.assert.isOk(2 === result.records.length);
        });

        it('put success by promise.', function (done) {
            const url = `https://${config.data.domain}//k/v1/record.json`;
            const param = { app: "7", id:testData.get.ids[0], record: { single_line_string: { value: "llll" } } };
            restApi.put(url, param, null, null).then(
                function(resp){
                    chai.assert.isOk(resp.revision);
                    done();
                },
                function(error){
                    done(error);
                }
            );
        });
        
        it('put success by callback.', function (done) {
            const url = `https://${config.data.domain}//k/v1/record.json`;
            const param = { app: "7", id:testData.get.ids[0], record: { single_line_string: { value: "mmmm" } } };
            restApi.put(url, param, 
                function(resp){
                    chai.assert.isOk(resp.revision);
                    done();
                }, 
                function(error){
                    done(error);
                }
            );
        });

        it('put faild reason record id not exist.', async function () {
            const url = `https://${config.data.domain}//k/v1/record.json`;
            const param = { app: "7", id:99999999, record: { single_line_string: { value: "nnnn" } } };
            var result = false;
            try{
                await restApi.put(url, param, null, null);
                result = true;
            }catch(error){
                chai.assert.isOk(error);
            }
            if (result) { throw new Error(); }
        });

        it('put faild by promise(record id not exist).', function (done) {
            const url = `https://${config.data.domain}//k/v1/record.json`;
            const param = { app: "7", id:99999999, record: { single_line_string: { value: "oooo" } } };
            restApi.put(url, param, null, null).then(
                function(resp){
                    done(resp);
                },
                function(error){
                    chai.assert.isOk(error.message);
                    done();
                }
            );
        });
        
        it('put faild by callback(record id not exist).', function (done) {
            const url = `https://${config.data.domain}//k/v1/record.json`;
            const param = { app: "7", id:99999999, record: { single_line_string: { value: "pppp" } } };
            restApi.put(url, param, 
                function(resp){
                    done(resp);
                }, 
                function(error){
                    chai.assert.isOk(error.message);
                    done();
                }
            );
        });

        it('delete success.', async function () {

            // テストデータ作成
            const postResult = await restApi.post(
                `https://${config.data.domain}//k/v1/record.json`,
                { app: "7", record: { single_line_string: { value: "qqqq" } } },
                null,
                null
            );

            const url = `https://${config.data.domain}//k/v1/records.json`;
            const param = { app: "7", ids: [postResult.id] };
            const result = await restApi.delete(url, param, null, null);
            chai.assert.isOk(result);
        });

        it('delete success by promise.', function (done) {

            // テストデータ作成
            restApi.post(
                `https://${config.data.domain}//k/v1/record.json`,
                { app: "7", record: { single_line_string: { value: "rrrr" } } },
                null,
                null
            ).then(
                function(resp){
                    const url = `https://${config.data.domain}//k/v1/records.json`;
                    const param = { app: "7", ids: [resp.id] };
                    restApi.delete(url, param, null, null).then(
                        function (resp) {
                            chai.assert.isOk(resp);
                            done();
                        },
                        function (error) {
                            done(error);
                        }
                    );
                },
                function (error) { },
            );
        });

        it('delete success by callback.', function (done) {
            
            // テストデータ作成
            restApi.post(
                `https://${config.data.domain}//k/v1/record.json`,
                { app: "7", record: { single_line_string: { value: "ssss" } } },
                null,
                null
            ).then(
                function(resp){
                    const url = `https://${config.data.domain}//k/v1/records.json`;
                    const param = { app: "7", ids: [resp.id] };
                    restApi.delete(url, param,
                        function (resp) {
                            chai.assert.isOk(resp);
                            done();
                        },
                        function (error) {
                            done(error);
                        }
                    );
                },
                function(error){}
            );
        });

        it('delete faild reason record id not exist.', async function () {

            const url = `https://${config.data.domain}//k/v1/records.json`;
            const param = { app: "7", ids: [999999] };
            var result = false;
            try {
                await restApi.delete(url, param, null, null);
                result = true;
            } catch (error) {
                chai.assert.isOk(error);
            }
            if (result) { throw new Error(); }
        });

        it('delete faild by promise(record id not exist).', function (done) {
            const url = `https://${config.data.domain}//k/v1/records.json`;
            const param = { app: "7", ids: [999999] };
            restApi.delete(url, param, null, null).then(
                function (resp) {
                    done(resp);
                },
                function (error) {
                    chai.assert.isOk(error.message);
                    done();
                }
            );
        });

        it('delete faild by callback(record id not exist).', function (done) {
            const url = `https://${config.data.domain}//k/v1/records.json`;
            const param = { app: "7", ids: [999999] };
            restApi.delete(url, param,
                function (resp) {
                    done(resp);
                },
                function (error) {
                    chai.assert.isOk(error.message);
                    done();
                }
            );
        });
        
        it('proxy success by promise.', function (done) {

            const encode = function(str) {
                return btoa(unescape(encodeURIComponent(str)));
            }

            const url = `https://${config.data.domain}/k/v1/record.json`;
            const param = { app: "7", id: testData.get.ids[0] };
            const headers = {
                "Content-Type": 'application/json',
                "X-Cybozu-Authorization": encode(`${config.data.username}:${config.data.password}`)
            };
            restApi.proxy(url, "GET", headers, JSON.stringify(param), null, null).then(
                function (arg){
                    chai.assert.isOk(200 === arg[1]);
                    done();
                },
                function(error){
                    done(error);
                }
            );
        });

        it('proxy success by callback.', function (done) {

            const encode = function (str) {
                return btoa(unescape(encodeURIComponent(str)));
            }

            const url = `https://${config.data.domain}/k/v1/record.json`;
            const param = { app: "7", id: testData.get.ids[0] };
            const headers = {
                "Content-Type": 'application/json',
                "X-Cybozu-Authorization": encode(`${config.data.username}:${config.data.password}`)
            };
            restApi.proxy(url, "GET", headers, JSON.stringify(param),
                function (statusCode, body, headers) {
                    chai.assert.isOk(200 === statusCode);
                    done();
                },
                function (error) {
                    done(error);
                }
            );
        });

        it('proxy faild by promise(domain not exist).', function (done) {

            const encode = function (str) {
                return btoa(unescape(encodeURIComponent(str)));
            }

            const url = `https://sample.cybozu.com/k/v1/record.json`;
            const param = { app: "7", id: testData.get.ids[0] };
            const headers = {
                "Content-Type": 'application/json',
                "X-Cybozu-Authorization": encode(`${config.data.username}:${config.data.password}`)
            };
            restApi.proxy(url, "GET", headers, JSON.stringify(param), null, null).then(
                function (arg) {
                    done(arg);
                },
                function (error) {
                    chai.assert.isOk(error);
                    done();
                }
            );
        });

        it('proxy faild by callback(id not exist).', function (done) {

            const encode = function (str) {
                return btoa(unescape(encodeURIComponent(str)));
            }

            const url = `https://${config.data.domain}/k/v1/record.json`;
            const param = { app: "7", id: 999999999 };
            const headers = {
                "Content-Type": 'application/json',
                "X-Cybozu-Authorization": encode(`${config.data.username}:${config.data.password}`)
            };
            restApi.proxy(url, "GET", headers, JSON.stringify(param),
                function (statusCode, body, headers) {
                    done({ statusCode, body, headers });
                },
                function (error) {
                    chai.assert.isOk(error);
                    done();
                }
            );
        });

        it('proxy_upload success by promise.', function (done) {

            const encode = function (str) {
                return btoa(unescape(encodeURIComponent(str)));
            }

            const url = `https://${config.data.domain}/k/v1/file.json`;
            const formData = {
                name: 'test_upload.js',
                    file: {
                        value: fs.createReadStream("./test/test_upload.js"),
                        options: {
                            filename: 'test_upload.js',
                            contentType: 'text/plain'
                    }
                }
            }
            const headers = {
                "Content-Type": 'application/json',
                "X-Cybozu-Authorization": encode(`${config.data.username}:${config.data.password}`)
            };
            restApi.proxy_upload(url, "POST", headers, formData, null, null).then(
                function (arg) {
                    chai.assert.isOk(200 === arg[1]);
                    chai.assert.isOk(JSON.parse(arg[0]).fileKey);
                    done();
                },
                function (error) {
                    done(error);
                }
            );
        });

        it('proxy_upload success by callback.', function (done) {

            const encode = function (str) {
                return btoa(unescape(encodeURIComponent(str)));
            }

            const url = `https://${config.data.domain}/k/v1/file.json`;
            const formData = {
                name: 'test_upload.js',
                file: {
                    value: fs.createReadStream("./test/test_upload.js"),
                    options: {
                        filename: 'test_upload.js',
                        contentType: 'text/plain'
                    }
                }
            }
            const headers = {
                "Content-Type": 'application/json',
                "X-Cybozu-Authorization": encode(`${config.data.username}:${config.data.password}`)
            };

            restApi.proxy_upload(url, "POST", headers, formData,
                function (statusCode, body, headers) {
                    chai.assert.isOk(200 === statusCode);
                    chai.assert.isOk(JSON.parse(body).fileKey);
                    done();
                },
                function (error) {
                    done(error);
                });
        });

        it('proxy_upload faild by promise(value null).', function (done) {

            const encode = function (str) {
                return btoa(unescape(encodeURIComponent(str)));
            }

            const url = `https://${config.data.domain}/k/v1/file.json`;
            const formData = {
                name: 'test_upload.js',
                file: {
                    value: null,
                    options: {
                        filename: 'test_upload.js',
                        contentType: 'text/plain'
                    }
                }
            }
            const headers = {
                "Content-Type": 'application/json',
                "X-Cybozu-Authorization": encode(`${config.data.username}:${config.data.password}`)
            };
            restApi.proxy_upload(url, "POST", headers, formData, null, null).then(
                function (arg) {
                    done(arg);
                },
                function (error) {
                    chai.assert.isOk(error);
                    done();
                }
            );
        });

        it('proxy_upload faild by callback(value null).', function (done) {

            const encode = function (str) {
                return btoa(unescape(encodeURIComponent(str)));
            }

            const url = `https://${config.data.domain}/k/v1/file.json`;
            const formData = {
                name: 'test_upload.js',
                file: {
                    value: null,
                    options: {
                        filename: 'test_upload.js',
                        contentType: 'text/plain'
                    }
                }
            }
            const headers = {
                "Content-Type": 'application/json',
                "X-Cybozu-Authorization": encode(`${config.data.username}:${config.data.password}`)
            };

            restApi.proxy_upload(url, "POST", headers, formData,
                function (statusCode, body, headers) {
                    done({ statusCode, body, headers});
                },
                function (error) {
                    chai.assert.isOk(error);
                    done();
                });
        });

        afterEach(function () { });

        after(async function () { 
            await restApi.postDataTrash();
        });

    });

})();
