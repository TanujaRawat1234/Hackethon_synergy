require('dotenv').config();
const CONSTANTS = require('./constants');
//const { S3Client } = require('@aws-sdk/client-s3');
const multer = require('multer');
const multerS3 = require('multer-s3');
const aws = require('aws-sdk');
const fs = require('fs');
aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region:process.env.AWS_REGION, 
  //  endpoint: 'http://dynamodb-local:8000',

});
const s3 = new aws.S3();

const path = '';

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['application/pdf'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    const newFileName = `${Date.now()}-${file.originalname}`;
    const path = CONSTANTS.PDF_PATH + newFileName;
    console.log('------->', path);
    cb(null, path);
  } else {
    cb(new Error('Invalid file format.'));
  }
};
  
// const upload = multer({
//   storage: multerS3({
//     s3: s3,
//     bucket: `${process.env.BUCKET_NAME }`,
//     // contentType:multerS3.AUTO_CONTENT_TYPE ,
//     contentType:function(req, file, cb) {
//       if (file.mimetype == 'application/pdf') {
//         cb(null, 'application/pdf');
//       } else
//       {
//         cb(null, file.mimetype);
//       }
//     },
//     ACL: 'public-read' ,
//     //contentDisposition:'inline',
//     metadata: function (req, file, cb) {

//       console.log('file',file);
//       cb(null, { fieldName: file.fieldname });
//     },
//     key: function (req, file, cb) {
//       const newFileName = `${Date.now()  }-${  file.originalname}`;
//       const fullPath = CONSTANTS.IMAGE_PATH + newFileName;
//       cb(null,fullPath);
//     }
//     //key:fileFilter,
//   }),
//   fileFilter: fileFilter

// });

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: `${process.env.BUCKET_NAME }`,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    ACL: 'public-read' ,
   
    metadata: function (req, file, cb) {
      console.log('file',file);
      cb(null, { fieldName: file.fieldname });
    },
    
    key: function (req, file, cb) {
      // console.log(req.body.type);
      const newFileName = `${Date.now()  }-${  file.originalname}`;
      // eslint-disable-next-line max-len
      const fullPath = file.mimetype == 'audio/basic' || 
      file.mimetype == 'auido/L24' || file.mimetype == 'audio/mid' 
      || file.mimetype == 'audio/mpeg' || file.mimetype == '	audio/mp4' ||
       file.mimetype == 'audio/x-aiff' || file.mimetype == 'audio/x-mpegurl' ||
        file.mimetype == 'audio/vnd.rn-realaudio' || file.mimetype == 'audio/ogg' || 
        file.mimetype == 'audio/vorbis' || file.mimetype == 'audio/vnd.wav' || file.mimetype.startsWith('video/') ? CONSTANTS.AUDIO_PATH + newFileName : CONSTANTS.IMAGE_PATH + newFileName;
      cb(null,fullPath);
    }
    //key:fileFilter, 
  }),
  limits:{fieldSize: 25 * 1024 * 1024}
});


module.exports = upload;

