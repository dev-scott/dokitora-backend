'use strict';

/**
 * delivery-person service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::delivery-person.delivery-person');
