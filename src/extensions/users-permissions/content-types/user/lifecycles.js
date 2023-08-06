const _ = require("lodash");

module.exports = {
  async afterCreate(event) {
    const { result } = event;
    const userRole = event.params.data.role;

    // console.log(result, event.params.);

    const specialization = "pediatre"

    if (userRole === 3) {
      await strapi.entityService.create("api::doctor.doctor", {
        data: {
          user: result.id,
          // specialty: event.params.data.doctor.specialization,
          specialty:specialization,

        },
      });
    }

    else if (userRole === 4) {


        await strapi.entityService.create("api::patient.patient", {
            data: {
              user: result.id,
          
            },
          });

    }

    else if (userRole===2){

      await strapi.entityService.create("api::delivery.delivery", {
        data: {
          user: result.id,
      
        },
      });


    }
    else if (userRole ===5){

      await strapi.entityService.create("api::pharmacy.pharmacy", {
        data: {
          user: result.id,
      
        },
      });


    }
    //check if userRole not exist
    else if(!userRole) {

      await strapi.entityService.create("api::patient.patient", {
        data: {
          user: result.id,
          location: event.params.data.doctor.location,
          phone: event.params.data.doctor.phone,
        },
      });


    }











  },
};
