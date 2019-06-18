(function () {
    "use strict";

    function sleep(time) {

        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve();
            }, time);
        });
    }

    describe('Check the increase or change of api.', function () {

        this.timeout(15000);
        var restApi = null;
        var config = null;

        before(async function () {
            config = (require('../src/config.js'))("./test/.setting.json");
            config.domain = process.env.KINTONE_DOMAIN;
            config.username = process.env.KINTONE_USERNAME;
            config.password = process.env.KINTONE_PASSWORD;
            config.proxy = process.env.HTTP_PROXY;
            restApi = new (require('../src/restApi.js'))(config);
         });

        beforeEach(function () { });

         const checkList = [
             ["kintone.events.on", true, true],
             ["kintone.events.off", true, true],
             ["kintone.api", true, true],
             ["kintone.api.url", true, true],
             ["kintone.api.urlForGet", true, true],
             ["kintone.getRequestToken", true, true],
             ["kintone.api.getConcurrencyLimit", true, true],
             ["kintone.proxy", true, true],
             ["kintone.proxy.upload", true, true],
             ["kintone.app.record.getId", true, true],
             ["kintone.app.record.get", true, true],
             ["kintone.app.record.set", true, true],
             ["kintone.app.getQueryCondition", true, true],
             ["kintone.app.getQuery", true, true],
             ["kintone.app.getId", true, true],
             ["kintone.app.getLookupTargetAppId", true, true],
             ["kintone.app.getRelatedRecordsTargetAppId", true, true],
             ["kintone.getLoginUser", true, true],
             ["kintone.getUiVersion", true, true],
             ["kintone.app.record.setFieldShown", true, true],
             ["kintone.app.record.setGroupFieldOpen", true, true],
             ["kintone.app.record.getFieldElement", true, false],
             ["kintone.app.record.getHeaderMenuSpaceElement", true, false],
             ["kintone.app.record.getSpaceElement", true, true],
             ["kintone.app.getFieldElements", true, false],
             ["kintone.app.getHeaderMenuSpaceElement", true, false],
             ["kintone.app.getHeaderSpaceElement", true, false],
             ["kintone.mobile.app.getHeaderSpaceElement", false, true],
             ["kintone.portal.getContentSpaceElement", true, true],
             ["kintone.plugin.app.getConfig", true, true],
             ["kintone.plugin.app.setConfig", true, false],
             ["kintone.plugin.app.proxy", true, true],
             ["kintone.plugin.app.getProxyConfig", true, false],
             ["kintone.plugin.app.setProxyConfig", true, false],
             ["kintone.plugin.app.proxy.upload", true, true]
         ];

        it('check.', async function () {
            const url = `https://developer.cybozu.io/hc/ja/articles/360000361686-kintone-JavaScript-API%E4%B8%80%E8%A6%A7`;
            const data = "";
            const headers = {
                "Content-Type": "text/html"
            };

            const result = await restApi.proxy(url, "GET", headers, data, null, null);
            document.body.innerHTML = result[0];
            const element = document.getElementsByClassName("ListTable");
            var listCounter = 0;

            for (var i1 = 1, len1 = element.length; i1 < len1; i1++) {
                for (var i2 = 0, len2 = element[i1].tBodies.length; i2 < len2; i2++) {
                    for (var i3 = 0, len3 = element[i1].tBodies[i2].rows.length; i3 < len3; i3++) {
                        var anchorElements = element[i1].tBodies[i2].rows[i3].getElementsByTagName("a");
                        var imgElements = element[i1].tBodies[i2].rows[i3].getElementsByTagName("img");
                        var innerHTML = element[i1].tBodies[i2].rows[i3].innerHTML;
                        if (0 < anchorElements.length){
                            console.log(innerHTML);
                            chai.assert.equal(anchorElements[0].innerHTML, checkList[listCounter][0]);

                            var regex1 = RegExp(/.*PC_icon.png.*/);
                            chai.assert.equal(regex1.test(innerHTML), checkList[listCounter][1]);

                            var regex2 = RegExp(/.*Mobile_icon.png.*/);
                            chai.assert.equal(regex2.test(innerHTML), checkList[listCounter][2]);

                            listCounter+=1;
                        }
                    }
                }
            }
        });

        afterEach(function () { });

        after(async function () {
            document.body.innerHTML = "";
        });

    });

})();
