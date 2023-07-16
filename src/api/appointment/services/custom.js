'use strict';
const { sanitize } = require('@strapi/utils');
/**
 * custom service
 */

module.exports = () => ({

  async create(obj = null)
  {
    //if true return empty obj
    if(!obj) return {};

    const entry = await strapi.entityService.create('api::appointment.appointment', {
      data: obj,
    });

    return await sanitize.contentAPI.output(entry);
  },

  async findManyByUserId(userId) {
    return await strapi.entityService.findMany('api::appointment.appointment', {
      filters: {user: userId}
    });
  }


});
