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
      <section>
        <div class="flex">
          <div class="max-w-xs">
            <label for="wallet" class="block text-sm font-medium text-gray-700"
              >Coin price checker</label
            >
            <div class="mt-1 relative rounded-md shadow-md">
              <input
                v-model="inputText"
                @keydown.enter="addCoin(inputText)"
                type="text"
                name="wallet"
                id="wallet"
                class="block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
                placeholder="e.g. DOGE"
              />
            </div>
            <div
              class="flex bg-white shadow-md p-1 rounded-md shadow-md flex-wrap"
              v-if="this.suggestedCoinNames.length > 0"
            >
              <span
                v-for="coinName in this.suggestedCoinNames"
                :key="coinName"
                class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
                @click="addCoin(coinName)"
              >
                {{ coinName }}
              </span>
            </div>
            <div v-if="isAdded" class="text-sm text-red-600">
              This coin is already added
            </div>
          </div>
        </div>
        <button
          type="button"
          @click="addCoin(this.inputText)"
          class="my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          <svg
            class="-ml-0.5 mr-2 h-6 w-6"
            xmlns="http://www.w3.org/2000/svg"
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="#ffffff"
          >
            <path
              d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7zm-1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
            ></path>
          </svg>
          Add
        </button>
      </section>
      <hr
        v-if="this.coinList.length > 0"
        class="w-full border-t border-gray-600 my-4"
      />
      <div>
        Filter:
        <input v-model="filter" />
        <button
          v-if="page > 1"
          @click="page = +page - 1"
          class="ml-10 my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Back
        </button>
        <button
          @click="page = +page + 1"
          v-if="isLastPage"
          class="ml-5 my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Forward
        </button>
      </div>
      <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div
          v-for="coin in this.paginatedList"
          :key="coin.name"
          @click="currentCoin = coin"
          :class="currentCoin.name === coin.name ? 'border-4' : 'border-0'"
          class="bg-white overflow-hidden shadow rounded-lg border-purple-800 border-solid cursor-pointer"
        >
          <div class="px-4 py-5 sm:p-6 text-center">
            <dt class="text-sm font-medium text-gray-500 truncate">
              {{ coin.name }} - USD
            </dt>
            <dd class="mt-1 text-3xl font-semibold text-gray-900">
              {{ coin.price }}
            </dd>
          </div>
          <div class="w-full border-t border-gray-200"></div>
          <button
            @click.stop="removeCoin(coin)"
            class="flex items-center justify-center font-medium w-full bg-gray-100 px-4 py-4 sm:px-6 text-md text-gray-500 hover:text-gray-600 hover:bg-gray-200 hover:opacity-20 transition-all focus:outline-none"
          >
            <svg
              class="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="#718096"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                clip-rule="evenodd"
              ></path>
            </svg>
            Delete
          </button>
        </div>
      </dl>
      <hr
        class="w-full border-t border-gray-600 my-4"
        v-if="coinList.length > 0"
      />
      <section class="relative" v-if="currentCoin.name">
        <h3 class="text-lg leading-6 font-medium text-gray-900 my-8">
          {{ currentCoin.name }} - USD
        </h3>
        <div class="flex items-end border-gray-600 border-b border-l h-64">
          <div
            v-for="(percent, idx) in normalizedGraph"
            :key="idx"
            class="bg-purple-800 border w-10"
            :style="{ height: percent + '%' }"
          ></div>
        </div>
        <button
          type="button"
          class="absolute top-0 right-0"
          @click="currentCoin = ''"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            xmlns:svgjs="http://svgjs.com/svgjs"
            version="1.1"
            width="30"
            height="30"
            x="0"
            y="0"
            viewBox="0 0 511.76 511.76"
            style="enable-background: new 0 0 512 512"
            xml:space="preserve"
          >
            <g>
              <path
                d="M436.896,74.869c-99.84-99.819-262.208-99.819-362.048,0c-99.797,99.819-99.797,262.229,0,362.048    c49.92,49.899,115.477,74.837,181.035,74.837s131.093-24.939,181.013-74.837C536.715,337.099,536.715,174.688,436.896,74.869z     M361.461,331.317c8.341,8.341,8.341,21.824,0,30.165c-4.16,4.16-9.621,6.251-15.083,6.251c-5.461,0-10.923-2.091-15.083-6.251    l-75.413-75.435l-75.392,75.413c-4.181,4.16-9.643,6.251-15.083,6.251c-5.461,0-10.923-2.091-15.083-6.251    c-8.341-8.341-8.341-21.845,0-30.165l75.392-75.413l-75.413-75.413c-8.341-8.341-8.341-21.845,0-30.165    c8.32-8.341,21.824-8.341,30.165,0l75.413,75.413l75.413-75.413c8.341-8.341,21.824-8.341,30.165,0    c8.341,8.32,8.341,21.824,0,30.165l-75.413,75.413L361.461,331.317z"
                fill="#718096"
                data-original="#000000"
              ></path>
            </g>
          </svg>
        </button>
      </section>
    </div>
  </div>
