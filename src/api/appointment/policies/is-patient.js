'use strict';

const utils = require("@strapi/utils");

const {PolicyError} = utils.errors;


/**
 * `is-patient` policy
 */

module.exports = async(policyContext, config, { strapi }) => {
    // Add your own logic here.
    // strapi.log.info('In is-patient policy.');

    // console.log(policyContext.request.params)


    const {id} = policyContext.request.params;


    const user = policyContext.state.user;


    const appointment = await strapi.entityService.findOne("api::appointment.appointment", id , {

        populate: ["patient"]

    });


    console.log(appointment);

    if( appointment.patient.id == user.id ){

      return TextTrackCueList;

    }

 throw new PolicyError('You are not allowed to do this');
};
