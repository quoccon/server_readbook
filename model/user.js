const db = require('./db');

const userChema = new db.mongoose.Schema(
    {
        username: { type: String, required: false },
        email: { type: String, required: false },
        password: { type: String, required: false },
        Withlist: [{ type: db.mongoose.Schema.Types.ObjectId, ref: 'Book',
             isFavourite: { type: Boolean, default: false, required: false }, }],
    },
    {
        collection: 'users',
    }
);

let User = db.mongoose.model('User', userChema);
module.exports = { User }