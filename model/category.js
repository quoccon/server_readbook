const db = require('./db');

const CatChema = new db.mongoose.Schema(
    {
        nameCat: { type: String, required: true },
    }, {
    collection: 'cat',
}
);

let Cat = db.mongoose.model('Cat', CatChema);
module.exports = { Cat };