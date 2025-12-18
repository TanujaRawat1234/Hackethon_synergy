const { UserFcmToken } = require('../models');
const moment = require('moment');

exports.saveToken = async (user_id, fcm_token) => {
  if (!fcm_token) throw new ApiError(404, 'Fcm Token is  required');;

  // const existing = await UserFcmToken.findOne({ where: { user_id, fcm_token } });

  // if (existing) {
  //   await existing.update({ device_type, updatedAt: moment().valueOf() });
  //   return existing;
  // }

  return await UserFcmToken.create({
    user_id,
    fcm_token
  });
};
