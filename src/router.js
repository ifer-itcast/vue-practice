import Vue from 'vue'
import Router from 'vue-router'
import Login from './components/Login.vue'
import Home from './components/Home.vue'
import Welcome from './components/Welcome.vue'
import Users from './components/user/Users.vue'
import Rights from './components/power/Rights.vue'
import Roles from './components/power/Roles.vue'
import Cate from './components/goods/Cate.vue'
import Params from './components/goods/Params.vue'

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      component: Login
    },
    {
      path: '/home',
      component: Home,
      redirect: '/welcome',
      // 设置子路由能保证显示welcome的时候也出现home
      children: [
        {
          path: '/welcome',
          component: Welcome
        },
        {
          path: '/users',
          component: Users
        },
        {
          path: '/rights',
          component: Rights
        },
        {
          path: '/roles',
          component: Roles
        },
        {
          path: '/categories',
          component: Cate
        },
        {
          path: '/params',
          component: Params
        }
      ]
    }
  ]
})

router.beforeEach((to, from, next) => {
  // to: 将要访问的路径
  // from: 从哪个路径过来的
  // 如果访问的是登录页，直接放行
  if (to.path === '/login') return next()
  // 如果不是登录页，从本地获取 token
  const tokenStr = window.sessionStorage.getItem('token')
  // 如果没有 token 则跳转到登录
  if (!tokenStr) return next('/login')
  // 有的话放行
  next()
})

export default router
