<template>
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
    <add-coin-button @addCoin="addCoin(this.inputText)" />
  </section>
</template>
<script>
import AddCoinButton from "./AddCoinButton.vue";
import { getAvailableCoins } from "@/api/api";

export default {
  name: "AddCoinSection",
  components: {
    AddCoinButton,
  },
  data() {
    return {
      inputText: "",
      isAdded: false,
      availableCoins: [],
    };
  },
  props: {
    checkIfAdded: Function,
  },
  emits: {
    addCoinSection: String,
  },
  methods: {
    addCoin(coinName) {
      this.isAdded = this.checkIfAdded(coinName);
      if (this.isAdded) {
        return;
      }
      this.$emit("addCoinSection", coinName);
    },
  },
  computed: {
    suggestedCoinNames() {
      if (!this.inputText) return [];
      return this.availableCoins
        .filter((coin) =>
          coin.toLowerCase().includes(this.inputText.toLowerCase())
        )
        .slice(0, 4);
    },
  },
  async beforeMount() {
    this.availableCoins = await getAvailableCoins();
  },
  watch: {
    inputText() {
      this.isAdded = false;
    },
  },
};
</script>
