const fs = require('fs');

var config = function(filePath) {
    this.FILE_PATH = filePath;
    this.data = this.load(this.FILE_PATH);
};

config.prototype.load = function(filePath) {
    try {
        var content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        return content;
    } catch (err) {
        console.error(err);
        throw new Error(err);
    }
};


module.exports = config;
