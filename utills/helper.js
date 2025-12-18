require('dotenv').config();
//const bcrypt = require('bcryptjs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const saltRounds = 10;
const password = process.env.CRYPTO_PASSWORD;
const crypto = require('crypto'),algorithm = 'aes-256-ctr';
const iv = crypto.randomBytes(16);
const apiResponse = require('./response');
const logger = require('./logger');
const models = require('../models');
const User = models.User;

// const admin = require('firebase-admin');

//get utc time in millisecons
exports.getCurrentTime = () => {
  const d = new Date();
  const n = d.toUTCString();
  const date = new Date(n);
  const milliseconds = date.getTime(); //1440516958
  return milliseconds;
};

exports.hashPassword = (myPlaintextPassword) => {
  return bcrypt.hashSync(myPlaintextPassword, saltRounds);

};

exports.compareHashPassword = (myPlaintextPassword, hash) => {
  return bcrypt.compareSync(myPlaintextPassword, hash);
};

exports.generateToken = (data) => {
  return jwt.sign(data, process.env.JWT_SECRET_KEY, {expiresIn: process.env.JWT_TIMEOUT_DURATION});
};

exports.verifyToken = async(req, res, next) => {

  try {
    const token = req.headers['authorization'];
    if (!token) {
      //return res.send('UnAuthorized');
      return apiResponse.FailedResponseWithOutData(res,'Token is required');
    } else {
      const Token = token.split(' ')[1];
      //console.log(Token)
      jwt.verify(Token,  process.env.JWT_SECRET_KEY, async function (err, decoded) {
        if (err)  {
          return apiResponse.TokenExpiredError(res,err);
        }
        //console.log(decoded)
        User.findOne({where:{id: decoded.id}})
          .then((data) => {
            if (!data) {
              return apiResponse.UnAuthorized(res, 'User not found');
            } else {
              
              // if (data.block == 1) {
              //   return apiResponse.UnAuthorized(res,res.__('BLOCKED_BY_ADMIN'));
              // }
              req.userData = decoded;
              req.userData.account_type = data.account_type;
              next();
            }
          }).catch((e) => {
            
            return apiResponse.InternalServerError(res,e);
          });
      });
    }
  } catch (e) {
    // console.log(e);
    return apiResponse.InternalServerError(res,e);
  }
};


exports.checkLoggedIn = async(req,res,next) => {
  const token = req.headers['authorization'];
  if (!token) {
    req.userData = 0;
    return next();
  }
  const Token = token.split(' ')[1];
  jwt.verify(Token,  process.env.JWT_SECRET_KEY, async function (err, decoded) {
    if (err)  return apiResponse.InternalServerError(res,err);
    //console.log(decoded)
    User.findOne({id: decoded.id})
      .then((data) => {
        if (!data) {
          return apiResponse.NotFound(res, 'User not found');
        } else {
          req.userData = decoded;
          console.log(decoded.id);
          next();
        }
      }).catch((e) => {
        return apiResponse.InternalServerError(res,e);
      });
  });

};

exports.generateTokenLink = async(req,res,length) => {
  try {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  } catch (error) {
    return apiResponse.InternalServerError(res,error);
  }
};

exports.logResponseBody = (req, res, next) => {
  if (req.body) {
    const oldWrite = res.write,
      oldEnd = res.end;
    const chunks = [];

    res.write = function (chunk) {
      chunks.push(chunk);

      return oldWrite.apply(res, arguments);
    };

    res.end = function (chunk) {
      if (chunk) chunks.push(chunk);

      //const body = Buffer.concat(chunks).toString('utf8');
      //console.log(req.path, body);
      // logger.info(JSON.stringify(req.body,req.path));

      oldEnd.apply(res, arguments);
    
    };
  }
  

  next();
};

exports.verifyToken2 = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Missing authorization header' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res
        .status(401)
        .json({ message: 'Please Signin to access this Page' });
    }
    // code to skip authorization for registered users
    if (req.originalUrl === '/Signup') {
      return next();
    }
      
    // // Check RBAC authorization based on user role
    const role = user.account_type;
    if (
      (req.originalUrl.startsWith('/admin') && role !== 0)
    ) {
      return res
        .status(403)
        .send('You do not have permission to access this api');
    } else if (
      (req.originalUrl.startsWith('/user') && role !== 1)
    ) {
      return res
        .status(403)
        .send('You do not have permission to access this api');
    }
    
      
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};


