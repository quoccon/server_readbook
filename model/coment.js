const db = require('./db');

const comentChema = new db.mongoose.Schema(
    {
        userId: { type: db.mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        bookId: { type: db.mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
        comment: { type: String, required: true },
    }, {
    timestamps:true,
}
);

let Coment = db.mongoose.model('Coment', comentChema);

module.exports = { Coment };