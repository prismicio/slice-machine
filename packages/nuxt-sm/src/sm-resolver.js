import Vue from 'vue'

export default async (_, inject) => {
  let sliceMachine = new Vue({
    methods: {
      resolver({ sliceName, i }) {
        return <%= options.imports %>
      }
    }
  })
  inject('sliceMachine', sliceMachine);
}
