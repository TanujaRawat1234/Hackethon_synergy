const apiResponse = require('../utills/response');

module.exports = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  if (statusCode === 400)
    return apiResponse.FailedResponseWithOutData(res, message);

  if (statusCode === 401)
    return apiResponse.UnAuthorized(res, message);

  if (statusCode === 404)
    return apiResponse.NotFound(res, message);

  if (statusCode === 409)
    return apiResponse.FailedResponseWithOutData(res, message);

  return apiResponse.InternalServerError(res, err);
};
