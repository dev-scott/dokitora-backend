const bcrypt = require("bcryptjs");
/* eslint-disable no-useless-escape */
const _ = require("lodash");
const utils = require("@strapi/utils");
const { getService } = require("@strapi/plugin-users-permissions/server/utils");
const user = require("./content-types/user");
const twilio = require("twilio");

const {
  validateCallbackBody,
  validateRegisterBody,
  validateResetPasswordBody,
} = require("@strapi/plugin-users-permissions/server/controllers/validation/auth");
const { uuid } = require("uuidv4");

const { sanitize } = utils;
const { hash } = require("bcryptjs"); // Utilisation du module bcryptjs pour le hachage

// const { v4: uuidv4 } = require('uuid');
// const { isEmail } = require('validator');
const crypto = require("crypto");

const nodemailer = require("nodemailer");

const { ApplicationError, ValidationError } = utils.errors;

// const accountSid = 'AC42b36fe5aff3f78d3425cb50a27f548e';
//  const authToken = '0eb489dbadbf3af95982c5df0aa0fe7c';
//  const phoneSend = '+237 657704439'

const myTwilio = {
  accountSid: "AC42b36fe5aff3f78d3425cb50a27f548e",
  authToken: "7f81e933598b9a846c46145395dcb417",
  phone: "+237657704439",
};

// const client = new twilio.Twilio(myTwilio.accountSid, myTwilio.authToken);
const smsClient = require("twilio")(myTwilio.accountSid, myTwilio.authToken);

const sanitizeUser = (user, ctx) => {
  const { auth } = ctx.state;
  const userSchema = strapi.getModel("plugin::users-permissions.user");
  return sanitize.contentAPI.output(user, userSchema, { auth });
};

