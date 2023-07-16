module.exports = {


    routes:[

        {

            method:"POST",
            path:"/doctor/register",
            handler:"doctor.register",
            config: {
                  auth: false
                
              }

        },

        {

            method:"POST",
            path:"/doctor/connect",
            handler:"doctor.connect",
            config: {
                  auth: false
                
              }

        },



    ]

}