import bcrypt from 'module/bcrypt/bcrypt.js';
import nodemailer from '/modules/nodemailer';
import { google } from '/modules/googleapis';
const client_id = '932057013761-aeqsfk123mcubg2c0uqkbmf2erdenati.apps.googleusercontent.com';
const client_secret = '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';
const redirect_uri = 'https://developers.google.com/oauthplayground';
const refresh_token = '1//0428btZlveNWeCgYIARAAGAQSNwF-L9IraAPzKifylbVxaMweCz5E19bTuPS9ahZh2dc4_JIojcFN6Lj_4wrSYEIqRQXKCRG62UY';
const oauth2client = new google.auth.OAuth2(client_id, client_secret, redirect_uri);
oauth2client.setCredentials({ refresh_token: refresh_token });
    function pass_data() {
    const access_token = oauth2client.getAccessToken();
        const transporter = nodemailer.createTransport({
        service: 'gmail',
            auth: {
            type: 'oauth2',
            user: 'muzotron.noreply@gmail.com',
            clientId: client_id,
            clientSecret: client_secret,
            refreshToken: refresh_token,
            accessToken: access_token
            }
        });
    const code = Math.round(1000000000 + 8999999999 * Math.random()).toString();
        const mail_options = {
        from: 'muzotron.noreply@gmail.com',
        to: document.getElementById("email_input_id").value,
        subject: 'Muzotron verification code',
        text: 'Code to activate your muzotron account: ' + code
        }
    sessionStorage.setItem("verification_code", bcrypt.hashSync(code), 10);
    sessionStorage.setItem("email", document.getElementById("email_input_id").value);   
    transporter.sendMail(mail_options);
    sessionStorage.setItem("password", bcrypt.hashSync(document.getElementById("password_input_id").value), 15);
    }