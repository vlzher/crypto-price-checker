<template>
  <hr class="w-full border-t border-gray-600 my-4" v-if="coinListLength > 0" />
</template>
<script>
export default {
  name: "SeparateLine",
  props: {
    coinListLength: Number,
  },
};
</script>
