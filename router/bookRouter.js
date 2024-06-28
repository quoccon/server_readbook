const express = require('express');
const router = express.Router();
const bookApi = require('../api/book.api');
const upload = require('../middleware/upload');

router.post('/api/addbook',upload.single('contentFile'),bookApi.AddBook);
router.get('/api/getbook/:id',bookApi.getBook);
router.get('/api/getall',bookApi.getAllBooks);
router.get('/api/getbookbycat',bookApi.getBookByCat);

router.post('/api/seachbook',bookApi.SearchBook);

router.post('/api/addcat',bookApi.AddCat);
router.get('/api/getcat',bookApi.getCat);

//Coment
router.post('/api/addcoment',bookApi.AddComent);
router.get('/api/getcoment',bookApi.getComet);


module.exports = router;