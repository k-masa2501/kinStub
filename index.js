const kintone = require(__dirname + "/api.js");
const testData = require(__dirname + "/testData.js");

module.exports.kintone = function(filePath){
    return  new kintone(filePath);
};

module.exports.testData = function(filePath){
    return  new testData(filePath);
};