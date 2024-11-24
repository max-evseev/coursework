const { program } = require('commander');
const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const mysql2 = require('mysql2');
const bcrypt = require('bcrypt');
const nodemailer = require("nodemailer");
const { google } = require('googleapis');
const upload = multer();
program
.option('-p, --password <db server password>')
program.parse();
const options = program.opts();
app.use(express.urlencoded({ extended: true }));
    const pool = mysql2.createPool({
    host: "localhost",
    user: "root",
    password: options.password,
    database: "muzotron"
    });
    try {
    app.listen(808);
    }
    catch {
    console.log("something went wrong");
    }
    app.get('/', (req, res) => {
    res.status(200).sendFile(path.join(__dirname, 'front_page.html'));
    });
    app.get('/login', (req, res) => {
    res.status(200).sendFile(path.join(__dirname, 'login_page.html'));
    });
    app.post('/login_proceed', upload.none(), (req, res) => {
        if (Object.keys(req.body).length === 0) {
        res.status(403).redirect('/');
        }
        else {
        console.log(req.body);
            pool.query('select email, password from users where email = "' + req.body.email_input + '"', (err, result, fields) => {
                if (err) {
                res.status(503).redirect('/');
                }
                if (result.length === 0) {
                res.status(200).sendFile(path.join(__dirname, 'create_user_page.html'));
                }
                for (const entry of result) {
                    if (entry.password === req.body.password_input) {
                    res.status(200).send('placeholder success authent');
                    }
                    else {
                    res.status(403).redirect('/login');
                    }
                }
            });
        }
    });
    app.post('/create_account', upload.single('pfp_upload'), (req, res) => {
        console.log(req.file);
    console.log(req.body);
        if (Object.keys(req.body).length === 0) {
        res.status(403).redirect('/');
        }
        else {
            if (bcrypt.hashSync(req.body.code_input, 10) === req.body.code_value) {
                if (req.file === undefined) {
                req.body.pfp_file_name = 'null';
                }
                else {
                fs.writeFileSync(path.join(__dirname + "/pfp", req.body.pfp_file_name + '.png'), req.file.buffer);
                req.body.pfp_file_name = '"' + req.body.pfp_file_name + '"';
                }
                pool.query('insert into users (email, password, user_link_id, user_display_name, pfp_file_name, creation_date) values("' + req.body.email_input + '", "' + req.body.password_input + '", "' + req.body.user_link + '", "' + req.body.display_name_input + '", ' + req.body.pfp_file_name + ', current_date())', (err, result, fields) => {
                    if (err) {
                    res.status(503).redirect('/');
                    }
                });
            res.status(201).redirect('/');
            }
            else {
            res.status(304).redirect('/login');
            }   
        }
    });
    app.get('/unlogin', (req, res) => {
    res.status(200).sendFile(path.join(__dirname, 'front_page.html'));
    });
    app.get('/song/:song_id', (req, res) => {
        pool.query('select * from songs where song_link_id = "' + req.params['song_id'] + '"', (err, result, fields) => {
            if (err) {
            res.status(503).redirect('/');
            }
            if (result.length === 0) {
            res.redirect(404, '/');
            }
            else {
                for (const entry of result) {
                res.status(200).sendFile(path.join(__dirname + '/music', entry.song_file_name + '.mp3'));
                }
            }
        });
    });
    app.get('/user/:user_id', (req, res) => {
        pool.query('select user_display_name, pfp_file_name, creation_date from users where user_link_id = "' + req.params['song_id'] + '"', (err, result, fields) => {
            if (err) {
            res.status(503).redirect('/');
            }
            if (result.length === 0) {
            res.redirect(404, '/');
            }
            else {
                for (const entry of result) {
                res.status(200).send('placeholder song page for user ' + entry.user_display_name);
                }
            }
        });
    });
    app.get('/upload_song', (req, res) => {
    res.status(200).sendFile(path.join(__dirname, 'upload_song_page.html'));
    });
    app.post('/upload_proceed', upload.fields([{name: 'song_file_upload', maxCount: 1}, {name: 'song_cover_upload', maxCount: 1}]), (req, res) => {
        if (Object.keys(req.body).length === 0) {
        res.status(403).redirect('/');
        }
        if (req.body.song_file_name == "") {
        res.status(403).redirect('/');
        }
        if (req.files.song_cover_upload === undefined) {
        req.body.cover_art_name = 'null';
        }
        else {
            for (const file of req.files.song_cover_upload) {
            fs.writeFileSync(path.join(__dirname + "/cover", req.body.cover_art_name + '.png'), file.buffer);
            }
        req.body.cover_art_name = '"' + req.body.cover_art_name + '"';
        }
        if (req.body.desc_input === "") {
        req.body.desc_input = 'null';
        }
        else {
        req.body.desc_input = '"' + req.body.desc_input + '"';
        }
        for (const file of req.files.song_file_upload) {
        fs.writeFileSync(path.join(__dirname + "/music", req.body.song_file_name + '.mp3'), file.buffer);
        }
        pool.query('insert into songs (song_link_id, author_link_id, display_name, upload_date, song_file_name, song_description, cover_art_file_name) values ("' + req.body.song_link + '", "' + "test" + '", "' + req.body.song_name_input + '", current_date(), "' + req.body.song_file_name + '", ' + req.body.desc_input + ', ' + req.body.cover_art_name + ')', (err, result, fields) => {
            if (err) {
            res.status(503).redirect('/');
            }
        });
    res.status(201).redirect('/');
    });
    app.get('/update_song/:song_id', (req, res) => {
    res.status(200).sendFile(path.join(__dirname, 'update_song_page.html'));
    });
    app.post('/update_proceed/:song_id', upload.fields([{name: 'song_file_upload', maxCount: 1}, {name: 'song_cover_upload', maxCount: 1}]), (req, res) => {
        if (req.files.song_cover_upload === undefined && req.files.song_file_upload === undefined && req.body.desc_input === "" && req.body.song_name_input === "") {
        res.status(403).redirect('/update_song/:song_id');
        }
        pool.query('select * from songs where song_link_id = "' + req.params['song_id'] + '"', (err, result, fields) => {
            if (err) {
            res.status(503).redirect('/');
            }
            if (result.length === 0) {
            res.redirect(404, '/');
            }
            else {
            var sql_query = 'update songs set ';
            var changes = 0;
                if (req.files.song_cover_upload != undefined) {
                sql_query += 'cover_art_file_name=' + '"' + req.body.cover_art_name + '"';
                changes += 1;
                    for (const file of req.files.song_cover_upload) {
                    fs.writeFileSync(path.join(__dirname + "/cover", req.body.cover_art_name + '.png'), file.buffer);
                    }
                }
                if (req.files.song_file_upload != undefined) {
                    if (changes > 0) {
                    sql_query += ', '
                    }
                sql_query += 'song_file_name=' + '"' + req.body.song_file_name + '"';
                changes += 1;
                    for (const file of req.files.song_file_upload) {
                    fs.writeFileSync(path.join(__dirname + "/music", req.body.song_file_name + '.mp3'), file.buffer);
                    }
                }
                if (req.body.desc_input != "") {
                    if (changes > 0) {
                    sql_query += ', '
                    }
                sql_query += 'song_description=' + '"' + req.body.desc_input + '"';
                changes += 1;
                }
                if (req.body.song_name_input != "") {
                    if (changes > 0) {
                    sql_query += ', '
                    }
                sql_query += 'display_name=' + '"' + req.body.song_name_input + '"';
                changes += 1;
                }
                pool.query(sql_query + 'where song_link_id="' + req.params['song_id'] + '"', (err, result, fields) => {
                    if (err) {
                    res.status(503).redirect('/');
                    }
                });
                for (const entry of result) {
                fs.unlinkSync(path.join(__dirname + "/music", entry.song_file_name + '.mp3'));
                fs.unlinkSync(path.join(__dirname + "/cover", entry.cover_art_file_name + '.png'));
                }
            res.status(201).redirect('/');
            }
        });
    });
    app.post('/song_delete', upload.fields([{name: 'song_file_upload', maxCount: 1}, {name: 'song_cover_upload', maxCount: 1}]), (req, res) => {
        pool.query('select * from songs where song_link_id = "' + req.params['song_id'] + '"', (err, result, fields) => {
            pool.query('delete from songs where song_link_id="' + req.body.song_link + '"', (err, result, fields) => {
                if (err) {
                res.status(503).redirect('/');
                }
            });
            for (const entry of result) {
            fs.unlinkSync(path.join(__dirname + "/music", entry.song_file_name + '.mp3'));
            fs.unlinkSync(path.join(__dirname + "/cover", entry.cover_art_file_name + '.png'));
            }
        res.status(200).redirect('/');
        });
    });
    app.get('/songs', (req, res) => {
    res.status(200).send('placeholder page song search');
    });
    app.get('/users', (req, res) => {
    res.status(200).send('placeholder page user search');
    });
    app.get('*', (req, res) => {
    res.status(400).redirect('/');
    });
    app.post('*', (req, res) => {
    res.status(405).redirect('/');
    });
    app.put('*', (req, res) => {
    res.status(405).redirect('/');
    });
    app.patch('*', (req, res) => {
    res.status(405).redirect('/');
    });
    app.delete('*', (req, res) => {
    res.status(405).redirect('/');
    });