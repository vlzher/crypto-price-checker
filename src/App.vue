<template>
  <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
    <div
      v-if="!isMounted"
      class="fixed w-100 h-100 opacity-80 bg-purple-800 inset-0 z-50 flex items-center justify-center"
    >
      <svg
        class="animate-spin -ml-1 mr-3 h-12 w-12 text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div>
    <div class="container">
      <add-coin-section
        @addCoinSection="(name) => addCoin(name)"
        :checkIfAdded="checkIfAdded"
      />
      <separate-line :coinListLength="this.coinList.length" />
      <filter-page-button-section
        :coinList="coinList"
        @paginatedList="(list) => (this.paginatedList = list)"
        @turnOffGraph="this.isGraphOpened = false"
      />
      <coin-zone
        :paginatedList="this.paginatedList"
        :currentCoinName="currentCoin.name"
        @setCurrentCoin="(coin) => setCurrentCoin(coin)"
        @removeCoin="(coin) => removeCoin(coin)"
      />
      <separate-line :coinListLength="this.coinList.length" />
      <graph-zone
        v-if="isGraphOpened"
        :currentCoinName="this.currentCoin.name"
        @closeGraph="
          isGraphOpened = false;
          currentCoin = {};
        "
        :newPrice="+this.newGraphPrice"
      />
    </div>
  </div>
</template>

<script>
import { isCoinValid, subscribeToCoin, unsubscribeFromCoin } from "@/api/api";
import AddCoinSection from "@/components/AddCoinSection.vue";
import FilterPageButtonSection from "@/components/FilterPageButtonSection.vue";
import CoinZone from "@/components/CoinZone.vue";
import GraphZone from "@/components/GraphZone.vue";
import SeparateLine from "@/components/SeparateLine.vue";
export default {
  name: "App",
  components: {
    GraphZone,
    FilterPageButtonSection,
    AddCoinSection,
    CoinZone,
    SeparateLine,
  },
  methods: {
    setCurrentCoin(coin) {
      this.currentCoin = coin;
      this.isGraphOpened = true;
    },
    addCoin(name) {
      const currentCoin = {
        name: name.toUpperCase(),
        price: 0,
      };
      this.coinList = [...this.coinList, currentCoin];
      subscribeToCoin(currentCoin.name.toLowerCase(), (price) =>
        this.updateCoinPrice(currentCoin.name, price)
      );
    },

    removeCoin(coin) {
      if (this.currentCoin.name === coin.name) {
        this.currentCoin = {
          name: "",
          price: 0,
        };
        this.isGraphOpened = false;
      }
      this.coinList = this.coinList.filter((coin1) => coin1.name !== coin.name);
      unsubscribeFromCoin(coin.name);
    },

    checkIfAdded(name) {
      return this.coinList.some(
        (coin) => coin.name.toLowerCase() === name.toLowerCase()
      );
    },

    updateCoinPrice(name, price) {
      if (this.currentCoin.name === name) {
        this.newGraphPrice = price;
      }
      this.coinList
        .filter((coin) => coin.name === name)
        .forEach((t) => (t.price = price));
    },
  },

  data() {
    return {
      isMounted: false,
      currentCoin: { name: "", price: 0, isValid: true },

      coinList: [],
      paginatedList: [],

      newGraphPrice: 0,
      isGraphOpened: false,
    };
  },

  created() {
    if (localStorage.getItem("coinList")) {
      this.coinList = JSON.parse(localStorage.getItem("coinList"));
      this.coinList.forEach((coin) => {
        subscribeToCoin(coin.name.toUpperCase(), (price) =>
          this.updateCoinPrice(coin.name.toUpperCase(), price)
        );
      });
    }
  },
  watch: {
    coinList: {
      handler() {
        this.coinList.forEach(
          (coin) => (coin.isValid = isCoinValid(coin.name))
        );
        localStorage.setItem("coinList", JSON.stringify(this.coinList));
      },
      deep: true,
    },
  },
  beforeMount() {
    this.isMounted = false;
  },
  mounted() {
    this.isMounted = true;
  },
};
</script>