</template>

<script>
import { getAvailableCoins, subscribeToCoin, unsubscribeFromCoin } from "@/api";

export default {
  name: "App",

  methods: {
    addCoin(name) {
      if (!this.checkIfAdded(name)) {
        const currentCoin = {
          name: name.toUpperCase(),
          price: 0,
        };
        this.coinList = [...this.coinList, currentCoin];
        subscribeToCoin(currentCoin.name.toLowerCase(), (price) =>
          this.updateCoinPrice(currentCoin.name, price)
        );
      }
    },

    removeCoin(coin) {
      if (this.currentCoin.name === coin.name) {
        this.currentCoin.name = "";
        this.currentCoin.price = 0;
        this.currentCoin.interval = 0;
      }
      this.coinList = this.coinList.filter((coin1) => coin1.name !== coin.name);
      unsubscribeFromCoin(coin.name);
    },

    checkIfAdded(name) {
      this.isAdded = this.coinList.some(
        (coin) => coin.name.toLowerCase() === name.toLowerCase()
      );
      return this.isAdded;
    },

    updateCoinPrice(name, price) {
      this.addPriceToGraph(name, price);
      this.coinList
        .filter((coin) => coin.name === name)
        .forEach((t) => (t.price = price));
    },
    addPriceToGraph(name, price) {
      if (name === this.currentCoin.name) {
        this.graph.push(price);
      }
    },
  },

  data() {
    return {
      isMounted: false,
      isAdded: false,
      inputText: "",
      filter: "",
      currentCoin: { name: "", price: 0 },
      graph: [],
      coinList: [],
      availableCoins: [],
      page: 1,
    };
  },
  computed: {
    suggestedCoinNames() {
      if (this.inputText) {
        return this.availableCoins
          .filter((coin) =>
            coin.toLowerCase().includes(this.inputText.toLowerCase())
          )
          .slice(0, 4);
      } else {
        return [];
      }
    },
    normalizedGraph() {
      const max = Math.max(...this.graph);
      const min = Math.min(...this.graph);
      if (max === min) {
        return this.graph.map(() => 50);
      }
      const diff = max - min;
      return this.graph.map((item) => ((item - min) / diff) * 95 + 5);
    },
    startPage() {
      return (+this.page - 1) * 6;
    },
    endPage() {
      return +this.page * 6;
    },
    filteredList() {
      return this.coinList.filter((coin) => {
        return coin.name.toLowerCase().includes(this.filter.toLowerCase());
      });
    },
    paginatedList() {
      return this.filteredList.slice(this.startPage, this.endPage);
    },
    isLastPage() {
      return this.endPage < this.filteredList.length;
    },
    pageStateOptions() {
      return {
        filter: this.filter,
        page: this.page,
      };
    },
  },

  created() {
    const windowData = Object.fromEntries(
      new URL(window.location).searchParams.entries()
    );

    if (windowData.filter) {
      this.filter = windowData.filter;
    }
    if (windowData.page) {
      this.page = windowData.page;
    }

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
    currentCoin() {
      this.graph = [];
    },
    coinList: {
      handler() {
        localStorage.setItem("coinList", JSON.stringify(this.coinList));
      },
      deep: true,
    },
    filter() {
      this.page = 1;
    },
    pageStateOptions(v) {
      this.currentCoin = { name: "", price: 0 };
      window.history.pushState({}, "", `?filter=${v.filter}&page=${v.page}`);
    },
  },
  async beforeMount() {
    this.isMounted = false;
    this.availableCoins = await getAvailableCoins();
  },
  mounted() {
    this.isMounted = true;
  },
};
</script>
