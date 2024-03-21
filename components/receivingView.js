$(document).ready(function () {
    Vue.createApp({
      data() {
        return {

        };
      },
      methods: {
        //insert an item into inventory based on either id or description
        async  insertInventory(){
            var descriptor = document.getElementById("descriptor").value;
            var quantity =  document.getElementById("quantity").value;
            try {
              const response = await axios.post('http://localhost:3000/api/handleInventory', {
                descriptor: descriptor,
                quantity: quantity,
              })

              console.log(response.data);
            } catch(error) {
              console.error(error.message);
            }
      },
  

  },
}).mount('#receivingView');
  });