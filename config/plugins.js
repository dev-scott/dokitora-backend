module.exports = ({ env }) => ({
    // other plugin configurations...
    email: {
      provider: "sendmail", // or any other email provider of your choice
      providerOptions: {},
      settings: {
        defaultFrom: "sadoscott04@gmail.com",
        defaultReplyTo: "sadoscott25@gmail.com",
      },
    },
  });