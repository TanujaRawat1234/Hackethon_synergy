/* eslint-disable max-lines */
/* eslint-disable max-len */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const models = require('../models');
const User = models.User;
const LinkExpiredModel = models.Link_Expired;
const apiResponse = require('../utills/response');
const Utill = require('../utills/helper');
const Mailer = require('../utills/mailer');
const {Op} = require('sequelize');
const sequelize = require('sequelize');


const SupportModel = models.Support;
// const LinkExpiredModel = models.LinkExpired;

exports.register = async (req, res) => {
  try {

    const {email, password,first_name, last_name} = req.body;
    const useremail = await User.findOne({ where: { email: req.body.email } });
   
    if (useremail) {
      return apiResponse.FailedResponseWithData(res,'Email Already Exist');
    }
  
    const insertData = {
   
      email,
      password: Utill.hashPassword(password),
      first_name,
      last_name
     
    };
  
    console.log(insertData);
    let user = await User.create(insertData);
  
    user = user.toJSON();
  
    const token = Utill.generateToken({ id: user.id });
    user.token = token;
  
  
    return apiResponse.SignUpSuccessFull(res,user);
  
  } catch (e) {
    console.log(e);
    return apiResponse.InternalServerError(res, e);
  
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;


    let getUsers = await User.findOne({ where: { email: email } });
   
    if (!getUsers) {
      return apiResponse.FailedResponseWithOutData(res,'Worng email or password');
    }
 
    const isMatch = Utill.compareHashPassword(password, getUsers.password);
    if (!isMatch) {
      return apiResponse.FailedResponseWithOutData(res, 'Worng email or password');
    }
    const step = getUsers.step;
    getUsers = getUsers.toJSON();

    const token = Utill.generateToken({ id: getUsers.id });

    getUsers.token = token;


    console.log(getUsers.token);

    return apiResponse.LoginSuccessFull(res,getUsers);


  } catch (e) {
    return apiResponse.InternalServerError(res, e);
  }
};

exports.upload = async (req, res) => {
    console.log(req.file, req.file.location);
    res.json({ message: 'Successfully uploaded ', imageUrl: req.file.location });
  };


