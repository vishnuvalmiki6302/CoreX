const multer = require("multer");

const storage = multer.memoryStorage();

function checkFileType(file, cb) {
    if (file.mimetype.startsWith("image/")) {
        return cb(null, true);
    }
    cb(new Error("Images only!"));
}

const upload = multer({
    storage,
    fileFilter(req, file, cb) {
        checkFileType(file, cb);
    },
});

module.exports = upload;