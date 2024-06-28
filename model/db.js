const mongoose = require('mongoose');

mongoose.connect("mongodb://127.0.0.1/server_book")
    .then(() => {
        console.log("Đã kết nối tới mongo");
    }).catch((e) => {
        console.log(`Kết nối tới mongoose thất bại ${e}`);
    });

module.exports = { mongoose }