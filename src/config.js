const fs = require('fs');

var config = function(filePath) {
    this.FILE_PATH = filePath;
    this.data = this.load(this.FILE_PATH);
};

config.prototype.load = function(filePath = null) {
    filePath = filePath || process.env.KINTONE_CONFIG;
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};


module.exports = config;
