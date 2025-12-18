

module.exports = {


 
    SuccessResponseWithData: (res, msg, data) => {
      return res.status(200).json({
        statusCode: 200,
        message: msg,
        data: data,
            
      });
    },
    SuccessResponseWithDataCount: (res, msg, data,totalCount) => {
      return res.status(200).json({
        statusCode: 200,
        message: msg,
        data: data,
        totalCount:totalCount
            
      });
    },
    SuccessResponseCkeckEmail: (res,step,exist) => {
      return res.status(200).json({
        statusCode: 200,
        step: step,
        exist :exist
          
      });
    },
    FailedResponseForEmailWithData: (res, msg,step,data) => {
      return res.status(400).json({
        statusCode: 400,
        message: msg,
        step:step,
        exist: data
          
      });
    },
  
    SuccessResponseWithOutData: (res,step ,msg) => {
      return res.status(200).json({
        statusCode: 200,
        step:step,
        message: msg,
          
      });
    },
  
    SuccessResponseWithNoData: (res,msg) => {
      return res.status(200).json({
        statusCode: 200,
        
        message: msg,
          
      });
    },
    SuccessResponseData: (res,step,data) => {
      return res.status(200).json({
        statusCode: 200,
        step:step,
        data: data,
          
      });
    },
    SuccessContentData: (res,message, data) => {
      return res.status(200).json({
        statusCode: 200,
        message: message,
        data: data,
      });
    },
         
       
    FailedResponseWithData: (res, msg,data) => {
      return res.status(400).json({
        statusCode: 400,
        message: msg,
       
        error: data
          
      });
    },
          
    FailedResponseWithOutData: (res, msg) => {
      return res.status(400).json({
        statusCode: 400,
        message: msg,
          
      });
    },
    InternalServerError: (res, e) => {
      return res.status(500).json({
        statusCode: 500,
        message: 'Internal server error',
        error: e.message,
      });
    },
    SomethingWentWrong: (res, e) => {
      return res.status(400).json({
        statusCode: 400,
        message: 'Something Went Wrong',
        error: e.message
      });
    },
    SessionTimeOut: (res, e) => {
      return res.status(400).json({
        statusCode: 400,
        message: 'SessionTimeOut Login Again',
        error: e.message
      });
    },
    UnAuthorized: (res, msg) => {
      return res.status(401).json({
        statusCode: 401,
        message: msg,
      });
          
    },
    NotFound: (res, msg) => {
      return res.status(404).json({
        statusCode: 404,
        message: msg,
      });
    },
    DuplicateEmail: (res,message) => {
      return res.status(400).json({
        statusCode: 400,
        message: 'Email already exist',
             
      });
    },
    ValidationError: (res, err) => {
      return res.status(422).json({
        statusCode: 422,
        message: 'validation error',
        error:err
      });
    },
    LoginSuccessFull: (res,data) => {
      return res.status(200).json({
        statusCode: 200,
        message: 'Login Successfully',
        data: data,
      });
    },
    SignUpSuccessFull: (res,data) => {
      return res.status(200).json({
        statusCode: 200,
        message: 'Signup Successfully',
        data: data
           
      });
    },
    SignUpFailed: (res,message) => {
      return res.status(400).json({
        statusCode: 400,
        message: message,
      });
    },
    LoginFailed: (res, message) => {
      return res.status(400).json({
        statusCode: 400,
        message: message
      });
    },
    ValidationErrorWithData: (res, data,error) => {
      return res.status(400).json({
        statusCode: 400,
        message: data,
        error:error
          
      });
          
    },
    SubscribedSuccessFully: (res, data) => {
      return res.status(200).json({
        statusCode: 200,
        message: res.__('SUBSCRIBED_SUCESSFULL'),
        user_details: data
           
      });
    },
    SuccessSignUp: (res, message,data,statusCode) => {
      return res.status(statusCode).json({
        statusCode: statusCode,
        message: message,
        data:data,
          
      });
    },
    PasswordUpdatedSucessfully:(res,message) => {
      return res.status(200).json({
        statusCode:200,
        message:message,
                
      
      });
    },
    
      
    SuccessResponseWithMultipleData: (res,message, tenanted, vacant) => {
      return res.status(200).json({
        statusCode: 200,
        message:message,
        tenanted:tenanted,
        vacant:vacant,
      });
    },
    
      
    SuccessResponseMultipleData1 : (res, message, data, AllUser) => {
      return res.status(200).json({
        statusCode: 200,
        message:message,
        data:data,
        AllUser:AllUser
      });
    },
      
      
    TokenExpiredError : (res, e) => {
      return res.status(401).json({
        statusCode: 401,
        message:'Token Expired',
        error:e.message
            
      });
    },
      
      
  };
          