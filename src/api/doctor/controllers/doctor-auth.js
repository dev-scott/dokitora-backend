'use strict';

/**
 * A set of functions called "actions" for `doctor-auth`
 */

module.exports = {
  // exampleAction: async (ctx, next) => {
  //   try {
  //     ctx.body = 'ok';
  //   } catch (err) {
  //     ctx.body = err;
  //   }
  // }

  async register(ctx){


    const { email , password , name ,  specialty , location , phone } = ctx.request.body;


    const doctor = await strapi.entityService.create(
      
      "api::doctor.doctor",
      {
        data: {
          email,
          password,
          name,
          specialty,
          location,
          phone
        }
      }
    )
    console.log(doctor);



    return {
      doctor
    }

  }

};