exports.forgotPassword = async (req, res) => {
  //console.log('yhn')
  try {

    const tokenLink = makeid(20);
    console.log(tokenLink);
    const email = req.body.email;
    const getUsers = await User.findOne({ where: { email: email } });
    if (!getUsers) {
      return apiResponse.FailedResponseWithOutData(res,'Email does not exist');
    }
    const user_id = getUsers.id;
    const name = getUsers.display_name;
    // console.log(getUsers.first_name);
    console.log(user_id);
    const findId = await LinkExpiredModel.findOne({ where: { user_id: getUsers.id } });
    //const id = findId.user_id;
    // console.log(findId);
    // console.log(findId.user_id);
    if (findId) {
      console.log('sgdfhh');
      const destroyPreviousData = await LinkExpiredModel.destroy({
        where: {
          user_id: findId.user_id
        }
      });
    }
    //const user = await LinkExpiredModel.findOne({ userId: getUsers.id });

    // if (!user) {
    const insertData = {
      user_id: user_id,
      tokenLink: tokenLink

    };

    const data = await LinkExpiredModel.create(insertData);
    //}


    const html =
    // '<p> Hii ' + ` , Please click the link and <a href="https://www.rentsolute.enactstage.com/stage/api/v1/update-password/${ tokenLink }">Set password</a>`; //-->http://43.205.51.243
`<!doctype html><html lang="en"><head><meta charset="utf-8"><link rel="stylesheet" href="fonts/stylesheet.css"><link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.2.0/css/all.css" integrity="sha384-hWVjflwFxL6sNzntih27bfxkr27PmbbK/iSvJ+a4+0owXq79v+lsFkW54bOGbiDQ" crossorigin="anonymous"><title>Forgot Password</title><style>body{font-family:Poppins,sans-serif!important}.verify-main-top{max-width:1140px;margin:auto;width:100%}.verify{background:rgba(28,103,104,.1);height:100%;padding:40px 0}.verify-logo{text-align:center;margin-bottom:20px}.verify-logo img{width:30%}.verify-main{background:#fff;padding:30px;border-radius:30px;font-weight:600}.verify-main h2{font-size:25px;margin-bottom:40px;margin-top:0}.verify-main h3,h4,h5,h6{font-size:18px;color:#353535;font-weight:400;margin-bottom:28px;line-height:40px}.verify-main p{font-size:18px;color:#353535;font-weight:400;margin-bottom:28px;margin-top:70px;line-height:50px}.verify-btn{text-align:center}a.verify-btn{font-size:16px;color:#fff!important;background:#05aecd;font-weight:400;border-radius:50px;padding:18px 55px;display:inline-block;text-decoration:none}.verify-bottom{text-align:center}.verify-bottom ul{display:inline-block;margin:40px 0}.verify-bottom li{display:inline-block;margin:0 15px}.verify-bottom p{font-size:20px;color:#232323;font-weight:400;padding:0 60px}.bottom-text p{font-size:18px;color:#232323;font-weight:400;margin:50px 0 0}.bottom-text h5{background:0 0;padding:0;color:#0066cb!important;margin:5px 0 0}.verify-main h6{margin-top:30px}</style></head><body><main class="verify"><div class="verify-main-top"><div class="container"><div class="verify-logo"><a href=""><img src="https://m4m-bucket.s3.us-east-2.amazonaws.com/images/1696595902719-IMG_1925.png" alt="logo"></a></div><div class="verify-main"><h3>Hi ${getUsers.first_name},</h3><h5>We have received a request to reset your password. Please click the button below to proceed.</h5><a href="${process.env.BASE_URL}/api/v1/update-password/${tokenLink}" class="verify-btn">Reset Password</a><div class="bottom-text"><p>Alternatively, you can copy and paste the below link into your web browser.</p><h5>${process.env.BASE_URL}/api/v1/update-password/${tokenLink}</h5></div><h6>If you did not request to reset your password, please ignore this email or contact us at<br>music4music01@gmail.com</h6><p>Sincerely,<br>The Music4Music Team</p><div class="verify-btn"></div></div><div class="verify-bottom"></div></div></div></main></body></html>`;
    await Mailer.sendMail(
      process.env.EMAIL,
      req.body.email,
      'Reset Password Link.',
      html
    );


    return apiResponse.SuccessResponseWithOutData(res,'A password reset link has been sent to your registered email address.');

  } catch (error) {
    console.log(error);
    return apiResponse.InternalServerError(res, error);
  }
};

exports.updatePassword = async (req, res) => {
  try {
    console.log(req.params);
    console.log('params', req.params.tokenLink);
    const tokenLink = req.params.tokenLink;
    // const ID = token.id;
    // console.log('ID ______',token.id);
    //    const id = req.params.id

    // const verify = jwt.verify(token, process.env.JWT_SECRET_KEY, async function (err, decoded) {
    //   if (err) {
    //     console.log(err);
    //     return apiResponse.UnAuthorized(res,'UnAuthorised user');
    //   }
    //   else {


    const userId = await LinkExpiredModel.findOne({ where: { tokenLink: tokenLink } });
    //console.log(userToken);
    if (!userId) {
      return res.render('linkExpires', { tokenLink: tokenLink });
    }
    res.set('Content-Security-Policy', 'default-src *; style-src \'self\' http://* \'unsafe-inline\'; script-src \'self\' http://* \'unsafe-inline\' \'unsafe-eval\'');

    res.render('setPassword', { tokenLink: tokenLink });

    //   }


    //   //console.log(decoded)

    // });


  } catch (error) {
    console.log(error);

    return apiResponse.InternalServerError(res, error);

  }

};

exports.setPassword = async (req, res) => {

  try {

    const newPassword = req.body.newPassword;
    const confirmPassword = req.body.confirmPassword;

    console.log(req.body);
    const tokenLink = req.body.tokenLink;
    console.log('----------------------------', tokenLink);

    const hashPassword = Utill.hashPassword(newPassword, 10);

    const getUserId = await LinkExpiredModel.findOne({ where: { tokenLink: tokenLink } });
    console.log('---------', getUserId);
    console.log('----------------------', getUserId.user_id);
    const user_id = getUserId.user_id;


    const update = await User.update({
      password: hashPassword,

    },
    {
      where: {
        id: user_id

      },
      individualHooks: true,


    }
    );
    if (update[0] == 1) {


      await LinkExpiredModel.destroy({
        where: {
          tokenLink: req.body.tokenLink
        }
      });

      //return apiResponse.PasswordUpdatedSucessfully(res, 'Updated Sucessfully');
      return res.render('passwordUpdatedSuccessfully', { tokenLink: req.body.tokenLink },);
    }
    else {
      return apiResponse.FailedResponseWithOutData(res, res.__('NOT_UPDATED'));
    }

  } catch (error) {
    console.log(error);
    return apiResponse.InternalServerError(res, error);
  }
};

