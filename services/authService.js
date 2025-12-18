const { User } = require('../models');
// const Utill = require('../utils');
const apiResponse = require('../utills/response');
const Utill = require('../utills/helper');
const Mailer = require('../utills/mailer');
const moment = require('moment');
const ApiError = require('../utills/ApiError');
const userFcmService = require('./userFcmService');




exports.signup = async (data) => {
  const { first_name, last_name, email, mobile, gender, password ,fcm_token} = data;
  // Check if user already exists
  const existing = await User.findOne({ where: { email } });
  if (existing) throw new ApiError(404, 'Email already exist');

  //  Hash password
  const passwordHash = await Utill.hashPassword(password);

  // Create user
  let user = await User.create({
    first_name,
    last_name,
    email,
    mobile,
    gender,
    password: passwordHash
  });

  //Generate token
  const token = await Utill.generateToken({ id: user.id });

  // Prepare response object
  user = user.toJSON();
  user.token = token;

  // if (fcm_token) {
  //   await userFcmService.saveToken(user.id, fcm_token);
  // }

  return user;
};


exports.login = async (email, password,fcm_token) => {
  // Find user
  let user = await User.findOne({ where: { email } });
  if (!user) throw new ApiError(404, 'Email is incorrect');

  //Compare password
  const isMatch = await Utill.compareHashPassword(password, user.password);
  if (!user) throw new ApiError(404, 'Password is incorrect');

  //Convert to plain object
  user = user.toJSON();

  //Generate JWT
  const token = await Utill.generateToken({ id: user.id });
  user.token = token;

  if (fcm_token) {
    await userFcmService.saveToken(user.id, fcm_token);
  }

  return user;
};



exports.sendOtp = async (email) => {
  try {
    if (!email)  throw new ApiError(400, 'Email is required');

    const user = await User.findOne({ where: { email } });
    if (!user)  throw new ApiError(404, 'User not found ');

    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const otpExpires = moment().add(10, 'minutes').valueOf();

    await user.update({ otp, otp_expires: otpExpires });

    // Build HTML email
    const html = `
      <!doctype html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <title>OTP Verification</title>
        <style>
          body { font-family: Poppins, sans-serif !important; background: #f3f8f9; margin: 0; padding: 0; }
          .verify { background: rgba(28,103,104,.1); padding: 40px 0; }
          .verify-main-top { max-width: 600px; margin: auto; width: 100%; }
          .verify-main { background: #fff; padding: 30px; border-radius: 20px; font-weight: 500; text-align: center; }
          .verify-logo img { width: 150px; margin-bottom: 20px; }
          h3 { font-size: 22px; color: #333; margin-bottom: 10px; }
          h4 { font-size: 18px; color: #555; margin-top: 20px; }
          .otp-box { 
            display: inline-block; 
            background: #05aecd; 
            color: #fff; 
            font-size: 22px; 
            font-weight: 600; 
            letter-spacing: 3px; 
            padding: 12px 30px; 
            border-radius: 10px; 
            margin: 20px 0; 
          }
          p { font-size: 16px; color: #555; line-height: 1.6; }
          .bottom-text { margin-top: 40px; color: #999; font-size: 14px; }
        </style>
      </head>
      <body>
        <main class="verify">
          <div class="verify-main-top">
            <div class="verify-main">
              <div class="verify-logo">
                <img src="" alt="logo">
              </div>
              <h3>Hi ${user.first_name || 'User'},</h3>
              <p>We received a request to verify your account. Please use the OTP below to complete your verification:</p>
              <div class="otp-box">${otp}</div>
              <p>This OTP will expire in <b>10 minutes</b>. Do not share it with anyone.</p>
              <div class="bottom-text">
                <p>If you didn’t request this OTP, please ignore this email or contact our support team.</p>
                <p>– The GLP Team</p>
              </div>
            </div>
          </div>
        </main>
      </body>
      </html>
    `;

    // Send email
    await Mailer.sendMail(
      process.env.MAIL_USERNAME,
      email,
      'Your OTP Code - GLP',
      html
    );

    return { success: true, message: 'OTP sent successfully' };
  } catch (error) {
    console.error(error);
    throw error;
  }
};



exports.verifyOtp = async (email, otp) => {
  try {
    if (!email || !otp) throw new ApiError(404, 'Email and Otp is required')

    const user = await User.findOne({ where: { email } });
    if (!user) throw new ApiError(404, 'User not found ');

    // Master OTP (can move to .env for security)
    const MASTER_OTP = process.env.MASTER_OTP || '1111';

    // Validate OTP
    if (otp !== MASTER_OTP) {
      if (user.otp !== otp) {
        return { success: false, message: 'Invalid OTP' };
      }

      // Check expiry
      if (Number(user.otp_expires) < Date.now()) {
        return { success: false, message: 'OTP expired' };
      }
    }

    // Clear OTP after success
    await user.update({ otp: null, otp_expires: null });

    return { success: true, message: 'OTP verified successfully' };
  } catch (error) {
    console.error('verifyOtp service error:', error);
    throw error;
  }
};


exports.resetPassword = async (email, password) => {
  try {
    if (!email || !password) throw new ApiError(40, 'User not found ');

    const user = await User.findOne({ where: { email } });
    if (!user) throw new ApiError(404, 'User not found ');

    const passwordHash = await Utill.hashPassword(password);
    await user.update({ password: passwordHash, otp: null, otp_expires: null, updatedAt: moment().valueOf() });

    return { success: true, message: 'Password updated successfully' };
  } catch (error) {
    console.error('resetPassword service error:', error);
    throw error;
  }
};
