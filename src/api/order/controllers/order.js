"use strict";

/**
 * order controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::order.order", ({ strapi }) => ({
async confirmOrder (ctx, next){
    // console.log(ctx.state.user)

    // const { id } = ctx.request.params;

    // await strapi.entityService.update("api::order.order", id, {
    //   data: {
    //     confirmed: true,
    //     confirmation_date: new Date(),
    //   },
    // });
    // return {
    //   message: "confirmed",
    // };

    const { id } = ctx.request.params;

    // const today = new Date("dd/mm/yyyy")

    // console.log(today)
 
    const today = new Date().toISOString();
  

    const value = await strapi.entityService.update("api::order.order", id, {
      data: {
        confirmed: true,
        confirmation_date:today
      },
    });

    return {
      value
    };
  },

  async create(ctx, next) {
    const user = ctx.state.user;

    const email = user.email;

    const phone = user.phone;

    const { medication } = ctx.request.body.data;

    console.log(medication);

    const order = await strapi.entityService.create("api::order.order", {
      data: {
        Medication: medication,
        email: email,
        phone: phone,
        owner: user.id,
      },
    });

    return { order };

    // console.log(ctx.request.body.data);
  },
}));
