$(document).ready(function () {
  const toggle = Vue.createApp({
    data() {
      return {
          selectedLogin: 'login1',
          empUser: null,
          empPassword: null,
          adminUser: null,
          adminPassword: null,
          loggedIn: null,
      }
    },
    // Returns specific page title
    computed: {
      pageTitle() {
        if (this.selectedLogin === 'login1') {
          return 'Warehouse';
        } else if (this.selectedLogin === 'login2') {
          return 'Receiving';
        } else if (this.selectedLogin === 'login3') {
          return 'Admin';
        }
        return '';
      },
    },
    methods: {
      login1() {
        //Handle login for Page 1 Warehouse
        const foundUser = wareUsers.find(user => user.username === this.empUser && user.password === this.empPassword);

        // If user is found, navigate to warehouse dashboard. Otherwise show invalid message
        if(foundUser) 
        {
          alert('Login successful');
          window.location.href = '/views/warehouseDash.html';
        }
        else {
          alert('Invalid username or password');
        }

        
      },
      login2() {
        // Handle login for Page 2 Receiving
        const foundUser = receiveUsers.find(user => user.username === this.empUser && user.password === this.empPassword);

        // If user is found, navigate to receiving dashboard. Otherwise show invalid message
        if(foundUser) 
        {
          alert('Login successful');
          window.location.href = '/views/receivingDash.html';
        }
        else {
          alert('Invalid username or password');
        }

      },
      login3() {
        // Handle login for Page 3 Admin
        const foundUser = adminUsers.find(user => user.username === this.adminUser && user.password === this.adminPassword);

        // If user is found, navigate to admin dashboard. Otherwise show invalid message
        if(foundUser) 
        {
          alert('Login successful');
          window.location.href = '/views/adminDash.html';
        }
        else {
          alert('Invalid username or password');
        }

      },
    },
}).mount('#toggleLogin');


// Credentials for each Login form
// Warehouse Credentials array
const wareUsers = [
  {id: 1, username: 'w1944092', password: 'warehouse1'},
  {id: 2, username: 'w1885782', password: 'warehouse2'},
  {id: 3, username: 'w1906725', password: 'warehouse3'},
  {id: 4, username: 'w1929689', password: 'warehouse4'}
];

// Receiving Credentials array
const receiveUsers = [
  {id: 1, username: 'r1944092', password: 'receiving1'},
  {id: 2, username: 'r1885782', password: 'receiving2'},
  {id: 3, username: 'r1906725', password: 'receiving3'},
  {id: 4, username: 'r1929689', password: 'receiving4'}
];

// Admin Credentials array
const adminUsers = [
  {id: 1, username: 'a1944092', password: 'adminpass1'},
  {id: 2, username: 'a1885782', password: 'adminpass2'},
  {id: 3, username: 'a1906725', password: 'adminpass3'},
  {id: 4, username: 'a1929689', password: 'adminpass4'}
];

});