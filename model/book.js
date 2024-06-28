const { Schema } = require('mongoose');
const db = require('./db');

const bookSchema = new db.mongoose.Schema(
    {
        title: { type: String, required: false },
        author: { type: String, required: false },
        description: { type: String, required: false },
        content: { type: String, required: false },
        image: { type: String, required: false },
        genre: { type: Schema.Types.ObjectId,ref:'Cat', required: false },
       
    },
    {
        
        timestamps:true,
    }
);

let Book = db.mongoose.model("Book", bookSchema);
module.exports = { Book };