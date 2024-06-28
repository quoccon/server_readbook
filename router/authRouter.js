const express = require('express');
const router = express.Router();
const userApi = require('../api/user.api');

router.post('/api/users/register',userApi.register);
router.post('/api/users/login',userApi.login);
router.post('/api/addwithlist',userApi.addWithlist);
router.get('/api/getwithlist',userApi.getWithlist);

module.exports = router;