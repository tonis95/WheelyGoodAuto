$(document).ready(function () {
  const cart = Vue.createApp({
    data() {
      return {
        cartItems,
        cartTotal: 0,
      }
    },

    computed: {
      total() {
        return this.getPrice(this.cartItems);
      },
      quantity() {
        return this.getQuantity(this.cartItems)        
      }
    },

    watch: {
      cartItems: {
        handler: function () {
          this.cartTotal = this.total;
          const quants = this.quantity;

          for (var i = 0; i < quants.length; i++) {
            (this.cartItems)[i].quantity = quants[i];
            this.$forceUpdate();
          }
          this.transfer(this.cartItems);
        },
        deep: true,
      },
    },

    template: `
    <div class="card border-0">
      <div class="card-body">
        <table class="table">
          <thead>
            <tr>
              <th scope="col">Product</th>
              <th scope="col">Quantity</th>
              <th scope="col">Price</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(items, index) in cartItems">
              <th scope="row">
                <div class="d-flex align-items-center">
                  <div class="flex-column ms-4">
                    <p class="mb-2">{{ items.name }}</p>
                  </div>
                </div>
              </th>
              <td class="align-middle">
                <div class="d-flex flex-row">
                  <button class="btn btn-link px-2"
                    onclick="this.parentNode.querySelector('input[type=number]').stepDown()">
                    <i class="fas fa-minus"></i>
                  </button>

                  <input id="form1" min="0" name="quantity" v-model.number="items.quantity" type="number"
                    class="form-control form-control-sm" style="width: 50px;" />

                  <button class="btn btn-link px-2"
                    onclick="this.parentNode.querySelector('input[type=number]').stepUp()">
                    <i class="fas fa-plus"></i>
                  </button>
                </div>
              </td>
              <td class="align-middle">
                <p class="mb-0" style="font-weight: 500;">\${{ (items.price * items.quantity).toFixed(2) }}</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="card-footer bg-transparent border-0 mx-auto" id="cart">
        <a href="/views/checkout.html">
          <button type="button" class="btn btn-primary btn-block btn-lg">Checkout \${{ cartTotal.toFixed(2) }}</button>
        </a>
      </div>

    </div>
    `,

    methods: {
      //get the total price in the cart
      getPrice: function (cart) {
      let cartTotal = 0;

      for (var i = 0; i < cart.length; i++) {
        cartTotal += cart[i].price * cart[i].quantity;
      }
      return cartTotal
      },

      //get the quantity of all items in order
      getQuantity: function(cart) {
          quantity = [];

          for (var i = 0; i < cart.length; i++) {
            quantity.push(cart[i].quantity);
          }
          return quantity;
      },

      //transder cart to backend with updated quantity
      transfer: async function(cart){
        try {
            const response = await axios.post('http://localhost:3000/api/quantity', Array.from(cart), {
            headers: {
              'Content-Type': 'application/json',
          },
        });
            console.log("response:", response.data);
        } catch(error){
            console.error("Error transfering cart to backend", error);
          }
     },
    },

    //run upon file load
    created() {
      this.cartTotal = this.getPrice(this.cartItems);
      quants = this.getQuantity(this.cartItems);

      for (var i = 0; i < quants.length; i++) {
        this.cartItems[i].quantity = quants[i];
        this.$forceUpdate();
      }
    },
}).mount('#cart');
});
