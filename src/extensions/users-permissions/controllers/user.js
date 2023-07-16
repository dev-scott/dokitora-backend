const user = require("../content-types/user");
const twilio = require("twilio");

const { sanitizeEntity } = require("strapi-utils");

const myTwilio = {
  accountSid: "AC42b36fe5aff3f78d3425cb50a27f548e",
  authToken: "0eb489dbadbf3af95982c5df0aa0fe7c",
  phone: "+237 657704439",
};

module.exports = {
  registerWithPhoneAndOTP:async (ctx)=> {
    const { phoneNumber } = ctx.request.body;

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    console.log(otp);

    // Send OTP via Twilio

    const client = twilio(myTwilio.accountSid, myTwilio.authToken);

    await client.messages.create({
      body: `Your OTP is ${otp}`,

      from: myTwilio.phone,
      to: phoneNumber,
    });

    // Save OTP and phone number in user session

    ctx.session.phoneNumber = phoneNumber;

    ctx.session.otp = otp;

    return { message: "OTP send for verification" };
  },

  async verifyOtp(ctx) {
    const { otp } = ctx.request.body;

    const phoneNumber = ctx.request.body;

    if (otp === ctx.session.otp) {
      // OTP verification successful
      // Implement your logic
      // For example, create a new user with the verified phone number

      const user = await strapi.plugins[
        "users-permissions"
      ].services.user.create({
        phoneNumber,
      });

      return sanitizeEntity(user, {
        model: strapi.plugins["users-permissions"].models.user,
      });
    } else {
      return ctx.throw(400, "Invalid OTP");
    }
  },
};
