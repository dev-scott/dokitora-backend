"use strict";

/**
 * doctor controller
 */

const { createCoreController } = require("@strapi/strapi").factories;
// const { validateEmail } = require("@strapi/utils");

//import userpermissions
// const userPermissions = require("@strapi/userpermissions")
// const pluginUsersPermissions = strapi.plugins["users-permissions"];


// const userPermissions = require("@strapi/userpermissions");
// const pluginUsersPermissions = strapi.plugins["users-permissions"];

const bcrypt = require("bcryptjs");




module.exports = createCoreController(
  "api::doctor.doctor",

  ({ strapi }) => ({
    async register(ctx) {
      const { email, password, name, specialty, location, phone } =
        ctx.request.body;

      const saltRounds = 10;

      const hashPassword = await bcrypt.hash(password, saltRounds);

      const doctor = await strapi.entityService.create("api::doctor.doctor", {
        data: {
          email,
          password: hashPassword,
          name,
          specialty,
          location,
          phone,
        },
      });

           // Add the doctor role to the doctor user.
          //  await pluginUsersPermissions.services.userspermissions.addRoleToStrapiUser(
          //   doctor,
          //   "doctor"
          // );
    

      // usersPermissions.addRoleToUser(doctor.id, "doctor");

      // await pluginUsersPermissions.services.userspermissions.addRoleToStrapiUser(
      //   doctor.id,
      //   "doctor"
      // );

      // const usersPermissions = await strapi.plugins["users-permissions"].services.userspermissions;

      // await usersPermissions.addRoleToStrapiUser(doctor, "doctor");

      console.log(doctor);

      return {
        doctor,
      };
    },














    async connect(ctx) {
      const { email, password } = ctx.request.body;

      const doctor = await strapi.entityService.findOne(
        "api::doctor.doctor",
        20,
        {
          email,
        }
      );

      console.log(doctor);
      if (doctor === null) {
        throw new Error("Doctor not found");
      }


      // validateEmail(email) 

      const isValidDoctor = bcrypt.compareSync(password, doctor.password);

      if (!isValidDoctor) {
        throw new Error("Invalid email or password");
      }

      await strapi.entityService.connect(doctor);

      return {
        doctor,
      };
    },





    // async connect(ctx) {
    //   const { email, password } = ctx.request.body;

    //   if (ctx.user) {
    //     const doctor = await strapi.entityService.findOne(
    //       "api::doctor.doctor",
    //       20,
    //       {
    //         email,
    //       }
    //     );

    //     if (doctor === null) {
    //       throw new Error("Doctor not found");
    //     }

    //     // const isValidDoctor = bcrypt.compareSync(password, doctor.password);

    //     // if (!isValidDoctor) {
    //     //   throw new Error("Invalid email or password");
    //     // }

    //     await strapi.entityService.connect(doctor);

    //     return {
    //       doctor,
    //     };
    //   } else {
    //     throw new Error("You must be logged in to connect");
    //   }
    // }




  })
);
