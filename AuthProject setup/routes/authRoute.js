const express = require('express');
const router = express.Router();


const app = express();
const AuthController = require('../controller/authController'); 
const upload = require('../utills/uploadImage')
const {verifyToken} = require('../utills/helper');
// const sendmail = require('../sendmail')({silent: true});
const { registerValidationRules, validate,loginValidationRules,forgotPasswordValidationRules,changePasswordRules } = require('../validators/authValidation');


router.post('/register',registerValidationRules(),validate,AuthController.register);
router.post('/upload',verifyToken,upload.single('image'),AuthController.upload);

   
router.post('/login',loginValidationRules(),validate,AuthController.login);
router.post('/forgot-password',forgotPasswordValidationRules(),validate, AuthController.forgotPassword);

router.get('/update-password/:tokenLink',AuthController.updatePassword);

router.post('/set-password',AuthController.setPassword);

router.post('/change-password',changePasswordRules(),validate,verifyToken, AuthController.changePassword);




router.post('/support',AuthController.support);


module.exports = router;