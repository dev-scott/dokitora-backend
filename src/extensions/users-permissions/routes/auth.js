module.exports= {


    routes:[

        {
            method:"POST",
            path:"/registerWithPhoneAndOTP",
            handler:"user.registerWithPhoneAndOTP",
      
        }
        // {
        //     method:"POST",
        //     path:"/appointments/create",
        //     handler:"appointment.createAppointment",
        //     // policies:["api::appointment.is-patient"],
        //     config: {
        //         auth: false,
        //       },
        // }


    ]


}