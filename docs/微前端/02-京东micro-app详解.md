# 02-京东micro-app详解

micro-app 是京东团队开发的一款微前端框架，基于 Web Component 思想实现，特点是零依赖、轻量级、学习成本低。

## 目录

1. [核心特性](#核心特性)
2. [工作原理](#工作原理)
3. [快速开始](#快速开始)
4. [主应用配置](#主应用配置)
5. [子应用开发](#子应用开发)
6. [通信机制](#通信机制)
7. [样式隔离](#样式隔离)
8. [高级配置](#高级配置)
9. [常见问题](#常见问题)

---

## 核心特性

### 1. 零依赖

micro-app 没有任何外部依赖，压缩后仅约 16KB：

```bash
# 对比大小
micro-app:     ~16KB（零依赖）
qiankun:      ~60KB+（依赖 single-spa）
```

### 2. 基于 Web Component

使用 Custom Elements 和 Shadow DOM 实现沙箱隔离：

```html
<!-- micro-app 自动转换为 Web Component -->
<micro-app name="order-app" url="//localhost:8081" baseurl="/order"></micro-app>
```

### 3. 兼容所有框架

不依赖任何前端框架，原生支持 React、Vue、Angular、Svelte 等：

```
React → 需要导出 lifecycle
Vue   → 需要导出 lifecycle
Angular → 需要导出 lifecycle
Vanilla JS → 直接使用
```

### 4. 支持 JS 沙箱

在子应用之间实现 JavaScript 上下文隔离：

```javascript
// 子应用A
window.userName = 'Alice';
console.log(window.userName);  // 'Alice'

// 子应用B（无法访问子应用A的变量）
console.log(window.userName);  // undefined
```

---

## 工作原理

### 架构图

```
┌──────────────────────────────────────────────────────────┐
│                         主应用                             │
│  ┌────────────────────────────────────────────────────┐  │
│  │              <micro-app> 组件                       │  │
│  │  ┌──────────────────────────────────────────────┐  │  │
│  │  │              Shadow DOM                        │  │  │
│  │  │  ┌────────────────────────────────────────┐  │  │  │
│  │  │  │         子应用 iframe                   │  │  │  │
│  │  │  │  ┌──────────────────────────────────┐  │  │  │  │
│  │  │  │  │          JS 沙箱环境               │  │  │  │  │
│  │  │  │  └──────────────────────────────────┘  │  │  │  │
│  │  │  └────────────────────────────────────────┘  │  │  │
│  │  └──────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

### 实现原理

1. **UI 隔离**：通过 Shadow DOM 实现样式隔离
2. **JS 沙箱**：通过 Proxy 代理 window 对象实现 JS 隔离
3. **资源加载**：通过 fetch 加载 HTML，再创建 iframe 运行

---

## 快速开始

### 安装

```bash
# CDN 引入（无需安装）
<script src="https://cdn.jsdelivr.net/npm/micro-app@latest/dist/micro-app.min.js"></script>

# NPM 安装
npm install micro-app
```

### 基础项目结构

```
my-micro-frontend/
├── main-app/              # 主应用
│   ├── index.html
│   └── main.js
│
├── child-app-vue/         # Vue 子应用
│   ├── index.html
│   ├── vue.config.js
│   └── src/
│       └── main.js
│
└── child-app-react/       # React 子应用
    ├── index.html
    ├── package.json
    └── src/
        └── index.jsx
```

---

## 主应用配置

### 方式一：CDN 引入

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>主应用</title>
    <!-- 引入 micro-app -->
    <script src="https://cdn.jsdelivr.net/npm/micro-app@latest/dist/micro-app.min.js"></script>
</head>
<body>
    <div id="app">
        <h1>主应用</h1>
        
        <!-- 导航 -->
        <nav>
            <a href="/vue-app">Vue 子应用</a>
            <a href="/react-app">React 子应用</a>
        </nav>
        
        <!-- 挂载子应用 -->
        <micro-app 
            name="vue-app"           <!-- 子应用名称（必填） -->
            url="http://localhost:8081"  <!-- 子应用地址（必填） -->
            baseroute="/vue-app"      <!-- 基座路由（可选） -->
            :data="vueData"           <!-- 传递给子应用的数据 -->
        ></micro-app>
    </div>
</body>
</html>
```

### 方式二：Vue 组件引入

```javascript
// main.js
import Vue from 'vue';
import App from './App.vue';
import microApp from 'micro-app';

Vue.config.productionTip = false;

// 全局注册（所有子应用共享）
Vue.component('micro-app', microApp);

new Vue({
    render: h => h(App)
}).$mount('#app');
```

```vue
<!-- App.vue -->
<template>
    <div id="app">
        <h1>主应用（Vue）</h1>
        
        <nav>
            <router-link to="/vue-app">Vue 子应用</router-link>
            <router-link to="/react-app">React 子应用</router-link>
        </nav>
        
        <!-- 使用 micro-app 组件 -->
        <micro-app 
            name="vue-app"
            url="http://localhost:8081"
            baseroute="/vue-app"
            :data="vueData"
            @created="onCreated"
            @beforemount="onBeforeMount"
            @mounted="onMounted"
            @unmount="onUnmount"
            @error="onError"
            @datachange="onDataChange"
        ></micro-app>
    </div>
</template>

<script>
export default {
    name: 'App',
    data() {
        return {
            vueData: {
                userName: '张三',
                token: 'abc123'
            }
        };
    },
    methods: {
        onCreated() {
            console.log('子应用创建');
        },
        onBeforeMount() {
            console.log('子应用即将挂载');
        },
        onMounted() {
            console.log('子应用挂载完成');
        },
        onUnmount() {
            console.log('子应用卸载');
        },
        onError(e) {
            console.error('子应用加载失败', e);
        },
        onDataChange(e) {
            console.log('收到子应用数据', e.detail);
        }
    }
};
</script>
```

### 方式三：React 组件引入

```jsx
// index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import microApp from 'micro-app';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
```

```jsx
// App.jsx
import React, { useState, useEffect } from 'react';
import microApp from 'micro-app';

function App() {
    const [data, setData] = useState({ userName: '张三' });

    // 监听子应用数据
    useEffect(() => {
        const handler = (e) => {
            console.log('收到子应用数据:', e.detail.data);
            setData(e.detail.data);
        };
        
        window.addEventListener('vue-app-datachange', handler);
        return () => window.removeEventListener('vue-app-datachange', handler);
    }, []);

    return (
        <div className="app">
            <h1>主应用（React）</h1>
            
            <micro-app
                name="vue-app"
                url="http://localhost:8081"
                baseroute="/vue-app"
                :data={data}
                onCreated={() => console.log('子应用创建')}
                onMounted={() => console.log('子应用挂载')}
                onError={() => console.log('子应用加载失败')}
            />
        </div>
    );
}

export default App;
```

---

## 子应用开发

### Vue 子应用配置

#### 1. 安装依赖

```bash
cd child-app-vue
npm install vue vue-router
```

#### 2. vue.config.js 配置

```javascript
// vue.config.js
const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
    // 开发服务器配置
    devServer: {
        port: 8081,
        headers: {
            // 允许跨域（主应用加载子应用需要）
            'Access-Control-Allow-Origin': '*'
        }
    },
    configureWebpack: {
        output: {
            // 子应用必须使用 JSONP 格式导出
            library: 'vue-app',
            libraryTarget: 'umd',
            // 修改资源基础路径（子应用部署后需要）
            publicPath: 'http://localhost:8081/'
        }
    },
    chainWebpack: config => {
        config.plugin('html').tap(args => {
            // 子应用的 HTML 模板需要添加 micro-app 需要的属性
            args[0].microApp = 'vue-app';
            return args;
        });
    }
});
```

#### 3. Vue 3 子应用入口

```javascript
// src/main.js
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

// 创建 Vue 实例
const app = createApp(App);
app.use(router);
app.mount('#app');

// ---------- micro-app 必须的导出 ----------
// 1. 导出 Vue 实例（qiankun 兼容）
export function mount(props) {
    console.log('子应用被挂载，收到 props:', props);
    
    // 将主应用传递的数据传递给 Vue 实例
    app.config.globalProperties.$mainData = props.data;
    
    // 挂载到指定容器（如果需要）
    app.mount('#app');
}

// 2. 卸载生命周期
export function unmount() {
    console.log('子应用被卸载');
    app.unmount();
}

// 3. 可选：Bootstrap 生命周期
export function bootstrap() {
    console.log('子应用初始化');
    return Promise.resolve();
}

// 4. 可选：更新生命周期（qiankun 2.0+）
export function update(props) {
    console.log('子应用更新，收到 props:', props);
}

// ---------- 兼容 micro-app ----------
// micro-app 只需要 mount 和 unmount
if (!window.__MICRO_APP_ENVIRONMENT__) {
    // 非 micro-app 环境，直接挂载
    app.mount('#app');
}
```

#### 4. Vue 2 子应用入口

```javascript
// src/main.js
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

// ---------- micro-app 生命周期 ----------
export async function mount(props) {
    console.log('子应用被挂载', props);
    render(props);
}

export async function unmount() {
    console.log('子应用被卸载');
    app.$destroy();
    app.$el.innerHTML = '';
    app = null;
}

// ---------- 非 micro-app 环境 ----------
if (!window.__MICRO_APP_ENVIRONMENT__) {
    render();
}
```

### React 子应用配置

#### 1. 创建 React 应用

```bash
npx create-react-app child-app-react
cd child-app-react
npm install react-router-dom
```

#### 2. webpack 配置（使用 craco 或 react-scripts 覆盖）

```bash
npm install -D @craco/craco
```

```javascript
// craco.config.js
module.exports = {
    devServer: {
        port: 8082,
        headers: {
            'Access-Control-Allow-Origin': '*'
        }
    },
    configureWebpack: {
        output: {
            library: 'react-app',
            libraryTarget: 'umd',
            publicPath: 'http://localhost:8082/'
        }
    }
};
```

#### 3. React 18 子应用入口

```jsx
// src/index.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

// ---------- micro-app 生命周期 ----------

export async function mount(props) {
    console.log('React 子应用被挂载', props);
    
    // 将 props.data 传递给 React 应用
    window.__MICRO_APP_DATA__ = props.data;
    
    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
}

export async function unmount() {
    console.log('React 子应用被卸载');
    root.unmount();
}

export async function bootstrap() {
    console.log('React 子应用初始化');
}

// ---------- 非 micro-app 环境 ----------
if (!window.__MICRO_APP_ENVIRONMENT__) {
    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
}
```

#### 4. React 16/17 子应用入口

```jsx
// src/index.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

let root = null;

function render(props = {}) {
    const { container } = props;
    root = ReactDOM.createRoot(container ? container.querySelector('#root') : document.getElementById('root'));
    
    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
}

// micro-app 生命周期
export async function mount(props) {
    console.log('子应用挂载', props);
    render(props);
}

export async function unmount() {
    console.log('子应用卸载');
    root.unmount();
}

// 非 micro-app 环境
if (!window.__MICRO_APP_ENVIRONMENT__) {
    render();
}
```

---

## 通信机制

### 主应用向子应用通信

#### 方式一：通过 data 属性

```vue
<!-- 主应用（Vue） -->
<template>
    <micro-app
        name="vue-app"
        url="http://localhost:8081"
        :data="{ userName: '张三', token: 'abc123' }"
    />
</template>

<script>
export default {
    data() {
        return {
            userInfo: {
                userName: '张三',
                token: 'abc123'
            }
        };
    }
};
</script>
```

```javascript
// 子应用接收
export function mount(props) {
    console.log('收到主应用数据:', props.data);
    // { userName: '张三', token: 'abc123' }
}
```

#### 方式二：通过 dispatch 发送

```vue
<!-- 主应用（Vue） -->
<template>
    <micro-app
        ref="microAppRef"
        name="vue-app"
        url="http://localhost:8081"
    />
    <button @click="sendToChild">发送数据给子应用</button>
</template>

<script>
export default {
    methods: {
        sendToChild() {
            // 获取 micro-app 实例
            this.$refs.microAppRef.dispatch({
                type: 'user-login',
                data: { userId: 123, name: '张三' }
            });
        }
    }
};
</script>
```

### 子应用向主应用通信

#### 方式一：通过 dispatch 发送

```javascript
// 子应用
import microApp from 'micro-app';

// 获取主应用实例
const microAppInstance = microApp.getApp('vue-app');

// 发送数据给主应用
microAppInstance.dispatch({
    type: 'user-info-update',
    data: { userName: '李四', age: 25 }
});
```

#### 方式二：通过 window 事件

```javascript
// 子应用
window.dispatchEvent(new CustomEvent('vue-app-datachange', {
    detail: { userName: '李四', age: 25 }
}));
```

```javascript
// 主应用
window.addEventListener('vue-app-datachange', (e) => {
    console.log('收到子应用数据:', e.detail);
});
```

### 获取子应用实例

```javascript
import microApp from 'micro-app';

// 获取子应用实例
const app = microApp.getApp('vue-app');

if (app) {
    // 挂载状态
    console.log('是否挂载:', app.getStatus() === 'MOUNTED');
    
    // 发送数据
    app.dispatch({ type: 'test', data: {} });
    
    // 全局监听
    app.addGlobalDataListener((data) => {
        console.log('收到全局数据:', data);
    });
    
    // 卸载子应用
    app.unmount();
}
```

---

## 样式隔离

### Shadow DOM 模式（默认）

```html
<!-- micro-app 默认使用 Shadow DOM 隔离样式 -->
<micro-app name="vue-app" url="http://localhost:8081"></micro-app>

<!-- 
  子应用的样式会自动隔离在 Shadow DOM 中
  全局样式需要通过 :root 穿透
-->
```

### 样式穿透配置

```vue
<!-- 主应用 -->
<template>
    <micro-app
        name="vue-app"
        url="http://localhost:8081"
        :inline="true"              <!-- 内联模式 -->
        :destroy="false"            <!-- 卸载时保留 DOM -->
        :shadow="true"             <!-- 启用 Shadow DOM -->
    />
</template>
```

### 全局样式共享

```javascript
// 子应用（Vue）
// 通过 :root 或 :host 选择器穿透 Shadow DOM
:global(.button) {
    background: blue;
}
```

---

## 高级配置

### 完整配置项

```vue
<micro-app
    <!-- 必填项 -->
    name="vue-app"                              <!-- 子应用名称 -->
    url="http://localhost:8081"                 <!-- 子应用地址 -->
    
    <!-- 可选项 -->
    baseroute="/vue-app"                        <!-- 基座路由 -->
    :data="{}"                                  <!-- 传递的数据 -->
    :inline="false"                             <!-- 是否内联模式 -->
    :destroy="true"                              <!-- 卸载时销毁 -->
    :shadow="true"                              <!-- 启用 Shadow DOM -->
    :single-spa="false"                         <!-- 兼容 single-spa -->
    :forward-attributes="['data-title']"        <!-- 转发属性 -->
    
    <!-- 事件监听 -->
    @created="onCreated"
    @beforemount="onBeforeMount"
    @mounted="onMounted"
    @unmount="onUnmount"
    @error="onError"
    @datachange="onDataChange"
    @globalstatechange="onGlobalStateChange"
/>
```

### 配置说明

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| name | string | 必填 | 子应用名称，唯一标识 |
| url | string | 必填 | 子应用地址 |
| baseroute | string | '' | 子应用的路由前缀 |
| data | object | {} | 传递给子应用的初始数据 |
| inline | boolean | false | 是否使用内联模式 |
| destroy | boolean | true | 卸载时是否销毁子应用 |
| shadow | boolean | true | 是否启用 Shadow DOM |
| forward-attributes | array | [] | 转发给子应用的 HTML 属性 |

### 事件说明

| 事件 | 参数 | 触发时机 |
|------|------|----------|
| created | - | 子应用 HTML 加载完成 |
| beforemount | - | 子应用即将挂载 |
| mounted | - | 子应用挂载完成 |
| unmount | - | 子应用卸载完成 |
| error | Error | 子应用加载错误 |
| datachange | { detail: { data } } | 收到子应用数据 |
| globalstatechange | { detail: { state } } | 全局状态变化 |

### 多实例支持

```vue
<!-- 同一子应用的不同实例 -->
<micro-app
    name="order-app"
    url="http://localhost:8081"
    baseroute="/order/list"
    :data="{ orderType: 'list' }"
/>

<micro-app
    name="order-app"
    url="http://localhost:8081"
    baseroute="/order/detail"
    :data="{ orderType: 'detail' }"
/>
```

### 预加载子应用

```javascript
import microApp from 'micro-app';

// 预加载子应用（提前加载，不立即挂载）
microApp.preFetch('vue-app', 'http://localhost:8081');

// 预加载多个子应用
Promise.all([
    microApp.preFetch('vue-app', 'http://localhost:8081'),
    microApp.preFetch('react-app', 'http://localhost:8082'),
]);
```

### 全局配置

```javascript
import microApp from 'micro-app';

// 全局配置
microApp.configure({
    // 是否显示日志
    'log': true,
    // 是否开启静默模式
    'silent': false,
    // 全局插件配置
    'plugins': {
        modules: {
            'vue-app': [{ loader: (code, url) => {
                // 自定义 loader
                if (url.includes('main.js')) {
                    // 修改代码
                }
                return code;
            }}]
        }
    }
});
```

---

## 常见问题

### 1. 子应用跨域问题

确保子应用开发服务器配置了允许跨域：

```javascript
// vue.config.js
module.exports = {
    devServer: {
        headers: {
            'Access-Control-Allow-Origin': '*'
        }
    }
};
```

### 2. 静态资源路径问题

子应用的 `publicPath` 需要配置正确：

```javascript
// vue.config.js
module.exports = {
    configureWebpack: {
        output: {
            publicPath: 'http://localhost:8081/'
        }
    }
};
```

### 3. 样式不生效

检查是否使用了 Shadow DOM：

```javascript
// 如果子应用样式不生效，可能需要关闭 Shadow DOM
<micro-app name="vue-app" url="http://localhost:8081" :shadow="false" />
```

### 4. 获取子应用数据失败

子应用需要在合适的时候发送数据：

```javascript
// 子应用（Vue）
export function mount(props) {
    const app = createApp(App);
    
    // 在 mounted 后发送数据
    setTimeout(() => {
        // 方式1：通过 dispatch
        microApp.getApp('vue-app')?.dispatch({
            type: 'ready',
            data: { message: '子应用已就绪' }
        });
        
        // 方式2：通过 window 事件
        window.dispatchEvent(new CustomEvent('vue-app-datachange', {
            detail: { message: '子应用已就绪' }
        }));
    }, 0);
}
```

### 5. 子应用路由不生效

确保 `baseroute` 配置正确：

```vue
<!-- baseroute 必须与主应用的路由路径一致 -->
<micro-app
    name="vue-app"
    url="http://localhost:8081"
    baseroute="/vue-app"
/>
```

---

## 下一步

下一章节：[03-阿里qiankun详解](./03-阿里qiankun详解.md)

---

*💡 提示：micro-app 文档：https://micro-zoe.github.io/micro-app/*
