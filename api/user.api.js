const e = require('express');
const User = require('../model/user');
require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Book = require('../model/book');

const secretKey = process.env.SECRETKEY;

exports.register = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const existingUser = await User.User.findOne({ email: email });
        if (existingUser) {
            return res.send("Người dùng đã đăng ký");
        }

        const hashPassword = await bcrypt.hash(password, 10);
        const user = new User.User({
            username,
            email,
            password: hashPassword,
        });
        await user.save();
        return res.status(200).json(user);
    } catch (error) {
        console.log("Đã có lỗi đăng ký : " + error);
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.User.findOne({ email: email });

        if (!user) {
            return res.status(400).send("Người dùng không tồn tại");
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).send("Mật khẩu không đúng");
        }
        const userPayload = { user }
        const token = jwt.sign(userPayload, secretKey, { expiresIn: '1h' });
        console.log(user);
        req.io.emit('login',{id:user._id});
        res.status(200).json(userPayload);
    } catch (error) {
        console.log("Đã có lỗi khi đăng nhập người dùng :" + error);
    }
};


exports.addWithlist = async (req, res, next) => {
    try {
        const { userId, bookId } = req.body;
        const user = await User.User.findById(userId);
        const book = await Book.Book.findById(bookId);

        if (!user) {
            return res.status(404).send('Người dùng không tồn tại');
        }

        if (!book) {
            return res.status(404).send('Sản phẩm không tồn tại');
        }
        const index = user.Withlist.indexOf(bookId);
        if (index > -1) {
            user.Withlist.splice(index, 1);
            user.isFavourite = false;
            console.log(user.Withlist);
            res.status(200).json({ message: 'Sản phẩm đã được xóa khỏi wishlist', wishlist: user.Withlist });
        } else {
            user.Withlist.push(bookId);
            user.isFavourite = true;
            console.log(user.Withlist);
            res.status(200).json({ message: 'Sản phẩm đã được thêm vào wishlist', wishlist: user.Withlist });
        }
        await user.save();
        console.log(user);
    } catch (error) {
        console.log("Đã có lỗi khi thêm vào danh sách yêu thích :" + error);
    }
};

exports.getWithlist = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await User.User.findById(userId).populate("Withlist");
        if (!user) {
            return res.status(404).send('Người dùng không tồn tại');
        }

        console.log(user.Withlist);
        res.status(200).json(user.Withlist);
    } catch (error) {
        console.log("Đã có lỗi khi lấy danh sahcs yêu thích :" + error);
    }
};