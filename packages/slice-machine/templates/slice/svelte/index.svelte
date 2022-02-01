<script>
  import PrismicDom from 'prismic-dom'
  export let slice
</script>
<style>
  section {
    max-width: 600px;
    margin: 4em auto;
    text-align: center;
  }
  .title {
    color: #8592e0;
  }
</style>

<section>
  
  <span class="title">
    {#if slice.primary.title}
    {@html PrismicDom.RichText.asHtml(slice.primary.title)}     
    {:else}
    <h2>Template slice, update me!</h2>
    {/if}
  </span>

  {#if slice.primary.description}
  {@html PrismicDom.RichText.asHtml(slice.primary.description)}     
  {:else}
  <p>start by editing this slice from inside Slice Machine!</p>
  {/if}

</section>
