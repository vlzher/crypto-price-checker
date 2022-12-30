<template>
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
</template>
<script>
export default {
  name: "FilterPageButtonSection",
  props: {
    coinList: Array,
  },
  data() {
    return {
      filter: "",
      page: 1,
    };
  },
  emits: {
    paginatedList: Array,
    turnOffGraph: null,
  },
  computed: {
    isLastPage() {
      return this.endPage < this.filteredList.length;
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
  },
  watch: {
    filter() {
      this.page = 1;
    },
    pageStateOptions(v) {
      window.history.pushState({}, "", `?filter=${v.filter}&page=${v.page}`);
      this.$emit("turnOffGraph");
    },
    paginatedList() {
      this.$emit("paginatedList", this.paginatedList);
    },
  },
};
</script>
