// This is the main.js file. Import global CSS and scripts here.
// The Client API can be used here. Learn more: gridsome.org/docs/client-api
import DefaultLayout from '~/layouts/Default.vue'

// import Buefy module and css
import Buefy from 'buefy'
import 'buefy/dist/buefy.css' 

export default function (Vue, { router, head, isClient }) {
  // Use Buefy for app styling
  Vue.use(Buefy)
  // Set default layout as a global component
  Vue.component('Layout', DefaultLayout)
}