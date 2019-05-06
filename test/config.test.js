(function () {
    "use strict";

    function sleep(time) {

        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve();
            }, time);
        });
    }

    describe('test config.js.', function () {

        this.timeout(15000);

        before(function () { });

        beforeEach(function () { });


        it('config load success.', function () {
            const config = (require('../src/config.js'))("./test/.setting.json");
            chai.assert.equal(config.domain, "sample.cybozu.com");
        });

        it('config load success case not config path specified.', function () {
            process.env.KINTONE_CONFIG = "./test/.setting.json"; 
            const config = (require('../src/config.js'))();
            chai.assert.equal(config.domain, "sample.cybozu.com");
        });

        it('config load error.', function () {
            try{
                const config = (require('../src/config.js'))("./test/.not_exist.json");
                chai.assert.isNull(config);
            }catch(e){
                chai.assert.isOk(e);
            }
        });

        afterEach(function () { });

        after(function () { });

    });

})();
