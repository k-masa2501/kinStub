const kintone = require(__dirname + "src/api.js");

module.exports.kintone = function(filePath){
    return  new kintone(filePath);
};