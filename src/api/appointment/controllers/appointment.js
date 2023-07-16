"use strict";

/**
 * appointment controller
 */

const { createCoreController } = require("@strapi/strapi").factories;
const dayjs = require("dayjs");

const customParseFormat = require("dayjs/plugin/customParseFormat");
dayjs.extend(customParseFormat);
const httpConstants = require("http2").constants;

const { validateCreateBody } = require("./validation/availability");

module.exports = createCoreController(
  "api::appointment.appointment",

  ({ strapi }) => ({
    confirmAppointment: async (ctx, next) => {
      const { id } = ctx.request.params;

      const user = ctx.state.user;

      await strapi.entityService.update(
        "api::appointment.appointment",
        id,

        {
          data: {
            confirmed: true,
          },
        }
      );

      return {
        message: "confirmed",
      };
    },



    async create(ctx, next) {
      const user = ctx.state.user;

      console.log(user)

      const { note , doctor }  = ctx.request.body.data;

      const startTime = new Date(start_time.getTime).toISOString();

      const date = ctx.request.body.data.date

      const myDate = new Date(date)

      const dateIso = myDate.toISOString();


      const appointment = await strapi.entityService.create(
        "api::appointment.appointment",
        {
          data: {
            days_of_week: dateIso,
          

            note:note,

            owner: user.id,

            doctor: doctor
          },
        }
      );

      return { appointment };
    },




  //   async create(ctx)
  // {
  //   const user = ctx.state.user;

  //  const {days_of_week, start_time, end_time}  = await validateCreateBody(ctx.request.body.data);

  //   //get the availability
  //  const availabilities = await strapi.service("api::availability.custom").findManyByUserId(user.id);

  //   //find if availabilities days of week is already exists
  //   let conflictCount = 0;
  //   for (let i = 0; i < availabilities.length; i++) {
  //     const availability = availabilities[i];
  //       if(availability) {
  //       const existingStartTime = dayjs(availability.start_time, "HH:mm:ss.sss");
  //       const existingEndTime = dayjs(availability.end_time, "HH:mm:ss.sss");

  //       const newStartTime = dayjs(start_time, "HH:mm:ss");
  //       const newEndTime = dayjs(end_time, "HH:mm:ss");

  //       //check if has conflict in existing schedule
  //       let hasConflict = await strapi.config.util.checkForConflict(
  //         existingStartTime,existingEndTime,
  //         newStartTime, newEndTime);

  //       if(hasConflict) {
  //         conflictCount++;
  //       };
  //     }
  //   }
  //   if(conflictCount > 0) return ctx.conflict('conflict time schedule');

  //   //TODO: Create a Requests method to handle some request validations
  //   //create obj
  //   let obj = {
  //     user: user.id,
  //     days_of_week,
  //     start_time,
  //     end_time
  //   };

  //   let sanitizeEntry = await strapi.service("api::availability.custom").create(obj);
  //   if(sanitizeEntry) return {
  //     status: httpConstants.HTTP_STATUS_OK,
  //     data: sanitizeEntry,
  //     message:"successfully created!"
  //   };

  // },



  })
);
