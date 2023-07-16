"use strict";

/**
 * patient controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

const bcrypt = require('bcryptjs');

const {validateEmail } = require("@strapi/utils")


// import bcrypt from "@strapi/utils"


module.exports = createCoreController(
  "api::patient.patient",

  ({ strapi }) => ({
    async register(ctx) {
      const {
        email,
        password,
        name,
        date_of_birth,
        adresse,
        phone,
        insurance,
      } = ctx.request.body;


      const saltRounds = 10

      const hashPassword = await bcrypt.hash(password , saltRounds);


      const patient = await strapi.entityService.create(
        "api::patient.patient",

        {
          data: {
            email,
            password:hashPassword,
            name,
            date_of_birth,
            adresse,
            phone,
            insurance,
          },
        }
      );



      console.log(patient);


      return {
        patient
      }




    },



    async connect(ctx){


        const {email , password} = ctx.request.body;

        const patient = await strapi.entityService.findOne("api::patient.patient" , {
          email
        })


        console.log(patient)
        
        const isValidPatient = validateEmail(email) && bcrypt.compareSync(password, patient.password);

        if (!isValidPatient) {
            throw new Error('Invalid email or password');
        }

        await strapi.entityService.connect(patient);


        return{
          patient
        }



    }



  })
);
