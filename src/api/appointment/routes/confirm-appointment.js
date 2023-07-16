module.exports= {


    routes:[

        {
            method:"POST",
            path:"/appointments/confirm/:id",
            handler:"appointment.confirmAppointment",
            // policies:["api::appointment.is-patient"],
            config:{
                policies:["api::appointment.is-patient"],
            }
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