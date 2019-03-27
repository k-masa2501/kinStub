const kintone = require(__dirname + "/src/api.js");

module.exports = function (filePath) {
    return new kintone(filePath);
};