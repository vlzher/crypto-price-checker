<template>
  <div
    class="bg-purple-800 border w-10"
    :style="{ height: percent + '%' }"
    ref="graphComponent"
  ></div>
</template>
<script>
export default {
  name: "GraphComponent",
  props: {
    percent: Number,
  },
  mounted() {
    this.$emit("graphComponentWidth", this.$refs.graphComponent.offsetWidth);
  },
  emits: {
    graphComponentWidth: Number,
  },
};
</script>
