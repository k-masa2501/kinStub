const kintone = require(__dirname + "/src/api.js");

module.exports = function (arg) {
    return new kintone(arg);
};