(function () {
    "use strict";

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
            config.data.proxy = process.env.HTTP_PROXY;
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

        it('kintone.api POST.', async function () {
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

        it('kintone.api.url', async function () {

            const result = kintone.api.url("/k/v1/record");

            chai.assert.equal(result, `https://${config.data.domain}/k/v1/record.json`);
        });

        it('kintone.api.url by guest space.', async function () {

            config.data.guest_space_id  = 1;
            kintone.debugObjSet(config, restApi);

            const result = kintone.api.url("/k/v1/record", true);
            chai.assert.equal(result, `https://${config.data.domain}/k/guest/1/v1/record.json`);

            delete config.data.guest_space_id;
            kintone.debugObjSet(config, restApi);
        });

        it('kintone.api.urlForGet', async function () {

            const result = kintone.api.urlForGet("/k/v1/record", { foo: 'bar', record: { key: ['val1', 'val2'] } });
            console.log(result);
            //chai.assert.equal(result, `https://${config.data.domain}/k/v1/record.json?foo=bar&record.key[0]=val1&record.key[1]=val2`);
        });

        afterEach(function () { });

        after(async function () { 
            await kintone.postDataTrash();
        });

    });

})();
