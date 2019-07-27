# vue-practice

管理用户账号、商品分类、商品信息、订单、数据统计等业务功能。

## 项目初始化

- 用 `Vue CLI` 初始化项目

- 安装 `vue-cli-plugin-element` 插件，并配置按需加载

- 安装 `axios` 依赖

- 本地使用命令 `ssh-keygen -t rsa -C 'xxx@qq.com'` 生成SSH公钥，并添加到远端，通过 `ssh -T git@github.com`，码云的话使用 `ssh -T git@gitee.com` 进行测试

- 远端新建仓库

    ```javascript
    git config --global user.name 'xxx'
    git config --global user.email 'xxx@qq.com'
    git remote add origin http://xxx/test.git
    git push -u origin master
    ```

## 登录/退出

登录原理：用户输入用户名密码 **→** 服务端验证通过后生成该用户对应的 token 并返回 **→** 客户端拿到 token 进行存储 **→** 后续发送所有请求时都携带此 token **→** 服务端验证 token 是否合法并进行对应的响应

### 路由配置

**src/router.js**

```javascript
import Login from './components/Login.vue'

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
    ]
})

export default router
```

**src/App.vue**

```javascript
<template>
    <div id="app">
        <router-view></router-view>
    </div>
</template>
```

### 登录

- 安装 `less-loader`、`less` 开发依赖

- `main.js` 入口文件导入全局样式表 `global.css`，并设置全局的一些样式

- 使用`阿里妈妈`字体图标，入口文件 `main.js` 导入字体图标样式，使用如下：

    ```javascript
    <el-input prefix-icon="iconfont icon-user"></el-input>
    ```

- 实现表单的数据绑定，`<el-form :model="form"/>`

- **离开 input 框时前端进行数据验证**，`<el-form :rules="fules"/>`

- 表单重置，`this.$refs.loginFormRef.resetFields()`

- **点击登录按钮时前端进行数据校验**

    ```javascript
    this.$refs.loginFormRef.validate(async valid => {
        if (!valid) return
    })
    ```

- 为请求头对象添加 Token 验证的 Authorization

    ```javascript
    import axios from 'axios'
    axios.interceptors.request.use(config => {
        config.headers.Authorization = window.sessionStorage.getItem('token')
        return config
    })
    axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
    Vue.prototype.$http = axios
    ```

- 根据点击登录按钮时的前端验证结果决定是否发起请求

    ```javascript
    this.$refs.loginFormRef.validate(async valid => {
        // #1
        if (!valid) return
        const { data: res } = await this.$http.post('login', this.loginForm)
    })
    ```

- 配置全局提示信息框，反馈登录的结果

    ```javascript
    // plugins/element.js
    Vue.prototype.$message = Message
    ```

    ```javascript
    this.$refs.loginFormRef.validate(async valid => {
        // #2
        if (res.meta.status !== 200) return this.$message.error('登录失败')
        this.$message.success('登录成功')
    })
    ```

- 登录成功后设置 token 到 sessionStorage

    ```javascript
    this.$refs.loginFormRef.validate(async valid => {
        // #3
        // 下次再发起任何请求前就会在请求头带上从本地获取的 token
        window.sessionStorage.setItem('token', res.data.token)
        this.$router.push('/home')
    })
    ```

- 登录成功后通过编程式导航跳转到后台首页 /home

    ```javascript
    this.$refs.loginFormRef.validate(async valid => {
        // #4
        this.$router.push('/home')
    })
    ```

    ```javascript
    // 配置路由规则
    const router = new Router({
        routes: [
            {
                path: '/home',
                component: Home,
            }
        ]
    })
    ```

- 路由导航守卫控制页面的访问权限

    ```javascript
    router.beforeEach((to, from, next) => {
        // to: 将要访问的路径，from: 从哪个路径过来的
        // 如果访问的是登录页，直接放行
        if (to.path === '/login') return next()
        // 如果不是登录页，从本地获取 token
        const tokenStr = window.sessionStorage.getItem('token')
        // 如果没有 token 则跳转到登录，跳转到 / 也会重定向到 /login
        if (!tokenStr) return next('/login')
        // 有的话放行
        // 如果这个 token 不合法呢？
        next()
    })
    ```

### 退出

```javascript
window.sessionStorage.clear()
this.$router.push('/')
```

### 配置格式化规则

添加 `.prettierrc` 文件

```javascript
{
    "semi": false,
    "singleQuote": true
}
```

### 添加 ESLint 规则

修改 `.eslintrc` 文件

```javascript
module.exports = {
    rules: {
        'space-before-function-paren': 0
    },
}
```