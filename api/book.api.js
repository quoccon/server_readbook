const Book = require("../model/book");
const fs = require('fs');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const Cat = require('../model/category');
const Coment = require('../model/coment');
// const {io} = require('../index');
// console.log("io ==" +io);

exports.AddCat = async (req, res) => {
    try {
        const { nameCat } = req.body;
        const cat = await Cat.Cat.find();

        if (cat) {
            console.log("Thể loại đã tồn tại");
            return res.status(400).send("Thể loại đã tồn tại")
        }

        const newCat = new Cat.Cat({
            nameCat,
        });
        await newCat.save();
        
        return res.status(200).json(newCat);
    } catch (error) {
        console.log("Có lỗi khi thêm thể loại :" + error);
    }
};

exports.getCat = async (req, res) => {
    try {
        const cat = await Cat.Cat.find();
        if (!cat) {
            return res.status(400).send("Danh sách thể loại trống");
        }
        return res.status(200).json(cat);
    } catch (error) {
        console.log("Có lỗi khi lấy danh sách thể loại :" + error);
    }
};

exports.AddBook = async (req, res, next) => {
    try {
        const { title, author, description, image, genre } = req.body;
        const contentFile = req.file.path;

        const newBook = new Book.Book({
            title,
            author,
            description,
            content: contentFile,
            image,
            genre,
        });

        await newBook.save();

        req.io.emit('newbook', JSON.stringify(newBook)); // Gửi sự kiện newbook tới client

        res.status(200).json({ message: 'Thêm sách mới thành công', book: newBook });
    } catch (error) {
        console.log("Đã có lỗi khi thêm sách mới : " + error);
        res.status(500).json({ error: 'Đã có lỗi khi thêm sách mới' });
    }
}

exports.getBookByCat = async (req, res) => {
    try {
        const { catId } = req.body;
        const book = await Book.Book.find({ genre: catId });
        if (!book) {
            return res.status(404).send("Sách theo thể loại trống");
        }

        return res.status(200).json(book);
    } catch (error) {
        console.log("Đã có lỗi : " + error);
    }
};

exports.getBook = async (req, res, next) => {
    try {
        const bookId = req.params.id;
        const book = await Book.Book.findById(bookId);

        if (!book) {
            return res.status(404).json({ error: "Sách không tồn tại" });
        }

        if (!book.content) {
            return res.status(400).json({ error: "Không tìm thấy nội dung sách" });
        }

        const filePath = book.content;
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: "Không tìm thấy tệp PDF" });
        }

        const fileExtention = filePath.split('.').pop().toLowerCase();
        let contentText = '';

        if (fileExtention === 'pdf') {
            const dataBuffer = fs.readFileSync(filePath);
            const pdfData = await pdf(dataBuffer);
            contentText = pdfData.text;
        } else if (fileExtension === 'docx') {
            const dataBuffer = fs.readFileSync(filePath);
            const result = await mammoth.extractRawText({ buffer: dataBuffer });
            contentText = result.value;
        } else {
            return res.status(400).json({ error: "Định dạng tệp không được hỗ trợ" });
        }

        const bookWithContent = {
            id: book.id,
            title: book.title,
            author: book.author,
            description: book.description,
            content: pdfData.text,
            image: book.image,
            genre: book.genre,
            createdAt: book.createdAt,
        };
        console.log(bookWithContent);
        res.status(200).json(bookWithContent);
    } catch (error) {
        res.status(500).json({ error: "Đã có lỗi khi lấy thông tin sách: " + error.message });
    }
};
exports.getAllBooks = async (req, res, next) => {
    try {
        const books = await Book.Book.find();

        const booksWithContent = await Promise.all(books.map(async book => {
            if (!book.content || !fs.existsSync(book.content)) {
                return {
                    title: book.title,
                    author: book.author,
                    description: book.description,
                    content: "Nội dung không khả dụng",
                    image: book.image,
                    genre: book.genre
                };
            }

            const filePath = book.content;
            const fileExtension = filePath.split('.').pop().toLowerCase();
            let contentText = '';

            if (fileExtension === 'pdf') {
                const dataBuffer = fs.readFileSync(filePath);
                const pdfData = await pdf(dataBuffer);
                contentText = pdfData.text;
            } else if (fileExtension === 'docx') {
                const dataBuffer = fs.readFileSync(filePath);
                const result = await mammoth.extractRawText({ buffer: dataBuffer });
                contentText = result.value;
            } else {
                contentText = "Định dạng tệp không được hỗ trợ";
            }

            return {
                id: book.id,
                title: book.title,
                author: book.author,
                description: book.description,
                content: contentText,
                image: book.image,
                genre: book.genre
            };
        }));
        res.status(200).json(booksWithContent);
    } catch (error) {
        res.status(500).json({ error: "Đã có lỗi khi lấy danh sách sách: " + error.message });
    }
};

exports.SearchBook = async (req, res) => {
    try {
        const { query } = req.body;
        if (!query) {
            return res.status(404).send('Nhập thông tin tìm kiếm');
        }

        const book = await Book.Book.find({
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { author: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
            ]
        });

        if(book.length < 0){
            return res.status(404).send('Không tìm thấy sách');
        }
        
        const booksWithContent = await Promise.all(book.map(async book => {
            if (!book.content || !fs.existsSync(book.content)) {
                return {
                    title: book.title,
                    author: book.author,
                    description: book.description,
                    content: "Nội dung không khả dụng",
                    image: book.image,
                    genre: book.genre
                };
            }

            const filePath = book.content;
            const fileExtension = filePath.split('.').pop().toLowerCase();
            let contentText = '';

            if (fileExtension === 'pdf') {
                const dataBuffer = fs.readFileSync(filePath);
                const pdfData = await pdf(dataBuffer);
                contentText = pdfData.text;
            } else if (fileExtension === 'docx') {
                const dataBuffer = fs.readFileSync(filePath);
                const result = await mammoth.extractRawText({ buffer: dataBuffer });
                contentText = result.value;
            } else {
                contentText = "Định dạng tệp không được hỗ trợ";
            }

            return {
                id: book.id,
                title: book.title,
                author: book.author,
                description: book.description,
                content: contentText,
                image: book.image,
                genre: book.genre
            };
        }));
        console.log(booksWithContent);
        return res.status(200).json(booksWithContent);
    } catch (error) {
        console.log("Lỗi tìm kiếm :" +error);
    }
};

//Coment
exports.AddComent = async (req, res) => {
    try {
        const { userId, bookId, comment } = req.body;
        if (!userId || !bookId || !comment) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const newComent = new Coment.Coment({
            userId: userId,
            bookId: bookId,
            comment: comment,
        });

        await newComent.save();
        console.log(newComent);
        return res.status(200).json(newComent);
    } catch (error) {
        console.log("Đã có lỗi :" + error);
    }
};

exports.getComet = async (req, res) => {
    try {
        const { bookId } = req.body;

        if (!bookId) {
            return res.status(400).send("Sách không tồn tại");
        }
        const comments = await Coment.Coment.find({ bookId: bookId }).populate('userId', 'username');

        console.log(comments);
        return res.status(200).json(comments);
    } catch (error) {
        console.log("Đã có lỗi :" + error);
    }
};

