const fs = require('fs');

const config = function(filePath) {
    this.FILE_PATH = filePath;
    return load(this.FILE_PATH);
};

const load = function(filePath = null) {
    filePath = filePath || process.env.KINTONE_CONFIG;
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};


module.exports = function(filePath){
    return config(filePath);
};
