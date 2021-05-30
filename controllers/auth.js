const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const STORE_DIR = path.join(__dirname, './../store');

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if(!email || !password) {
            return res.status(400).render('login', {
                message: 'Please provide email and password'
            });
        }

        db.query("SELECT * FROM users WHERE email = ?", [email], async (error, result) => {
            if(!result || !(await bcrypt.compare(password, result[0].password ))) {
                res.status(401).render('login', {
                    message: 'Incorrect email or password'
                });

            } else {
                const user_id = result[0].user_id;
                const token = jwt.sign({ user_id }, process.env.JWR_SECRET, {
                    expiresIn: process.env.JWT_EXPIRES_IN
                });

                const cookieOptions = {
                    expires: new Date( Date.now() + (process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000)),
                    httpOnly: true
                }


                res.cookie('jwt', token, cookieOptions);

                try {
                    if (!fs.existsSync(STORE_DIR + "/" + result[0].username)){
                        fs.mkdirSync(STORE_DIR + "/" + result[0].username)
                    }
                } catch (err) {
                    console.error(err)
                }

                res.status(200).redirect("/");
            }
        });
    } catch (error) {
        console.log(error);
    }
}
exports.register = (req, res) => {
    const { name, email, password, passwordConfirm } = req.body;
    db.query('SELECT email FROM users WHERE email = ?', [email], async (error, results)  => {
        if(error) {
            console.log(error);
        }

        if(results.length > 0) {
            return res.render('register', {
                message: 'That email already in use'
            })
        } else if(password !== passwordConfirm) {
            return res.render('register', {
                message: 'Passwords do not match'
            });
        }

        let hashedPassword = await bcrypt.hash(password, 8);
        console.log(hashedPassword);

        db.query("INSERT INTO users SET ?",
            {username: name, email: email, password: hashedPassword}, (error, result)=>{
            if(error) {
                console.log(error);
            } else {
                return res.render('register', {
                    message: "User registered"
                });
            }
        })
    });
}
