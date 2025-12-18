const nodemailer = require('nodemailer');
require('dotenv').config();


const transporter = nodemailer.createTransport({
    
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD
  }
});

exports.sendMail = async(from, to, subject, html) => {

  const mailOptions = {
    from: process.env.MAIL_USERNAME,
    to: to,
    subject: subject,
    html: html
  };
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    }
    else {
      console.log('mail has been sent:-', info.response);
    }
  });

};

