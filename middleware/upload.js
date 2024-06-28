const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../upload');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req,file,cb){
        cb(null,path.join(__dirname, '../upload'));
    },
    filename : function (req,file,cb){
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({storage:storage});
module.exports = upload;