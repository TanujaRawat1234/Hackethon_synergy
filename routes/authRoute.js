const express = require('express');
const router = express.Router();


const app = express();
const AuthController = require('../controller/authController'); 
// const sendmail = require('../sendmail')({silent: true});
const { registerValidationRules, validate,loginValidationRules,forgotPasswordValidationRules,changePasswordRules } = require('../validators/authValidation');

router.get('/test', (req, res) => {
  res.json({ message: 'Auth loginnnn route is working!' });
})
router.post('/signup',AuthController.signup);
// router.post('/upload',verifyToken,upload.single('image'),AuthController.upload);

   
router.post('/login',loginValidationRules(),validate,AuthController.login);

// router.post('/forgot-password',forgotPasswordValidationRules(),validate, AuthController.forgotPassword);
router.post('/forgot-password', AuthController.forgotPassword);

router.post('/verify-otp', AuthController.verifyOtp);
router.post('/reset-password', AuthController.resetPassword);



router.get('/update-password/:tokenLink',AuthController.updatePassword);

router.post('/set-password',AuthController.setPassword);

// router.post('/change-password',changePasswordRules(),validate,verifyToken, AuthController.changePassword);




router.post('/support',AuthController.support);


module.exports = router;