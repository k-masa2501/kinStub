(function () {
    "use strict";
    const fs = require('fs');

    function sleep(time) {

        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve();
            }, time);
        });
    }

    describe('test index.js.', function () {

        this.timeout(15000);

        var restApi = null;
        var config = null;
        var kintone = null;
        const testData = {};

        before(async function () {
            config = {
                "domain": process.env.KINTONE_DOMAIN,
                "username": process.env.KINTONE_USERNAME,
                "password": process.env.KINTONE_PASSWORD,
                "userinfo": {
                    "default": {
                        "id": "1",
                        "code": "sample",
                        "name": "sample",
                        "email": "sample@sample.com",
                        "url": "http://sample.com",
                        "employeeNumber": "",
                        "phone": "0426-12-3456",
                        "mobilePhone": "09012345678",
                        "extensionNumber": "",
                        "timezone": "Asia/Tokyo",
                        "isGuest": "false",
                        "language": "ja"
                    }
                }
            };
            if (process.env.HTTP_PROXY) {config.proxy = process.env.HTTP_PROXY;}

            var _kintone = require('../index.js');
            kintone = new _kintone(config);
            testData.get = await kintone.api(
                `https://${config.domain}//k/v1/records.json`,
                "POST",
                { app: "7", records: [{ single_line_string: { value: "aaaa" } }, { single_line_string: { value: "bbbb" } }] },
                null,
                null
            );
        });

        beforeEach(function () { });

        it('kintone.debugSetPluginId.', function () {
            kintone.debugSetPluginId(10);
            chai.assert.equal(kintone.$PLUGIN_ID, 10);
        });

        it('kintone.event.on(do).', function (done) {
            kintone.events.on("sample", function(record){
                chai.assert.equal(record.test, "test");
                done();
            });
            kintone.events.do("sample", { test: "test" });
        });

        it('kintone.event.off.', function () {
            const result = kintone.events.off("sample");
            chai.assert.isOk(result);
        });

        it('kintone.event.off faild reason event not setting.', function () {
            const result = kintone.events.off("event_not_exist");
            chai.assert.isNotOk(result);
        });

        it('kintone.api GET.', async function () {
            const result = await kintone.api(
                kintone.api.url("/k/v1/records"),
                "GET",
                { app: "7" },
                null,
                null
            );

            chai.assert.isOk(0 < result.records.length);

        });

        it('kintone.api POST.', async function () {
            const result = await kintone.api(
                kintone.api.url("/k/v1/record"),
                "POST",
                { app: "7", record: { single_line_string: { value: "aaaa" } } },
                null,
                null
            );

            chai.assert.isOk(result.id);

        });

        it('kintone.api PUT.', async function () {
            const result = await kintone.api(
                kintone.api.url("/k/v1/record"),
                "PUT",
                { app: "7", id: testData.get.ids[0], record: { single_line_string: { value: "jjjj" } } },
                null,
                null
            );

            chai.assert.isOk(result.revision);

        });

        it('kintone.api DELETE.', async function () {

            const post = await kintone.api(
                kintone.api.url("/k/v1/record"),
                "POST",
                { app: "7", record: { single_line_string: { value: "aaaa" } } },
                null,
                null
            );

            const result = await kintone.api(
                kintone.api.url("/k/v1/records"),
                "DELETE",
                { app: "7", ids: [post.id]},
                null,
                null
            );

            chai.assert.isOk(result);
        });

        it('kintone.api.url', function () {

            const result = kintone.api.url("/k/v1/record");

            chai.assert.equal(result, `https://${config.domain}/k/v1/record.json`);
        });

        it('kintone.api.urlForGet', function () {

            var result = kintone.api.urlForGet("/k/v1/record", { foo: 'bar', record: { key: ['val1', 'val2'] } });
            chai.assert.equal(result, `https://${config.domain}/k/v1/record.json?foo=bar&record.key[0]=val1&record.key[1]=val2`);
            result = kintone.api.urlForGet("/k/v1/record", { foo: 'bar', key: ['val1', 'val2'] });
            chai.assert.equal(result, `https://${config.domain}/k/v1/record.json?foo=bar&key[0]=val1&key[1]=val2`);
            result = kintone.api.urlForGet("/k/v1/record", { foo: 'bar', record: { key: { subKey: ['val1', 'val2'], kai: "sou" }, sam: "ple" }, adam: 'ive' });
            chai.assert.equal(result, `https://${config.domain}/k/v1/record.json?foo=bar&record.key.subKey[0]=val1&record.key.subKey[1]=val2&record.key.kai=sou&record.sam=ple&adam=ive`);
            result = kintone.api.urlForGet("/k/v1/record", { foo: 'bar', key: [{ subKey: ['val1', 'val2'] }, 'val3'] });
            chai.assert.equal(result, `https://${config.domain}/k/v1/record.json?foo=bar&key[0].subKey[0]=val1&key[0].subKey[1]=val2&key[1]=val3`);

        });

        it('kintone.getRequestToken(setRequestToken).', function () {

            kintone.setRequestToken("testSample");
            chai.assert.equal(kintone.getRequestToken(), "testSample");

        });

        it('kintone.api.getConcurrencyLimit(setConcurrencyLimit).', function (done) {

            kintone.api.setConcurrencyLimit(10, 20);
            kintone.api.getConcurrencyLimit().then(
                function (result){
                    chai.assert.equal(result.limit, 10);
                    chai.assert.equal(result.running, 20);
                    done();
                }
            )
        });

        it('kintone.proxy.', function (done) {

            const encode = function (str) {
                return btoa(unescape(encodeURIComponent(str)));
            }

            const param = { app: "7" };
            const headers = {
                "Content-Type": 'application/json',
                "X-Cybozu-Authorization": encode(`${config.username}:${config.password}`)
            };
            kintone.proxy(kintone.api.url("/k/v1/records"), "GET", headers, JSON.stringify(param), null, null).then(
                function (arg) {
                    chai.assert.isOk(200 === arg[1]);
                    done();
                },
                function (error) {
                    done(error);
                }
            );
        });

        it('kintone.proxy.upload.', function (done) {

            const encode = function (str) {
                return btoa(unescape(encodeURIComponent(str)));
            }

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
                "X-Cybozu-Authorization": encode(`${config.username}:${config.password}`)
            };
            kintone.proxy.upload(kintone.api.url("/k/v1/file"), "POST", headers, formData, null, null).then(
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

        afterEach(function () { 
            document.body.innerHTML = "";
        });

        after(async function () { 
            await kintone.postDataTrash();
        });

    });

})();
