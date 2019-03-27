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

    describe('test api.js.', function () {

        this.timeout(15000);

        var restApi = null;
        var config = null;
        var kintone = null;
        const testData = {};

        before(async function () { 
            kintone = new (require('../src/api.js'))("./test/.setting.json");
            config = new (require('../src/config.js'))("./test/.setting.json");
            config.data.domain = process.env.KINTONE_DOMAIN;
            config.data.username = process.env.KINTONE_USERNAME;
            config.data.password = process.env.KINTONE_PASSWORD;
            if (process.env.HTTP_PROXY) {config.data.proxy = process.env.HTTP_PROXY;}
            restApi = new (require('../src/restApi.js'))(config);
            kintone.debugObjSet(config, restApi);
            testData.get = await kintone.api(
                `https://${config.data.domain}//k/v1/records.json`,
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

            chai.assert.equal(result, `https://${config.data.domain}/k/v1/record.json`);
        });

        it('kintone.api.url by guest space.', function () {

            config.data.guest_space_id  = 1;
            kintone.debugObjSet(config, restApi);

            const result = kintone.api.url("/k/v1/record", true);
            chai.assert.equal(result, `https://${config.data.domain}/k/guest/1/v1/record.json`);

            delete config.data.guest_space_id;
            kintone.debugObjSet(config, restApi);
        });

        it('kintone.api.urlForGet', function () {

            var result = kintone.api.urlForGet("/k/v1/record", { foo: 'bar', record: { key: ['val1', 'val2'] } });
            chai.assert.equal(result, `https://${config.data.domain}/k/v1/record.json?foo=bar&record.key[0]=val1&record.key[1]=val2`);
            result = kintone.api.urlForGet("/k/v1/record", { foo: 'bar', key: ['val1', 'val2'] });
            chai.assert.equal(result, `https://${config.data.domain}/k/v1/record.json?foo=bar&key[0]=val1&key[1]=val2`);
            result = kintone.api.urlForGet("/k/v1/record", { foo: 'bar', record: { key: { subKey: ['val1', 'val2'], kai: "sou" }, sam: "ple" }, adam: 'ive' });
            chai.assert.equal(result, `https://${config.data.domain}/k/v1/record.json?foo=bar&record.key.subKey[0]=val1&record.key.subKey[1]=val2&record.key.kai=sou&record.sam=ple&adam=ive`);
            result = kintone.api.urlForGet("/k/v1/record", { foo: 'bar', key: [{ subKey: ['val1', 'val2'] }, 'val3'] });
            chai.assert.equal(result, `https://${config.data.domain}/k/v1/record.json?foo=bar&key[0].subKey[0]=val1&key[0].subKey[1]=val2&key[1]=val3`);

        });

        it('kintone.api.urlForGet by guest space.', function () {

            config.data.guest_space_id = 1;
            kintone.debugObjSet(config, restApi);

            var result = kintone.api.urlForGet("/k/v1/record", { foo: 'bar', record: { key: ['val1', 'val2'] } });
            chai.assert.equal(result, `https://${config.data.domain}/k/guest/1/v1/record.json?foo=bar&record.key[0]=val1&record.key[1]=val2`);

            delete config.data.guest_space_id;
            kintone.debugObjSet(config, restApi)

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
                "X-Cybozu-Authorization": encode(`${config.data.username}:${config.data.password}`)
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
                "X-Cybozu-Authorization": encode(`${config.data.username}:${config.data.password}`)
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

        it('kintone.app.record.getId(setId).', function () {
            kintone.app.record.setId(1);
            chai.assert.equal(kintone.app.record.getId(), 1);
        });

        it('kintone.mobile.app.record.getId(setId).', function () {
            kintone.app.record.setId(1);
            kintone.mobile.app.record.setId(2);
            chai.assert.equal(kintone.app.record.getId(), 1);
            chai.assert.equal(kintone.mobile.app.record.getId(), 2);
        });

        it('kintone.app.record.get(set).', function () {
            kintone.app.record.set({ record: { sample: { value: "val1", name:"sample"}}});
            const result = kintone.app.record.get();
            chai.assert.equal(result.record.sample.value, "val1");
        });

        it('kintone.mobile.app.record.get(set).', function () {

            kintone.app.record.set({ record: { sample: { value: "val1", name: "sample" } } });
            const result1 = kintone.app.record.get();
            kintone.mobile.app.record.set({ record: { sample: { value: "val2", name: "sample2" } } });
            const result2 = kintone.mobile.app.record.get();
            chai.assert.equal(result1.record.sample.value, "val1");
            chai.assert.equal(result2.record.sample.value, "val2");
        });

        it('kintone.app.getQueryCondition(setQueryCondition).', function () {
            const expect = 'record_id <= "5" and creator in ("Administrator")';
            kintone.app.setQueryCondition(expect);
            const result = kintone.app.getQueryCondition();
            chai.assert.equal(result, expect);
        });

        it('kintone.mobile.app.getQueryCondition(setQueryCondition).', function () {
            const expect1 = 'record_id <= "5" and creator in ("Administrator")';
            kintone.app.setQueryCondition(expect1);
            const result1 = kintone.app.getQueryCondition();

            const expect2 = 'record_id <= "2" and creator in ("example")';
            kintone.mobile.app.setQueryCondition(expect2);
            const result2 = kintone.mobile.app.getQueryCondition();

            chai.assert.equal(result1, expect1);
            chai.assert.equal(result2, expect2);
        });

        it('kintone.app.getQuery(setQuery).', function () {
            const expect1 = 'record_id <= "5" and creator in ("Administrator")';
            kintone.app.setQuery(expect1);
            const result1 = kintone.app.getQuery();

            chai.assert.equal(result1, expect1);
        });

        it('kintone.mobile.app.getQuery(setQuery).', function () {
            const expect1 = 'record_id <= "5" and creator in ("Administrator")';
            kintone.app.setQuery(expect1);
            const result1 = kintone.app.getQuery();

            const expect2 = 'record_id <= "2" and creator in ("sample")';
            kintone.mobile.app.setQuery(expect2);
            const result2 = kintone.mobile.app.getQuery();

            chai.assert.equal(result1, expect1);
            chai.assert.equal(result2, expect2);
        });
        
        it('kintone.app.getId(setId).', function () {
            kintone.app.setId(5);
            chai.assert.equal(kintone.app.getId(), 5);
        });

        it('kintone.mobile.app.getId(setId).', function () {
            kintone.app.setId(10);
            kintone.mobile.app.setId(15);
            chai.assert.equal(kintone.app.getId(), 10);
            chai.assert.equal(kintone.mobile.app.getId(), 15);
        });

        it('kintone.app.getLookupTargetAppId(setLookupTargetAppId).', function () {
            kintone.app.setLookupTargetAppId("reference", 10);
            chai.assert.equal(kintone.app.getLookupTargetAppId("reference"), 10);
        });
        
        it('kintone.mobile.app.getLookupTargetAppId(setLookupTargetAppId).', function () {
            kintone.app.setLookupTargetAppId("reference", 10);
            kintone.mobile.app.setLookupTargetAppId("mobileReference", 20);
            chai.assert.equal(kintone.app.getLookupTargetAppId("reference"), 10);
            chai.assert.equal(kintone.mobile.app.getLookupTargetAppId("mobileReference"), 20);
        });

        it('kintone.app.getRelatedRecordsTargetAppId(setRelatedRecordsTargetAppId).', function () {
            kintone.app.setRelatedRecordsTargetAppId("reference", 10);
            chai.assert.equal(kintone.app.getRelatedRecordsTargetAppId("reference"), 10);
        });

        it('kintone.mobile.app.getRelatedRecordsTargetAppId(setRelatedRecordsTargetAppId).', function () {
            kintone.app.setRelatedRecordsTargetAppId("reference", 15);
            kintone.mobile.app.setRelatedRecordsTargetAppId("mobileReference", 20);
            chai.assert.equal(kintone.app.getRelatedRecordsTargetAppId("reference"), 15);
            chai.assert.equal(kintone.mobile.app.getRelatedRecordsTargetAppId("mobileReference"), 20);
        });

        it('kintone.getLoginUser return config default.', function () {
            const result = kintone.getLoginUser();
            chai.assert.equal(result.id, 1);
            chai.assert.equal(result.code, "sample");
            chai.assert.equal(result.email, "sample@sample.com");
        });

        it('kintone.getLoginUser(setLoginUser).', function () {
            kintone.setLoginUser({
                "id": "10",
                "code": "sample2",
                "name": "sample2",
                "email": "sample2@sample2.com",
                "url": "http://sample2.com",
                "employeeNumber": "",
                "phone": "0426-12-3456",
                "mobilePhone": "09012345678",
                "extensionNumber": "",
                "timezone": "Asia/Tokyo",
                "isGuest": "false",
                "language": "ja"
            });
            const result = kintone.getLoginUser();
            chai.assert.equal(result.id, 10);
            chai.assert.equal(result.code, "sample2");
            chai.assert.equal(result.email, "sample2@sample2.com");
        });

        it('kintone.getUiVersion(setUiVersion).', function () {
            kintone.setUiVersion(1);
            chai.assert.equal(kintone.getUiVersion(), 1);
        });

        it('kintone.app.record.setFieldShown element isShown true.', function () {
            document.body.innerHTML = "<div id='sample' style='display:none'></div>";
            kintone.app.record.setFieldShown('sample', true);
            const element = document.getElementById('sample');
            chai.assert.equal(element.style.display, "block");
        });

        it('kintone.app.record.setFieldShown element isShown false.', function () {
            document.body.innerHTML = "<div id='sample' style='display:block'></div>";
            kintone.app.record.setFieldShown('sample', false);
            const element = document.getElementById('sample');
            chai.assert.equal(element.style.display, "none");
        });

        it('kintone.mobile.app.record.setFieldShown element isShown true.', function () {
            document.body.innerHTML = "<div id='sample' style='display:none'></div>";
            kintone.mobile.app.record.setFieldShown('sample', true);
            const element = document.getElementById('sample');
            chai.assert.equal(element.style.display, "block");
        });

        it('kintone.mobile.app.record.setFieldShown element isShown false.', function () {
            document.body.innerHTML = "<div id='sample' style='display:block'></div>";
            kintone.mobile.app.record.setFieldShown('sample', false);
            const element = document.getElementById('sample');
            chai.assert.equal(element.style.display, "none");
        });

        it('kintone.app.record.setGroupFieldOpen element isShown true.', function () {
            document.body.innerHTML = "<div id='sample' style='display:none'></div>";
            kintone.app.record.setGroupFieldOpen('sample', true);
            const element = document.getElementById('sample');
            chai.assert.equal(element.style.display, "block");
        });

        it('kintone.app.record.setGroupFieldOpen element isShown false.', function () {
            document.body.innerHTML = "<div id='sample' style='display:block'></div>";
            kintone.app.record.setGroupFieldOpen('sample', false);
            const element = document.getElementById('sample');
            chai.assert.equal(element.style.display, "none");
        });

        it('kintone.mobile.app.record.setGroupFieldOpen element isShown true.', function () {
            document.body.innerHTML = "<div id='sample' style='display:none'></div>";
            kintone.mobile.app.record.setGroupFieldOpen('sample', true);
            const element = document.getElementById('sample');
            chai.assert.equal(element.style.display, "block");
        });

        it('kintone.app.record.getFieldElement.', function () {
            document.body.innerHTML = "<div id='sample' style='display:block'></div>";
            const element = kintone.app.record.getFieldElement('sample');
            chai.assert.equal(toString.call(element).slice(8, -1).toLowerCase(), "htmldivelement");
        });
        
        it('kintone.app.record.getHeaderMenuSpaceElement(setHeaderMenuSpaceElement).', function () {
            kintone.app.record.setHeaderMenuSpaceElement('parent', "<div id='sample' style='display:block'></div>");
            const element = kintone.app.record.getHeaderMenuSpaceElement();
            chai.assert.equal(toString.call(element).slice(8, -1).toLowerCase(), "htmldivelement");
        });

        it('kintone.app.record.getSpaceElement.', function () {
            document.body.innerHTML = "<div id='sample' style='display:block'></div>";
            const element = kintone.app.record.getSpaceElement('sample');
            chai.assert.equal(toString.call(element).slice(8, -1).toLowerCase(), "htmldivelement");
        });

        it('kintone.mobile.app.record.getSpaceElement.', function () {
            document.body.innerHTML = "<div id='sample' style='display:block'></div>";
            const element = kintone.mobile.app.record.getSpaceElement('sample');
            chai.assert.equal(toString.call(element).slice(8, -1).toLowerCase(), "htmldivelement");
        });

        it('kintone.app.getFieldElements.', function () {
            document.body.innerHTML = "<div id='parent'><div class='sample'></div><div class='sample'></div></div>";
            const element = kintone.app.getFieldElements('sample');
            chai.assert.equal(toString.call(element).slice(8, -1).toLowerCase(), "array");
            chai.assert.equal(element.length, 2);
        });

        it('kintone.app.getHeaderMenuSpaceElement(setHeaderMenuSpaceElement).', function () {
            const htmlStr = "<div></div>";
            kintone.app.setHeaderMenuSpaceElement("HeaderMenuSpaceElement", htmlStr);
            const element = kintone.app.getHeaderMenuSpaceElement();
            chai.assert.equal(toString.call(element).slice(8, -1).toLowerCase(), "htmldivelement");
        });

        it('kintone.app.getHeaderSpaceElement(setHeaderSpaceElement).', function () {
            const htmlStr = "<div></div>";
            kintone.app.setHeaderSpaceElement("HeaderMenuSpaceElement", htmlStr);
            const element = kintone.app.getHeaderSpaceElement();
            chai.assert.equal(toString.call(element).slice(8, -1).toLowerCase(), "htmldivelement");
        });

        it('kintone.mobile.app.getHeaderSpaceElement(setHeaderSpaceElement).', function () {
            const htmlStr = "<div></div>";
            kintone.mobile.app.setHeaderSpaceElement("HeaderMenuSpaceElement", htmlStr);
            const element = kintone.mobile.app.getHeaderSpaceElement();
            chai.assert.equal(toString.call(element).slice(8, -1).toLowerCase(), "htmldivelement");
        });

        it('kintone.plugin.app.getConfig(setConfig).', function () {
            const config = { "key1": "value1", "key2": "value2" };
            kintone.plugin.app.setConfig(config, function(){});
            const result = kintone.plugin.app.getConfig(1);
            chai.assert.equal(result.key1, "value1");
        });

        it('kintone.plugin.app.getProxyConfig(setProxyConfig).', function () {
            const headers = {
                "Content-Type": "application/json",
                "Authorization": "1234567890abcdefg"
            };
            const data = {
                "key1": "secretValue"
            };
            kintone.plugin.app.setProxyConfig(kintone.api.url("/k/v1/sample"), "GET", headers, data, function(){});
            const result = kintone.plugin.app.getProxyConfig(kintone.api.url("/k/v1/sample"), "GET");
            chai.assert.equal(result.headers["Content-Type"], "application/json");
            chai.assert.equal(result.data["key1"], "secretValue");
        });


        it('kintone.plugin.app.proxy.', function (done) {
            const encode = function (str) {
                return btoa(unescape(encodeURIComponent(str)));
            }

            const param = { app: "7" };
            const headers = {
                "Content-Type": 'application/json',
                "X-Cybozu-Authorization": encode(`${config.data.username}:${config.data.password}`)
            };
            kintone.plugin.app.proxy(1, kintone.api.url("/k/v1/records"), "GET", headers, JSON.stringify(param), null, null).then(
                function (arg) {
                    chai.assert.isOk(200 === arg[1]);
                    done();
                },
                function (error) {
                    done(error);
                }
            );
        });

        it('kintone.plugin.app.proxy set config.', function (done) {
            const encode = function (str) {
                return btoa(unescape(encodeURIComponent(str)));
            }

            var headers = {
                "X-Cybozu-Authorization": encode(`${config.data.username}:${config.data.password}`)
            };
            var data = {
                app: "7"
            };

            kintone.plugin.app.setProxyConfig(kintone.api.url("/k/v1/record"), "GET", headers, data, function () { });

            data = { id: testData.get.ids[0] };
            headers = {
                "Content-Type": 'application/json'
            };

            kintone.plugin.app.proxy(1, kintone.api.url("/k/v1/record"), "GET", headers, JSON.stringify(data), null, null).then(
                function (arg) {
                    chai.assert.isOk(200 === arg[1]);
                    done();
                },
                function (error) {
                    done(error);
                }
            );
        });

        it('kintone.plugin.app.proxy.upload.', function (done) {

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
                "X-Cybozu-Authorization": encode(`${config.data.username}:${config.data.password}`)
            };
            kintone.plugin.app.proxy.upload(1, kintone.api.url("/k/v1/file"), "POST", headers, formData, null, null).then(
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