module.exports = (plugin) => {
  //extend controller

  // register user with email

  plugin.controllers.auth.register = async (ctx) => {
    const pluginStore = await strapi.store({
      type: "plugin",
      name: "users-permissions",
    });

    const settings = await pluginStore.get({ key: "advanced" });

    if (!settings.allow_register) {
      throw new ApplicationError("Register action is currently disabled");
    }
    const params = {
      ..._.omit(ctx.request.body, [
        "confirmed",
        "blocked",
        "confirmationToken",
        "resetPasswordToken",
        "provider",
      ]),
      provider: "local",
    };

    await validateRegisterBody(params);

    const role = await strapi
      .query("plugin::users-permissions.role")
      .findOne({ where: { id: params.role } });

    if (!role) {
      throw new ApplicationError("Impossible to find the default role");
    }

    const { email, username, provider } = params;

    const identifierFilter = {
      $or: [
        { email: email.toLowerCase() },
        { username: email.toLowerCase() },
        { username },
        { email: username },
      ],
    };

    const conflictingUserCount = await strapi
      .query("plugin::users-permissions.user")
      .count({
        where: { ...identifierFilter, provider },
      });

    if (conflictingUserCount > 0) {
      throw new ApplicationError("Email or Username are already taken");
    }

    if (settings.unique_email) {
      const conflictingUserCount = await strapi
        .query("plugin::users-permissions.user")
        .count({
          where: { ...identifierFilter },
        });

      if (conflictingUserCount > 0) {
        throw new ApplicationError("Email or Username are already taken");
      }
    }

    const newUser = {
      ...params,
      role: role.id,
      email: email.toLowerCase(),
      username,
      confirmed: !settings.email_confirmation,
    };
    //modify this service
    // const user = await getService('user').add(newUser);
    const user = await strapi.entityService.create(
      "plugin::users-permissions.user",
      {
        data: newUser,
        populate: ["role", "ratings"],
      }
    );
    let sanitizedUser = await sanitizeUser(user, ctx);
    sanitizedUser.ratings = user.ratings; //Newly added
    if (settings.email_confirmation) {
      try {
        await getService("user").sendConfirmationEmail(sanitizedUser);
      } catch (err) {
        throw new ApplicationError(err.message);
      }

      return ctx.send({ user: sanitizedUser });
    }

    const jwt = getService("jwt").issue(_.pick(user, ["id"]));

    //modified
    return ctx.send({
      jwt,
      user: sanitizedUser,
    });
  };

  // register user with email

  // forgot user password

  plugin.controllers.auth.forgotPassword = async (ctx) => {
    const { email } = ctx.request.body;

    if (!email) {
      throw new Error("Email is required");
    }

    console.log(email);

    const user = await strapi
      .query("plugin::users-permissions.user")
      .findOne({ where: { email: ctx.request.body.email } });

    console.log(user);

    if (!user) {
      return ctx.badRequest("Cet e-mail n'est pas enregistré.");
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    console.log(resetToken);

    user.resetPasswordToken = resetToken;

    await strapi.entityService.update(
      "plugin::users-permissions.user",
      user.id,
      {
        data: user,
      }
    );

    console.log(user);

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: "sadoscott25@gmail.com",
        pass: "kimgifnosrsptdiq",
      },
    });

    const mailOptions = {
      from: "sadoscott25@gmail.com",
      to: email,
      subject: "Réinitialisation du mot de passe",
      text:
        `Bonjour,\n\n` +
        `Vous avez demandé une réinitialisation du mot de passe pour votre compte.\n\n` +
        `Veuillez cliquer sur le lien suivant pour réinitialiser votre mot de passe : \n\n` +
        `${process.env.APP_URL}/reset-password?token=${resetToken}\n\n` +
        `Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet e-mail.\n\n` +
        `Cordialement,\nL'équipe Strapi`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log(`Email sent: ${info.response}`);
      }
    });

    return ctx.send({
      message:
        "Un e-mail a été envoyé avec les instructions pour réinitialiser votre mot de passe.",
    });
  };

  // forgot user password

  // reset user password

  plugin.controllers.auth.resetPassword = async (ctx) => {
    const { password, confirmPassword, token } = ctx.request.body;

    if (password != confirmPassword) {
      return ctx.badRequest("Les mots de passe ne correspondent pas .");
    }

    const user = await strapi
      .query("plugin::users-permissions.user")
      .findOne({ where: { resetPasswordToken: token } });

    if (!user) {
      return ctx.badRequest(
        "Le lien de reinitialisation du mot de passe est invalide ou expire"
      );
    }

    user.password = password;

    user.resetPasswordToken = "marche";

    await strapi.entityService.update(
      "plugin::users-permissions.user",
      user.id,
      {
        data: user,
      }
    );

    console.log(user);
  };

  // reset user password

  // register user with number

  // plugin.controllers.auth.registerWithPhoneAndOTP = async (ctx) => {
  //   function generateOTP() {
  //     const otpLength = 6;
  //     const digits = "0123456789";
  //     let otpCode = "";

  //     for (let i = 0; i < otpLength; i++) {
  //       otpCode += digits[Math.floor(Math.random() * 10)];
  //     }

  //     return otpCode;
  //   }

  //   const otpCode = generateOTP();

  //   const { phone, username } = ctx.request.body;

  //   if (!phone) return ctx.badRequest("missing.phone");
  //   if (!username) return ctx.badRequest("missing.username");

  //   const userWithThisNumber = await strapi
  //     .query("user", "users-permissions")
  //     .findOne({ phone });

  //   if (userWithThisNumber) {
  //     return ctx.badRequest(
  //       null,
  //       formatError({
  //         id: "Auth.form.error.phone.taken",
  //         message: "Phone already taken.",
  //         field: ["phone"],
  //       })
  //     );
  //   }

  //   const user = {
  //     username,
  //     phone,
  //     provider: "local",
  //     otpCode,
  //   };

  //   const advanced = await strapi
  //     .store({
  //       environment: "",
  //       type: "plugin",
  //       name: "users-permissions",
  //       key: "advanced",
  //     })
  //     .get();

  //   const defaultRole = await strapi
  //     .query("role", "users-permissions")
  //     .findOne({ type: advanced.default_role }, []);

  //   user.role = defaultRole.id;

  //   try {
  //     const data = await strapi.plugins["users-permissions"].services.user.add(
  //       user
  //     );
  //     await client.messages.create({
  //       to: phone,
  //       from: myTwilio.phone,
  //       body: `Your verification code is ${otpCode}`,
  //     });
  //     ctx.created(sanitizeUser(data));
  //   } catch (error) {
  //     ctx.badRequest(null, formatError(error));
  //   }

  //   // try {
  //   //   await client.messages.create({
  //   //     body: `Votre code d'authentification est : ${otpCode}`,
  //   //     from: 'NUMERO_DE_TELEPHONE_TWILIO',
  //   //     to: phone,
  //   //   });
  //   // } catch (err) {
  //   //   throw new ApplicationError('Erreur lors de l\'envoi du message SMS');
  //   // }

  //   // return ctx.send({ message: 'Code OTP envoyé avec succès' });
  // };

  plugin.controllers.auth.registerUserWithOtp = async (ctx) => {
    const { phone, username } = ctx.request.body;

    if (!phone) return ctx.badRequest("missing.phone");
    if (!username) return ctx.badRequest("missing.username");

    const userWithThisNumber = await strapi
      .query("plugin::users-permissions.user")
      .findOne({ where: { phone: ctx.request.body.phone } });

    if (userWithThisNumber) {
      return ctx.badRequest("user with this number already exists");
    }

    const otp = Math.floor(Math.random() * 9000) + 1000;

    const params = {
      ..._.omit(ctx.request.body, [
        "confirmed",
        "blocked",
        "confirmationToken",
        "resetPasswordToken",
        "provider",
      ]),
      provider: "local",
    };

    const role = await strapi
      .query("plugin::users-permissions.role")
      .findOne({ where: { id: params.role } });

    if (!role) {
      throw new ApplicationError("Impossible to find the default role");
    }

    const user = {
      ...params,
      username,
      phone,
      provider: "local",
      otp,
      role: role.id,
    };

    console.log(user);

    try {
      const newUser = await strapi.entityService.create(
        "plugin::users-permissions.user",
        {
          data: user,
          populate: ["role", "ratings"],
        }
      );

      // await smsClient.messages.create({
      //   to: phone,
      //   from: myTwilio.phone,
      //   body: `Your verification code is ${otp}`,
      // });

      let sanitizedUser = await sanitizeUser(newUser, ctx);

      const jwt = getService("jwt").issue(_.pick(newUser, ["id"]));

      return ctx.send({
        jwt,
        newUser: sanitizedUser,
      });
    } catch (error) {
      console.log(error);
    }
  };

  // register user with number

  // verification of otp code

  plugin.controllers.auth.verifyAccount = async (ctx) => {
    const { otp } = ctx.request.body;

    if (!otp) return ctx.badRequest("missing.token");

    const verifyUserCode = await strapi
      .query("plugin::users-permissions.user")
      .findOne({ where: { otp: ctx.request.body.otp } });

    console.log(verifyUserCode);

    if (!verifyUserCode) {
      return ctx.badRequest("Invalid code or number");
    }

    let updateData = {
      otp: null,
      confirmed: true,
    };

    console.log(updateData);

    const newData = await strapi.entityService.update(
      "plugin::users-permissions.user",
      verifyUserCode.id,
      {
        data: updateData,
      }
    );

    let sanitizedUser = await sanitizeUser(newData, ctx);

    const jwt = getService("jwt").issue(_.pick(newData, ["id"]));

    ctx.send({ jwt, newUser: sanitizedUser });
  };

  // verification of otp code

  // update user information

  plugin.controllers.auth.updateAccount = async (ctx) => {
    const { phone, password } = ctx.request.body;

    const userWithThisNumber = await strapi
      .query("plugin::users-permissions.user")
      .findOne({ where: { phone: ctx.request.body.phone } });

    userWithThisNumber.password = password;

    try {
      const newUser = await strapi.entityService.update(
        "plugin::users-permissions.user",
        userWithThisNumber.id,
        {
          data: userWithThisNumber,
        }
      );

      let sanitizedUser = await sanitizeUser(newUser, ctx);
      const jwt = getService("jwt").issue(_.pick(newUser, ["id"]));

      console.log(newUser);

      return ctx.send({
        jwt,
        newUser: sanitizedUser,
      });
    } catch (error) {
      console.log(error);
    }
  };

  // update user information

  plugin.controllers.auth.updateUserOtp = async (ctx) => {
    const { phone } = ctx.request.body;

    const userWithThisNumber = await strapi
      .query("plugin::users-permissions.user")
      .findOne({ where: { phone: ctx.request.body.phone } });

    const otp = Math.floor(Math.random() * 9000) + 1000;

    let updateData = {
      otp: otp,
    };

    const newData = await strapi.entityService.update(
      "plugin::users-permissions.user",
      userWithThisNumber.id,
      {
        data: updateData,
      }
    );

    return "otp updated successfully";
  };

  // resent otp code

  // get doctor user
  plugin.controllers.auth.getDoctorUser = async (ctx) => {
    const DoctorUser = await strapi
      .query("plugin::users-permissions.user")
      .findMany({ where: { role: 3 } });

      return ctx.send({
        
        data:DoctorUser
      });


  };

  // get doctor user


  plugin.controllers.auth.getDeliveryPerson = async (ctx) => {
    const DeliveryPerson = await strapi
      .query("plugin::users-permissions.user")
      .findOne({ where: { role: 2 } });

      return ctx.send({
        
        data:DeliveryPerson
      });


  };



  //

  plugin.contentTypes.user = user;

  plugin.routes["content-api"].routes.push(
    {
      method: "POST",
      path: "/auth/registerUserWithOtp",
      handler: "auth.registerUserWithOtp",
      config: {
        prefix: "",
        policies: [],
      },
    },

    {
      method: "POST",
      path: "/auth/verifyAccount",
      handler: "auth.verifyAccount",
      config: {
        prefix: "",
        policies: [],
      },
    },
    {
      method: "POST",
      path: "/auth/updateAccount",
      handler: "auth.updateAccount",
      config: {
        prefix: "",
        policies: [],
      },
    },
    {
      method: "POST",
      path: "/auth/updateUserOtp",
      handler: "auth.updateUserOtp",
      config: {
        prefix: "",
        policies: [],
      },
    },
    {
      method: "GET",
      path: "/auth/getDoctorUser",
      handler: "auth.getDoctorUser",
      config: {
        prefix: "",
        policies: [],
      },
    },
    {
      method: "GET",
      path: "/auth/getDeliveryPerson",
      handler: "auth.getDeliveryPerson",
      config: {
        prefix: "",
        policies: [],
      },
    }
  );

  return plugin;
};
