<template>
  <section class="section">
    <h1>{{ slice ? slice.slice_type : "New Slice" }} error</h1>
    <p>
      Prismic API references a `slice_type` that could not be matched by the
      SliceZone.
      <br />
      Did you register libraries path correctly?
    </p>
    <p>
      If you did, make sure this `slice_type` can be matched with one of your
      components.
    </p>
  </section>
</template>
<script>
export default {
  props: ["slice"],
  computed: {
    endpoint() {
      return this.$prismic.apiEndpoint.split("/").slice(0, -2).join("/");
    },
  },
};
</script>
<style scoped>
.section {
  position: relative;
  background: #ffff63;
  color: #111;
  padding: 4em;
  text-align: center;
  border-top: 1px solid #111;
  border-bottom: 1px solid #111;
}
</style>