exports.changePassword = async (req, res) => {
  try {
    const new_password = req.body.new_password;
    const old_password = req.body.old_password;

    const id = req.userData.id;
    const getUser = await User.findOne({ where: { id: id } });
    console.log(getUser.password);
    const isMatch = Utill.compareHashPassword(old_password, getUser.password);
    if (!isMatch) {
      return apiResponse.FailedResponseWithOutData(res,'Password does not match with old password');
    }
    if (old_password == new_password) {
      return apiResponse.FailedResponseWithOutData(res,'Same password as old password');
    }
    const hashPassword = Utill.hashPassword(new_password);
    const changePassword = await User.update({
      password: hashPassword,
    },
    {
      where: {
        id: req.userData.id
      },
      individualHooks: true,
    }

    );
    if (changePassword[0] == 1) {
      return apiResponse.SuccessResponseWithNoData(res, 'Password updated sucessfully');
    }
    else {
      return apiResponse.FailedResponseWithOutData(res,'Not updated');
    }


  } catch (error) {
    console.log(error);
    return apiResponse.InternalServerError(res, error);
  }
};


function makeid(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}


exports.support = async (req, res) => {
  try {
    // const user_id = req.userData.id;
    const { name, message, email } = req.body;
    console.log(req.body);

    const insertData = {
      name,
      message,
      email
    };
    const saveSupport = await SupportModel.create(insertData);
    const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><link rel="stylesheet" href="fonts/stylesheet.css"><link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.2.0/css/all.css" integrity="sha384-hWVjflwFxL6sNzntih27bfxkr27PmbbK/iSvJ+a4+0owXq79v+lsFkW54bOGbiDQ" crossorigin="anonymous"><title>Forgot Password</title><style>body{font-family:Poppins,sans-serif!important}.verify-main-top{max-width:1140px;margin:auto;width:100%}.verify{background:rgba(28,103,104,.1);height:100%;padding:40px 0}.verify-logo{text-align:center;margin-bottom:20px}.verify-logo img{width:30%}.verify-main{background:#fff;padding:30px;border-radius:30px;font-weight:600}.verify-main h2{font-size:25px;margin-bottom:40px;margin-top:0}.verify-main h3,h4,h5,h6{font-size:18px;color:#353535;font-weight:400;margin-bottom:28px;line-height:40px}.verify-main p{font-size:18px;color:#353535;font-weight:400;margin-bottom:28px;margin-top:70px;line-height:50px}.verify-btn{text-align:center}a.verify-btn{font-size:16px;color:#fff!important;background:#05aecd;font-weight:400;border-radius:50px;padding:18px 55px;display:inline-block;text-decoration:none}.verify-bottom{text-align:center}.verify-bottom ul{display:inline-block;margin:40px 0}.verify-bottom li{display:inline-block;margin:0 15px}.verify-bottom p{font-size:20px;color:#232323;font-weight:400;padding:0 60px}.bottom-text p{font-size:18px;color:#232323;font-weight:400;margin:50px 0 0}.bottom-text h5{background:0 0;padding:0;color:#0066cb!important;margin:5px 0 0}.verify-main h6{margin-top:30px}</style></head><body><main class="verify"><div class="verify-main-top"><div class="container"><div class="verify-logo"><a href=""><img src="https://m4m-bucket.s3.us-east-2.amazonaws.com/images/1696595902719-IMG_1925.png" alt="logo"></a></div><div class="verify-main"><h3>Hi,</h3><h5>New request received</h5><div class="bottom-text"><p>Name:${name}<br>Email:${email}<br>Message:${message}</p></div><p>Regards,<br>Team Music 4 Music</p><div class="verify-btn"></div></div><div class="verify-bottom"></div></div></div></main></body></html>`;

    await Mailer.sendMail(
      
      process.env.EMAIL,
      process.env.SUPPORT_EMAIL,
      'New request received',
      html
    );

    return apiResponse.SuccessResponseWithNoData(res,'Your message has been sent');

  } catch (error) {
    console.log(error);
    return apiResponse.InternalServerError(res, error);
  }
};

