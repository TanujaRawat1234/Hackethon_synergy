 
 
 
 const express = require('express');
 const router = express.Router();
 
 
 const app = express();
 const UserController = require('../controller/userController'); 

 const { auth, role } = require("../middleware");

 // router.get("/all-users", auth, role("admin"), userController.getAllUsers);

// Patient-only
// router.get("/health-data", auth, role("patient"), userController.getPatientHealthData);