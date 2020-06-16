import Vue from 'vue'
import GroupChat from './GroupChat.vue'

Vue.config.productionTip = false

new Vue({
  render: h => h(GroupChat),
}).$mount('#app')
