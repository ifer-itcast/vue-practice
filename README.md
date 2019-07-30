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

## 侧边栏

### axios 拦截器添加 token

通过接口获取列表数据，需要授权的 API，必修在请求头中使用 Authorization 字段提供 token 令牌

```javascript
axios.interceptors.request.use(config => {
    // 为请求头对象添加 Token 验证的 Authorization
    config.headers.Authorization = window.sessionStorage.getItem('token');
    return config;
});
```

```javascript
// 注意这样是对 POST 请求发送的数据进行转换的操作
axios.defaults.transformRequest = [function(data, headers) {
    const arr = [];
    for(let attr in data) {
        arr.push(`${attr}=${data[attr]}`); // ['name=ifer', 'age=18']
    }
    return arr.join('&');
}];
```

### 请求菜单栏列表数据

```javascript
async getMenuList() {
    const {data: res} = await this.$http.get('menus');
    if(res.meta.status !== 200) return this.$message.error(res.meta.msg);
    this.menuList = res.data;
}
```

## 首页

Home 组件的右侧用到了 <router-view></router-view> 进行占位，首页是 Welcome 组件

### 配置路由

```javascript
const router = new Router({
    routes: [
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
                }
            ]
        }
    ]
})
```

### 启用 el-menu 的路由功能

会以 el-menu-item 的 index 值作为跳转路径

```javascript
<el-menu :router="true"></el-menu>
// 或
<el-menu router></el-menu>
```

```javascript
<el-menu-item :index="'/'+subItem.path"></el-menu-item>
```

## 用户列表

- 点击高亮二级列表，并且刷新时保存状态

```javascript
saveNavState(activePath) {
    window.sessionStorage.setItem('activePath',activePath);
    this.activePath = activePath;
}
```

```javascript
<el-menu :default-active="activePath"></el-menu>
```

```javascript
// 在 created 钩子里面再进行初始化
created() {
    this.activePath = window.sessionStorage.getItem('activePath');
}
```

- 获取用户列表数据

```javascript
async getUserList() {
    const { data: res } = await this.$http.get('users', {
        params: this.queryInfo
    });
    console.log(res);
    if (res.meta.status !== 200) return this.$message.error('获取用户列表失败');
    this.userList = res.data.users;
    this.total = res.data.total;
}
```

```javascript
<el-table :data="userlist"></el-table>
```

- 自定义状态列/操作列的效果

```javascript
// 插槽
<el-table-column label="状态">
    <template slot-scope="scope">
        <el-switch @change="userStateChanged(scope.row)" v-model="scope.row.mg_state"></el-switch>
    </template>
</el-table-column>
```

```javascript
<el-table-column label="操作">
    <template width="180px">
        <!-- 修改 -->
        <el-button type="primary" size="mini" icon="el-icon-edit"></el-button>
        <!-- 删除 -->
        <el-button type="danger" size="mini" icon="el-icon-delete"></el-button>
        <!-- 分配角色 -->
        <el-tooltip content="分配角色" placement="top" :enterable="false">
            <el-button type="warning" size="mini" icon="el-icon-setting"></el-button>
        </el-tooltip>
    </template>
</el-table-column>
```

- 分页效果

```javascript
<el-pagination
    :current-page="queryInfo.pagenum"
    :page-sizes="[1, 2, 5, 10]"
    @size-change="handleSizeChange" // 每页显示多少条的切换
    :page-size="queryInfo.pagesize"
    @current-change="handleCurrentChange" // 页面变化
    layout="total, sizes, prev, pager, next, jumper"
    :total="total"
></el-pagination>
```

- 用户状态的更改同步到后台

```javascript
async userStateChanged(userinfo) {
    const { data: res } = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`);
    if (res.meta.status !== 200) {
        // 既然更新失败了，界面的状态也不需要变化
        userinfo.mg_state = !userinfo.mg_state;
        return this.$message.error('更新用户状态失败');
    }
    this.$message.success('更新用户状态成功');
},
```

- 搜索用户列表

- 添加用户

```javascript
<el-dialog></el-dialog>
```

```javascript
// 自定义校验规则
data() {
    // 自定义验证邮箱的规则
    let checkEmail = (rules, value, cb) => {
        const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
        if (regEmail.test(value)) {
            // 合法的邮箱
            return cb()
        }
        cb(new Error('请输入合法的邮箱'))
    }
    // 自定义验手机号的规则
    let checkMobile = (rules, value, cb) => {
        const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
        if (regMobile.test(value)) {
            return cb()
        }
        cb(new Error('请输入合法的手机号'))
    }
    return {};
}
```

```javascript
// 关闭对话框时初始化弹框数据，保证下次打开时还是默认状态
this.$refs.addFormRef.resetFields();
```

```javascript
// 添加用户前同样要进行数据校验的工作
addUser() {
    this.$refs.addFormRef.validate(async valid => {
        if(!valid) return;
    });
}
```

- 修改用户

根据 ID 查询用户信息，并填充到修改表单中

```javascript
this.$refs.editFormRef.validate(async valid => {
    if(!valid) return this.$message.error('验证不通过');
    const {data: res} = await this.$http.put('users/' + this.editForm.id, {
        emai: this.editForm.email,
        mobile: this.editForm.mobile
    });

    if(res.meta.status !== 200) {
        return this.$message.error('更新用户信息失败');
    }

    // 关闭对话框
    this.editDialogVisible = false;
    // 更新数据
    this.getUserList();
    // 提示修改成功
    this.$message.success('更新用户信息成功');
});
```

- 删除用户

```javascript
// 不需要 Vue.use(MessageBox)
Vue.prototype.$confirm = MessageBox.confirm
```

```javascript
async removeUserById(id) {
    const confirmRes = await this.$confirm('此操作将永久删除该用户，是否继续？','提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).catch(err => err);
    if(confirmRes !== 'confirm') {
        return this.$message.info('取消删除');
    }
    // 删除接口
    const {data: res} = await this.$http.delete('users/'+id)
    if(res.meta.status !== 200) {
        return this.$message.error('删除用户失败！');
    }
    this.$message.success('删除用户成功');
    this.getUserList();
}
```

## 权限列表

- 获取权限列表数据

```javascript
async getRightsList() {
    const {data: res} = await this.$http.get('rights/list')
    if(res.meta.status !== 200) {
        return this.$message.error('获取权限列表失败');
    }
    this.rightsList = res.data;
}
```

**用户**分为不同的**角色**，不同的角色对应不同的**权限**

## 角色列表

- 获取数据

```javascript
async getRolesList() {
  const {data: res} = await this.$http.get('roles');
  if(res.meta.status !== 200) {
    return this.$message.error('获取角色列表失败');
  }
  this.rolelist = res.data;
}
```

- 删除权限

- 权限列表

- 分配权限

- 用户列表的分配角色