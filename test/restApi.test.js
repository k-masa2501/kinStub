(function () {
    "use strict";

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
            config.data.proxy = process.env.HTTP_PROXY;
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

        it('get faild by not exist record id.', async function () {
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

        it('get faild by promise.', function (done) {
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

        it('get faild by callback.', function (done) {
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

        it('get faild by not exist domain.', function (done) {
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
            const param = { app: "7", record: { single_line_string: { value: "aaaa" } } };
            const result = await restApi.post(url, param, null, null);
            chai.assert.isOk(result.id);
        });

        it('post success by multiple records.', async function () {
            const url = `https://${config.data.domain}//k/v1/records.json`;
            const param = { app: "7", records: [{ single_line_string: { value: "aaaa" } }, { single_line_string: { value: "bbbb" } }] };
            const result = await restApi.post(url, param, null, null);
            chai.assert.isOk(result.ids);
        });

        it('post success by promise.', function (done) {
            const url = `https://${config.data.domain}//k/v1/record.json`;
            const param = { app: "7", record: { single_line_string: { value: "aaaa" } } };
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
            const url = `https://${config.data.domain}//k/v1/record.json`;
            const param = { app: "7", record: { single_line_string: { value: "aaaa" } } };
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

        it('post faild by app not exist.', async function () {
            const url = `https://${config.data.domain}//k/v1/record.json`;
            const param = { app: "10000", record: { single_line_string: { value: "aaaa" } } };
            var result = false;
            try{
                await restApi.post(url, param, null, null);
                result = true;
            }catch(error){
                chai.assert.isOk(error);
            }
            if (result) { throw new Error(); }
        });

        it('post faild by promise.', function (done) {
            const url = `https://${config.data.domain}//k/v1/record.json`;
            const param = { app: "10000", record: { single_line_string: { value: "aaaa" } } };
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
        
        it('post faild by callback.', function (done) {
            const url = `https://${config.data.domain}//k/v1/record.json`;
            const param = { app: "10000", record: { single_line_string: { value: "aaaa" } } };
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
            const param = { app: "7", id:testData.get.ids[0], record: { single_line_string: { value: "aaaa" } } };
            const result = await restApi.put(url, param, null, null);
            chai.assert.isOk(result.revision);
        });

        it('put success by multiple records.', async function () {
            const url = `https://${config.data.domain}//k/v1/records.json`;
            const param = { app: "7", records: [{id:testData.get.ids[0], record:{ single_line_string: { value: "aaaa" } }}, { id:testData.get.ids[1], record:{single_line_string: { value: "bbbb" } }}] };
            const result = await restApi.put(url, param, null, null);
            chai.assert.isOk(2 === result.records.length);
        });

        it('put success by promise.', function (done) {
            const url = `https://${config.data.domain}//k/v1/record.json`;
            const param = { app: "7", id:testData.get.ids[0], record: { single_line_string: { value: "aaaa" } } };
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
            const param = { app: "7", id:testData.get.ids[0], record: { single_line_string: { value: "aaaa" } } };
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

        it('put faild by record id not exist.', async function () {
            const url = `https://${config.data.domain}//k/v1/record.json`;
            const param = { app: "7", id:99999999, record: { single_line_string: { value: "aaaa" } } };
            var result = false;
            try{
                await restApi.put(url, param, null, null);
                result = true;
            }catch(error){
                chai.assert.isOk(error);
            }
            if (result) { throw new Error(); }
        });

        it('put faild by promise.', function (done) {
            const url = `https://${config.data.domain}//k/v1/record.json`;
            const param = { app: "7", id:99999999, record: { single_line_string: { value: "aaaa" } } };
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
        
        it('put faild by callback.', function (done) {
            const url = `https://${config.data.domain}//k/v1/record.json`;
            const param = { app: "7", id:99999999, record: { single_line_string: { value: "aaaa" } } };
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
        afterEach(function () { });

        after(async function () { 
            await restApi.postDataTrash();
        });

    });

})();
