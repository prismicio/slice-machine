<template>
  <div>
    <p v-if="error">
      An error occurred while fetching content:
      <span style="color: tomato">{{ error }}</span>
    </p>
  </div>
</template>

<script>
export default {
  props: {
    error: {
      default: "",
    },
  },
};
</script>
