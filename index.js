const express = require('express');
const bodyParser = require('body-parser');
const bookRouter = require('./router/bookRouter');
const authRouter = require('./router/authRouter');
const path = require('path');
const http = require('http');

const app = express();
const server = http.createServer(app);
const socketIo = require('socket.io');
const io = socketIo(server);

const PORT = 1111;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to make `io` accessible to routers
app.use((req, res, next) => {
    req.io = io;
    next();
});

app.use('/auth', authRouter);
app.use('/book', bookRouter);

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

server.listen(PORT, () => {
    console.log("Server listening on port: " + PORT);
});
