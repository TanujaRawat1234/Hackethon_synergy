const { body, oneOf, validationResult,check } = require('express-validator');
const {query,params} = require('express-validator');
const apiResponse = require('../utills/response');


const registerValidationRules = () => {
  return [
    body('password').notEmpty().withMessage('password is required.'),
    body('email').notEmpty().withMessage('email is required.'),
    body('first_name').notEmpty().withMessage('first_name is required.'),
    body('last_name').notEmpty().withMessage('last_name is required.'),
  ];
};

const updateProfileValidationRules = () => {
  return [
    body('display_name').exists().notEmpty().trim().withMessage('display_name is required.'),
    body('user_handle').notEmpty().withMessage('User handle is required.'),
    // body('image').notEmpty().withMessage('Image is required.'),
    body('step').notEmpty().withMessage('step is required.'),

  
  ];
};

const loginValidationRules = () => {
  return [
    body('email').exists().notEmpty().trim().withMessage('Email is required.'),
    body('password').exists().notEmpty().trim().withMessage('Password is required.'),
  ];
};

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
 
  return apiResponse.ValidationErrorWithData(res, 'Please Enter Required Field', errors.array());

  
};

const uploadSongValidationRules = () => {
  return [
    // check('album_name').notEmpty().withMessage('Album Name is required'),
    // check('cover').isEmail().withMessage('Cover is required'),
    check('genre_id').isEmail().withMessage('Genre is required'),
  
    check('duration').isEmail().withMessage('Duration is required'),
    check('title').isEmail().withMessage('Title is required'),
    check('description').isEmail().withMessage('Description is required'),
    check('audio').isEmail().withMessage('Audio is required'),
  ];
};


const forgotPasswordValidationRules = () => {
  return [
    body('email').exists().notEmpty().trim().withMessage('email is required.'),
 
      
  ];
};


const changePasswordRules = () => {
  return [
    body('old_password').exists().notEmpty().trim().withMessage('old_password is required.'),
    
    body('new_password').exists().notEmpty().trim().withMessage('new_password is required.'),
  
      
  ];
};


const pushNotificationValidationRules = () => {
  return [
    body('fcm_token').exists().notEmpty().trim().withMessage('fcm_token is required.'),
 
      
  ];
};


module.exports = {
  registerValidationRules,
  loginValidationRules,
  validate,
  forgotPasswordValidationRules,
  changePasswordRules,
  pushNotificationValidationRules,
  updateProfileValidationRules,
  uploadSongValidationRules

};
