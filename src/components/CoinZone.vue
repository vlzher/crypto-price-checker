<template>
  <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
    <div
      v-for="coin in this.paginatedList"
      :key="coin.name"
      @click="setCurrentCoin(coin)"
      :class="[
        currentCoinName === coin.name ? 'border-4' : 'border-0',
        coin.isValid ? 'bg-white-100' : 'bg-red-100',
      ]"
      class="overflow-hidden shadow rounded-lg border-purple-800 border-solid cursor-pointer"
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
</template>
<script>
export default {
  name: "CoinZone",
  props: {
    paginatedList: {
      type: Array,
      required: false,
    },
    currentCoinName: {
      type: String,
      required: false,
    },
  },
  methods: {
    setCurrentCoin(coin) {
      this.$emit("setCurrentCoin", coin);
    },
    removeCoin(coin) {
      this.$emit("removeCoin", coin);
    },
  },
};
</script>
