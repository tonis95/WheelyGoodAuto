$(document).ready(function () {
    const nav = Vue.createApp({
      data() {
        return {
          links: [
            {text: 'Home', url: '/views/index.html'},
            {text: 'Employee', url: '/views/employeeLogin.html'}
          ]
        };
      }
    }).mount('#navbarComponents');
  });