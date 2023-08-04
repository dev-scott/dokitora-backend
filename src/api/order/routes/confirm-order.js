module.exports = {
  routes: [
    {
      method: "POST",
      path: "/orders/confirm/:id",
      handler: "order.confirmOrder",
      config: {
        policies: ["api::order.is-user"],
      },
    },
    {
      method: "GET",
      path: "/orders/findOrderByUser",
      handler: "order.findOrderByUser",
      // config:{
      //     policies:["api::order.is-user"],
      // }
    },
  ],
};
