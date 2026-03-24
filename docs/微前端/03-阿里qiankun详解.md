# 03-阿里qiankun详解

qiankun 是阿里团队开发的一款基于 single-spa 的微前端框架，是目前生态最完善、社区最活跃的微前端解决方案。

## 目录

1. [核心特性](#核心特性)
2. [核心概念](#核心概念)
3. [快速开始](#快速开始)
4. [主应用配置](#主应用配置)
5. [子应用开发](#子应用开发)
6. [通信机制](#通信机制)
7. [样式隔离](#样式隔离)
8. [路由管理](#路由管理)
9. [高级配置](#高级配置)
10. [性能优化](#性能优化)

---

## 核心特性

### 1. 基于 single-spa

qiankun 在 single-spa 的基础上进行了封装和增强：

```
single-spa：提供基础的生命周期管理
qiankun：在 single-spa 基础上增加了
         - JS 沙箱
         - CSS 样式隔离
         - HTML 入口加载
         - 预加载机制
         - 插件体系
```

### 2. 完整的生命周期

```
应用生命周期：
┌──────────┐
│ bootstrap │  初始化（只执行一次）
└────┬─────┘
     ↓
┌──────────┐
│  mount   │  挂载（每次进入应用执行）
└────┬─────┘
     ↓
┌──────────┐
│ unmount  │  卸载（每次离开应用执行）
└────┬─────┘
     ↓
┌──────────┐
│  update  │  更新（可选，qiankun 2.0+）
└──────────┘
```

### 3. HTML 入口加载

qiankun 支持直接加载子应用的 HTML 文件：

```javascript
// qiankun 自动解析 HTML 中的 JS 和 CSS
registerMicroApps([
    {
        name: 'vue-app',
        entry: '//localhost:8081',  // 直接写 HTML 地址
        container: '#container',
        activeRule: '/vue'
    }
]);
```

### 4. JS 沙箱

实现子应用之间的 JavaScript 上下文隔离：

```javascript
// 子应用A
window.userName = 'Alice';

// 子应用B（无法访问）
window.userName;  // undefined
```

### 5. CSS 样式隔离

自动处理子应用之间的样式冲突：

```css
/* 子应用A */
.order-page { background: red; }

/* 子应用B（不会覆盖子应用A）*/
.order-page[data-qiankun="vue-app"] { background: blue; }
```

---

## 核心概念

### 架构图

```
┌──────────────────────────────────────────────────────────────┐
│                         qiankun                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                      主应用                              │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │              registerMicroApps()                 │  │ │
│  │  │                  start()                         │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────┘ │
│                              │                               │
│              ┌───────────────┼───────────────┐              │
│              ↓               ↓               ↓              │
│        ┌──────────┐    ┌──────────┐    ┌──────────┐            │
│        │ Vue App  │    │ React App│    │Angular App│          │
│        └──────────┘    └──────────┘    └──────────┘            │
└──────────────────────────────────────────────────────────────┘
```

### 关键模块

| 模块 | 说明 |
|------|------|
| registerMicroApps | 注册子应用 |
| loadMicroApp | 手动加载子应用 |
| start | 启动 qiankun |
| initGlobalState | 初始化全局状态 |
| addGlobalUncaughtErrorHandler | 全局错误处理 |

---

## 快速开始

### 安装

```bash
npm install qiankun
```

### 基础项目结构

```
qiankun-project/
├── main-app/              # 主应用
│   ├── package.json
│   ├── vue.config.js
│   └── src/
│       ├── main.js
│       └── App.vue
│
├── child-vue/             # Vue 子应用
│   ├── package.json
│   ├── vue.config.js
│   └── src/
│       ├── main.js
│       └── public-path.js
│
└── child-react/           # React 子应用
    ├── package.json
    ├── webpack.config.js
    └── src/
        └── index.js
```

---

## 主应用配置

### Vue 3 主应用

#### 1. 安装依赖

```bash
cd main-app
npm install qiankun vue vue-router
```

#### 2. 主应用入口

```javascript
// src/main.js
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { registerMicroApps, start, setDefaultMountApp } from 'qiankun';

// 创建 Vue 实例
const app = createApp(App);
app.use(router);
app.mount('#app');

// ---------- qiankun 配置 ----------

// 1. 注册子应用
registerMicroApps([
    {
        name: 'vue-child',                    // 子应用名称
        entry: '//localhost:8081',             // 子应用入口
        container: '#micro-container',         // 挂载容器
        activeRule: '/vue-child',              // 激活规则
        // props: {},                         // 传递给子应用的参数
    },
    {
        name: 'react-child',
        entry: '//localhost:8082',
        container: '#micro-container',
        activeRule: '/react-child',
    },
]);

// 2. 设置默认跳转的子应用
setDefaultMountApp('/vue-child');

// 3. 启动 qiankun
start();

// 4. 可选：开启严格模式（未匹配的路径会报错）
start({ prefetch: 'all', singular: true });
```

#### 3. Vue 组件中使用

```vue
<!-- App.vue -->
<template>
    <div id="app">
        <!-- 导航 -->
        <nav>
            <router-link to="/">首页</router-link>
            <router-link to="/vue-child">Vue 子应用</router-link>
            <router-link to="/react-child">React 子应用</router-link>
        </nav>
        
        <!-- 子应用容器 -->
        <div id="micro-container"></div>
    </div>
</template>

<script>
export default {
    name: 'App'
};
</script>

<style>
#micro-container {
    min-height: 400px;
}
</style>
```

### Vue 2 主应用

```javascript
// src/main.js
import Vue from 'vue';
import App from './App.vue';
import router from './router';
import { registerMicroApps, start } from 'qiankun';

Vue.config.productionTip = false;

new Vue({
    router,
    render: h => h(App)
}).$mount('#app');

// 注册并启动
registerMicroApps([
    {
        name: 'vue-child',
        entry: '//localhost:8081',
        container: '#micro-container',
        activeRule: '/vue-child',
    }
]);

start();
```

### React 主应用

```jsx
// src/index.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { registerMicroApps, start } from 'qiankun';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </React.StrictMode>
);

// ---------- qiankun 配置 ----------

registerMicroApps([
    {
        name: 'vue-child',
        entry: '//localhost:8081',
        container: '#micro-container',
        activeRule: '/vue-child',
    },
    {
        name: 'react-child',
        entry: '//localhost:8082',
        container: '#micro-container',
        activeRule: '/react-child',
    },
]);

start();
```

```jsx
// App.jsx
import React from 'react';
import { Link, Route, Routes } from 'react-router-dom';

function App() {
    return (
        <div className="app">
            <nav>
                <Link to="/">首页</Link>
                <Link to="/vue-child">Vue 子应用</Link>
                <Link to="/react-child">React 子应用</Link>
            </nav>
            
            <div id="micro-container"></div>
            
            <Routes>
                <Route path="/" element={<div>主应用首页</div>} />
            </Routes>
        </div>
    );
}

export default App;
```

---

## 子应用开发

### Vue 3 子应用

#### 1. 安装依赖

```bash
npm install vue vue-router
```

#### 2. public-path.js（必须）

```javascript
// src/public-path.js
// 动态修改 publicPath，必须在入口文件最开始引入
if (window.__POWERED_BY_QIANKUN__) {
    __webpack_public_path__ = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__;
}
```

#### 3. 入口文件 main.js

```javascript
// src/main.js

// ★ 第一行：引入 public-path
import './public-path';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

let app = null;

function render(props = {}) {
    const { container } = props;
    
    app = createApp(App);
    app.use(router);
    
    // 如果有主应用传递的数据
    if (props.data) {
        app.config.globalProperties.$mainData = props.data;
    }
    
    // 挂载到指定容器
    app.mount(container ? container.querySelector('#app') : '#app');
}

// ---------- qiankun 生命周期 ----------

// 1. 初始化（只执行一次）
export async function bootstrap() {
    console.log('[vue-child] 应用初始化');
}

// 2. 挂载
export async function mount(props) {
    console.log('[vue-child] 应用挂载', props);
    render(props);
}

// 3. 卸载
export async function unmount(props) {
    console.log('[vue-child] 应用卸载', props);
    app.unmount();
    app = null;
}

// 4. 更新（qiankun 2.0+）
export async function update(props) {
    console.log('[vue-child] 应用更新', props);
}

// ---------- 非 qiankun 环境 ----------
if (!window.__POWERED_BY_QIANKUN__) {
    render();
}
```

#### 4. vue.config.js

```javascript
// vue.config.js
const { defineConfig } = require('@vue/cli-service');
const path = require('path');

module.exports = defineConfig({
    devServer: {
        port: 8081,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        // 禁用 host check
        disableHostCheck: true
    },
    configureWebpack: {
        output: {
            // 重要：子应用必须导出 library
            library: 'vue-child',
            libraryTarget: 'umd',
            // 重要：资源基础路径
            publicPath: 'http://localhost:8081/'
        },
        // 处理运营加载资源路径
        devtool: 'source-map'
    }
});
```

### Vue 2 子应用

#### 1. main.js

```javascript
// src/main.js
import './public-path';
import Vue from 'vue';
import App from './App.vue';
import router from './router';

Vue.config.productionTip = false;

let app = null;

function render(props = {}) {
    const { container } = props;
    
    app = new Vue({
        router,
        render: h => h(App)
    }).$mount(container ? container.querySelector('#app') : '#app');
}

// qiankun 生命周期
export async function bootstrap() {
    console.log('[vue-child] 初始化');
}

export async function mount(props) {
    console.log('[vue-child] 挂载', props);
    render(props);
}

export async function unmount(props) {
    console.log('[vue-child] 卸载');
    app.$destroy();
    app.$el.innerHTML = '';
    app = null;
}

// 非 qiankun 环境
if (!window.__POWERED_BY_QIANKUN__) {
    render();
}
```

#### 2. public-path.js

```javascript
// src/public-path.js
if (window.__POWERED_BY_QIANKUN__) {
    __webpack_public_path__ = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__;
}
```

### React 18 子应用

#### 1. 安装依赖

```bash
npm install react react-dom react-router-dom
npm install -D @craco/craco
```

#### 2. public-path.js

```javascript
// src/public-path.js
if (window.__POWERED_BY_QIANKUN__) {
    __webpack_public_path__ = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__;
}
```

#### 3. 入口 index.jsx

```jsx
// src/index.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './public-path';  // ★ 第一行
import './index.css';

let root = null;

function render(props = {}) {
    const { container } = props;
    
    root = ReactDOM.createRoot(
        container ? container.querySelector('#root') : document.getElementById('root')
    );
    
    root.render(
        <React.StrictMode>
            <App mainData={props.data} />
        </React.StrictMode>
    );
}

// qiankun 生命周期
export async function bootstrap() {
    console.log('[react-child] 初始化');
}

export async function mount(props) {
    console.log('[react-child] 挂载', props);
    render(props);
}

export async function unmount(props) {
    console.log('[react-child] 卸载');
    root.unmount();
    root = null;
}

// 非 qiankun 环境
if (!window.__POWERED_BY_QIANKUN__) {
    render();
}
```

#### 4. App.jsx

```jsx
// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

function App({ mainData }) {
    return (
        <BrowserRouter basename={window.__POWERED_BY_QIANKUN__ ? '/react-child' : '/'}>
            <div className="app">
                <h1>React 子应用</h1>
                <p>收到主应用数据：{JSON.stringify(mainData)}</p>
                
                <nav>
                    <Link to="/">首页</Link>
                    <Link to="/about">关于</Link>
                </nav>
                
                <Routes>
                    <Route path="/" element={<div>子应用首页</div>} />
                    <Route path="/about" element={<div>关于页面</div>} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;
```

#### 5. craco.config.js

```javascript
// craco.config.js
module.exports = {
    devServer: {
        port: 8082,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        disableHostCheck: true
    },
    webpack: {
        configure: (config) => {
            config.output = {
                ...config.output,
                library: 'react-child',
                libraryTarget: 'umd',
                publicPath: 'http://localhost:8082/'
            };
            return config;
        }
    }
};
```

---

## 通信机制

### 方式一：props 传递（最常用）

#### 主应用传递 props

```javascript
// 主应用
registerMicroApps([
    {
        name: 'vue-child',
        entry: '//localhost:8081',
        container: '#micro-container',
        activeRule: '/vue-child',
        props: {
            userName: '张三',
            token: 'abc123',
            onUserChange: (data) => console.log('用户变化', data)
        }
    }
]);
```

#### 子应用接收

```javascript
// Vue 3 子应用
export function mount(props) {
    console.log('收到主应用数据:', props);
    // { userName: '张三', token: 'abc123', onUserChange: fn }
    
    // 调用主应用方法
    props.onUserChange({ userId: 123 });
}
```

### 方式二：initGlobalState（全局状态）

#### 主应用

```javascript
// src/main.js
import { registerMicroApps, start, initGlobalState } from 'qiankun';

// 初始化全局状态
const initialState = {
    user: null
};

const actions = initGlobalState(initialState);

// 监听全局状态变化
actions.onGlobalStateChange((state, prev) => {
    console.log('[主应用] 状态变化', state, prev);
});

// 设置全局状态（所有子应用都能收到）
actions.setGlobalState({
    user: { name: '张三', age: 25 }
});

// 触发子应用重新渲染（不会通知子应用）
actions.offGlobalStateChange();
```

#### 子应用

```javascript
// 在入口文件中初始化
let actions = null;

export async function bootstrap() {
    console.log('[vue-child] 初始化');
}

export async function mount(props) {
    console.log('[vue-child] 挂载', props);
    
    // 获取 actions 实例
    actions = props;
    
    // 监听全局状态变化
    actions.onGlobalStateChange((state, prev) => {
        console.log('[vue-child] 收到全局状态变化', state, prev);
    }, true);  // true 表示立即触发一次
    
    // 修改全局状态
    actions.setGlobalState({
        user: { name: '李四', age: 30 }
    });
}

export async function unmount(props) {
    console.log('[vue-child] 卸载');
    
    // 取消监听
    if (actions) {
        actions.offGlobalStateChange();
    }
}
```

### 方式三：window 事件（简单场景）

```javascript
// 主应用
window.addEventListener('vue-child-message', (e) => {
    console.log('收到子应用消息:', e.detail);
});

// 子应用
window.dispatchEvent(new CustomEvent('main-app-message', {
    detail: { message: '来自子应用的消息' }
}));
```

---

## 样式隔离

### 默认行为

qiankun 会为每个子应用的样式添加前缀：

```css
/* 子应用A 的样式 */
.order-page { background: red; }

/* 编译后 */
.order-page[data-qiankun="vue-app"] { background: red; }
```

### experimentalStyleIsolation

```javascript
// 主应用开启实验性样式隔离
start({
    sandbox: {
        experimentalStyleIsolation: true
    }
});
```

### 手动处理

```javascript
// 子应用使用 CSS Modules 或 BEM 命名
// .order-page → .order-page--vue-app
```

---

## 路由管理

### 基座路由配置

```javascript
// 主应用 router/index.js
const routes = [
    {
        path: '/',
        component: () => import('./views/Home.vue')
    },
    // 子应用路由（不需要 component）
    {
        path: '/vue-child/*',  // 注意：使用通配符
        // component: null     // 不需要
    },
    {
        path: '/react-child/*',
    }
];
```

### 子应用路由

```javascript
// Vue 子应用 router/index.js
// 注意：basename 根据环境变化
const basename = window.__POWERED_BY_QIANKUN__ ? '/vue-child' : '/';

const router = createRouter({
    history: createWebHistory(basename),
    routes: [
        { path: '/', name: 'Home', component: Home },
        { path: '/about', name: 'About', component: About }
    ]
});
```

### React 子应用路由

```jsx
// App.jsx
function App({ mainData }) {
    const basename = window.__POWERED_BY_QIANKUN__ ? '/react-child' : '/';
    
    return (
        <BrowserRouter basename={basename}>
            {/* 路由内容 */}
        </BrowserRouter>
    );
}
```

---

## 高级配置

### start 配置项

```javascript
start({
    // prefetch: 预加载策略
    // - true: 立即加载所有子应用的依赖
    // - 'all': 懒加载所有子应用
    // - ['vue-child', 'react-child']: 只预加载指定子应用
    // - false: 不预加载
    prefetch: 'all',
    
    // singular: 是否单实例模式
    // true: 同一时间只运行一个子应用
    // false: 可以同时运行多个子应用
    singular: true,
    
    // sandbox: 沙箱配置
    sandbox: {
        // 实验性样式隔离
        experimentalStyleIsolation: false,
        
        // 严格的沙箱（性能更好但兼容性差）
        strictStyleIsolation: false,
        
        // 快照沙箱（兼容性最好）
        // - 'legacy': snapshotSandbox
        // - 'proxy': proxySandbox（默认）
        // - 'strict': proxySandbox + strict
        type: 'proxy'
    },
    
    // fetch: 自定义 fetch 方法
    fetch: window.fetch,
    
    // onGlobalStateChange: 全局状态变化回调
    onGlobalStateChange: (state, prev) => {},
    
    // onLostConnection: 连接丢失回调
    onLostConnection: (app) => {},
    
    // onRouteChange: 路由变化回调
    onRouteChange: (obj) => {}
});
```

### 手动加载子应用

```javascript
import { loadMicroApp } from 'qiankun';

// 手动加载子应用
const microApp = loadMicroApp({
    name: 'vue-child',
    entry: '//localhost:8081',
    container: '#custom-container',
    props: {
        userName: '张三'
    }
});

// 手动卸载
microApp.unmount();

// 手动更新（qiankun 2.0+）
microApp.update({
    userName: '李四'
});
```

### 全局错误处理

```javascript
import { addGlobalUncaughtErrorHandler } from 'qiankun';

// 添加全局错误处理器
addGlobalUncaughtErrorHandler((event) => {
    console.error('[qiankun] 全局错误', event);
    
    // 常见错误处理
    if (event.message && event.message.includes('xxxx')) {
        // 处理特定错误
    }
    
    // 返回 true 表示已处理，不再向上抛出
    return true;
});
```

---

## 性能优化

### 1. 预加载配置

```javascript
// 懒加载所有子应用（推荐）
start({
    prefetch: 'all'  // 浏览器空闲时预加载
});

// 或者只预加载指定子应用
start({
    prefetch: ['vue-child']  // 只预加载 vue-child
});
```

### 2. 禁用沙箱（性能敏感场景）

```javascript
start({
    sandbox: false  // 禁用沙箱，提升性能但失去隔离
});
```

### 3. 单实例模式

```javascript
// 只运行一个子应用，减少内存占用
start({
    singular: true
});
```

### 4. keep-alive

```javascript
// 子应用卸载时保留状态
registerMicroApps([
    {
        name: 'vue-child',
        entry: '//localhost:8081',
        container: '#container',
        activeRule: '/vue',
        keepAlive: true  // 保留实例，不真正卸载
    }
]);

// 需要在主应用容器上添加 keep-alive
<div id="micro-container" keep-alive></div>
```

---

## 下一步

下一章节：[04-字节跳动Garfish详解](./04-字节跳动Garfish详解.md)

---

*💡 提示：qiankun 文档：https://qiankun.umijs.org/*
