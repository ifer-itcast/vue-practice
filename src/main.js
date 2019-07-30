import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 字体图标
import './assets/fonts/iconfont.css'
// 全局样式
import './assets/css/global.css'
import TreeTable from 'vue-table-with-tree-grid'
// 配置 axios
import axios from 'axios'
axios.interceptors.request.use(config => {
  // 为请求头对象添加 Token 验证的 Authorization
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
Vue.prototype.$http = axios

Vue.config.productionTip = false

Vue.component('tree-table', TreeTable)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
