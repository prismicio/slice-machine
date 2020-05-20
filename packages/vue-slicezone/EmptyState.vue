<template>
  <main>
    <section class="box">
      <h1 class="title">Your SliceZone is empty </h1>
      <p>
        To start rendering components here, create a document on Prismic.<br />
        Then, update your SliceZone accordingly:<br />
      </p>
      <p>
        <code class="code">
          {{ code }}
        </code>
        
      </p>
      <a target="_blank" :href="endPath">Create a page on Prismic!</a>
    </section>
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
    // This is temporary
    const url = this.$prismic.apiEndpoint.replace('cdn.', '')
    const arr = url.split('/api/')
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
.box {
  max-width: 840px;
  padding: 44px;
  margin: 4em auto;
  background: #FFF;
  color: #111;
  text-align: left;
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.15);
}
.code {
  background: #F5F6FA;
  padding: 6px;
  margin: 1em auto;
  display: block;
}
.title {
  font-size: 32px;
  margin-bottom: 1em 0;
}
p {
  font-size: 22px;
  max-width: 650px;
  margin: 1em 0;
}
a {
  font-size: 24px;
  padding: 12px;
  color: #111;
}
a::after {
  content: "";
  background-image: url("https://images.prismic.io/test-sm1905/dfaddfb9-2146-4135-b043-785e7855994e_arrow-sm.svg?auto=compress,format");
  font-size: 18px;
  margin-left: 10px;
  width: 30px;
  display: inline-block;
  border-radius: 50%;
  height: 30px;
  color: #1D2230;
  vertical-align: center;
  top: 5px;
  position: relative;
}
</style>