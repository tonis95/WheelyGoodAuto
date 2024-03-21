$(document).ready(function () {
    Vue.createApp({
      data() {
        return {
          currentShippingCharge: 0, 
          orders: [],
          modalData: [],
          orderData: [],
          searchResults: [],
        };
  
      },

      methods: {
        //view all of the order items in an order
        viewOrder: async function(orderId) {
            try {
              const response = await axios.post('http://localhost:3000/api/orderItems', {
                orderId: orderId,
              });

              this.modalData = this.orders[orderId-1];
              this.orderData = response.data;

              console.log(response.data);
            } catch (error) {
              console.error(error.message);
            }
        },

        //complete the order
        async completeOrder(orderId) {
              try {
                const response = await axios.post('http://localhost:3000/api/finishOrder', {
                  orderId: orderId,
                });
            } catch(error) {
              console.error (error.message);
            }
         },

       //handle the shipping amount from the admin page
       async  insertShipping(){
            var amount = document.getElementById("shipping").value;
            var lower =  document.getElementById("lowerweight").value;
            var upper =  document.getElementById("upperweight").value;
            try {
              const response = await axios.post('http://localhost:3000/api/handleShipping', {
                amount: amount,
                lower: lower,
                upper: upper,
              })

              console.log(response.data);
            } catch(error) {
              console.error(error.message);
            }
        },

      },
  
      //call upon page load
      created() {
        (async () => {
        try {
          console.log("made it to created");
          const response = await axios.get('http://localhost:3000/api/adminOC');
          this.orders = response.data;
          console.log(response.data);
        }
         catch (error) {
          console.log('Error adding orders to admin view', error);
        }
    })();
  
    },
  }).mount('#adminView');
  });
