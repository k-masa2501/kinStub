const kintone = require(__dirname + "src/api.js");
const testData = require(__dirname + "src/testData.js");

module.exports.kintone = function(filePath){
    return  new kintone(filePath);
};

module.exports.testData = function(filePath){
    return  new testData(filePath);
};