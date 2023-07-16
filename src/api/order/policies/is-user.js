"use strict";

const utils = require("@strapi/utils");

const { PolicyError } = utils.errors;

module.exports = async (policyContext, config, { strapi }) => {
  const { id } = policyContext.request.params;

  const user = policyContext.state.user;

  console.log(user);

 
    const appointment = await strapi.entityService.findOne(
      "api::order.order",
      2,
      {
        populate: ["owner"],
        // fields: ['time'],

      }
    );

    console.log(appointment);
  


  if(appointment.owner.id == user.id){

      return true;

  }

  throw new PolicyError("You are not allowed to do this")
};
