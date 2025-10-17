const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl:'https://conduit.bondaracademy.com/',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
  viewportWidth:1280,
  viewportHeight:720,
  video:true,
  env: {
    username:'emna@gmail.com',
    password:'welcome',
  },
 
});
