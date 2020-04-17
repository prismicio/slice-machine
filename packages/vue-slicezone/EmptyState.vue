<template>
  <main class="empty-state">
    <h1 class="title">Your SliceZone is empty</h1>
    <img class="empty-img" src="https://assets.website-files.com/5d5e2ff58f10c53dcffd8683/5d5e3088cfc85e573c6fd0a6_strolling.svg" />
    <p>
      To start rendering components here, create a document on Prismic.<br />
      Then, update your SliceZone accordingly:<br />
    </p>
    <p>
      <code class="empty-code">
        {{ code }}
      </code>
      
    </p>
    <a target="_blank" :href="endPath">Create a page on Prismic!</a>
  </main>
</template>
<script>
export default {
  props: ['type', 'uid', 'pathToDocs'],
  data() {
    if (!this.$prismic) {
      return {
        code: `<slice-zone 
          type="pageType"
          uid="pageUid"
        />`,
        endPath: 'https://prismic.io/dashboard'
      }
    }
    // This is extremely temporary
    const url = this.$prismic.api.data.oauth_initiate
    const arr = url.split('/')
    arr.pop()
    return {
      code: `<slice-zone 
          type="pageType"
          uid="pageUid"
        />`,
      endPath: arr.join('/').concat('/documents')
    }
  }
}
</script>
<style scoped>
.empty-state {
  padding: 44px;
  border: 1px dashed #333;
  margin: 1em auto;
  background: #FFF;
  color: #111;
  text-align: center;
}

.empty-code {
  background: #F5F6FA;
  padding: 6px;
  margin: 1em auto;
  display: block;
}
.empty-img {
  margin: 0 auto;
  max-width: 200px;
}
.title {
  font-size: 34px;
  margin-bottom: 1em;
}
p {
  font-size: 22px;
  max-width: 650px;
  margin: 1em auto;
}

a {
  font-size: 24px;
  padding: 12px;
  border: 3px solid #FF788F;
  color: #111;
}
</style>