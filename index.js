const path = require('path');
const express = require('express');
const mysql = require('mysql');
const dotenv = require('dotenv');
const hbs = require('hbs');
const fs = require('fs');
const cookieParser = require('cookie-parser');

const VIEWS_DIR = path.join('views');
const PARTIALS_DIR = path.join(VIEWS_DIR, 'partials');
const STORE_DIR = path.join(__dirname, 'store');

const app = express();

dotenv.config({ path: './.env' });
const PORT = process.env.PORT || 3001;

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

const publicDir = path.join(__dirname, './public');
app.use(express.static(publicDir));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

app.set('views', VIEWS_DIR);
app.set('view engine', 'hbs');
hbs.registerPartials(PARTIALS_DIR);

db.connect((err) => {
    if(err) throw err;
    console.log("mysql connected...");
});

app.use('/', require('./routes/pages'));
app.use('/auth', require('./routes/auth'));

app.listen(PORT, () => {
    console.log("Server started");
});

