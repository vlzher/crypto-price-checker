<template>
  <section class="relative">
    <h3 class="text-lg leading-6 font-medium text-gray-900 my-8">
      {{ currentCoinName }} - USD
    </h3>
    <div
      ref="graph"
      class="flex items-end border-gray-600 border-b border-l h-64"
    >
      <graph-component
        v-for="(percent, idx) in normalizedGraph"
        :key="idx"
        :percent="percent"
        class="bg-purple-800 border w-10"
        @graphComponentWidth="
          (width) => (this.graphParams.componentWidth = width)
        "
      />
    </div>
    <button type="button" class="absolute top-0 right-0" @click="closeGraph()">
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
</template>
<script>
import GraphComponent from "@/components/GraphComponent.vue";
export default {
  name: "GraphZone",
  components: {
    GraphComponent,
  },
  data() {
    return {
      graph: [],
      graphParams: { width: 0, componentWidth: 0 },
    };
  },
  props: {
    currentCoinName: String,
    newPrice: Number,
  },
  emits: {
    closeGraph: null,
  },
  methods: {
    addPriceToGraph(price) {
      this.graph.push(price);
    },
    closeGraph() {
      this.$emit("closeGraph");
    },
  },
  computed: {
    normalizedGraph() {
      const max = Math.max(...this.graph);
      const min = Math.min(...this.graph);
      if (max === min) {
        return this.graph.map(() => 50);
      }
      const diff = max - min;
      const maxElems = Math.round(
        this.graphParams.width / this.graphParams.componentWidth
      );
      const toSlice = this.graph.length > maxElems;
      let computedGraph = this.graph.map(
        (item) => ((item - min) / diff) * 95 + 5
      );
      if (toSlice) {
        computedGraph = computedGraph.slice(this.graph.length - maxElems);
      }
      return computedGraph;
    },
  },
  watch: {
    currentCoinName() {
      this.graph = [];
    },
    newPrice() {
      this.addPriceToGraph(this.newPrice);
    },
  },
  mounted() {
    this.graphParams.width = this.$refs.graph.offsetWidth;
    window.addEventListener("resize", () => {
      this.graphParams.width = this.$refs.graph?.offsetWidth;
    });
  },
  unmounted() {
    window.removeEventListener("resize", () => {
      this.graphParams.width = this.$refs.graph?.offsetWidth;
    });
  },
};
</script>
