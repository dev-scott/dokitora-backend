module.exports = {


    routes:[

        {

            method:"POST",
            path:"/patient/register",
            handler:"patient.register",
            config: {
                  auth: false
                
              }

        },
        {

            method:"POST",
            path:"/patient/connect",
            handler:"patient.connect",
            config: {
                  auth: false
                
              }

        },



    ]

}