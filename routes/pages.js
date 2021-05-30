const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const STORE_DIR = path.join(__dirname, './../store');

router.get('/', (req, res) => {
    const fileArr = [];

    fs.readdir(STORE_DIR, (err, files) => {
        files.forEach(file => {
            fileArr.push(file);
        });
    });

    if(req.cookies.jwt) {
        res.render('pages/index', {file: fileArr});
    } else {
        res.render('pages/login');
    }
});

router.get('/register', (req, res) => {
    res.render('pages/register');
});

router.get('/login', (req, res) => {
    res.render('pages/login');
});

module.exports = router;
