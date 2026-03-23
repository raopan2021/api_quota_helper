# 微前端框架详解教程

> 本文档详细介绍当前流行的几款微前端框架，涵盖核心原理、配置步骤、通讯机制、样式隔离等关键内容。

## 目录

1. [single-spa - 最早期的微前端方案](#1-single-spa---最早期的微前端方案)
2. [qiankun - 蚂蚁金服微前端解决方案](#2-qiankun---蚂蚁金服微前端解决方案)
3. [Webpack Module Federation - Webpack 原生微前端方案](#3-webpack-module-federation---webpack-原生微前端方案)
4. [EMP - 欢聚时代微前端方案](#4-emp---欢聚时代微前端方案)
5. [micro-app - 京东微前端方案](#5-micro-app---京东微前端方案)
6. [框架对比总结](#6-框架对比总结)

---

## 1. single-spa - 最早期的微前端方案

### 1.1 简介

`single-spa` 是最早的微前端框架，由 Canopy Platform 开发。它不依赖任何框架，可以在同一个页面中同时运行多个 Vue、React、Angular、Svelte 等框架的应用。

### 1.2 核心原理

single-spa 通过 URL 的变化来决定挂载/卸载哪个应用。它本质上是一个路由管理器，不负责应用的渲染，只负责应用的生命周期管理。

### 1.3 核心概念

- **应用 (Application)**：被 single-spa 管理的子应用，可以是 Vue、React、Angular 等
- **生命周期 (Lifecycle)**：应用的加载、挂载、卸载、错误处理等钩子
- **路由 (Router)**：通过 URL 变化来触发应用的挂载/卸载

### 1.4 快速开始

#### 1.4.1 主应用安装

```bash
npm install single-spa
```

#### 1.4.2 主应用配置

```javascript
// main.js
import { registerApplication, start } from 'single-spa';

// 注册子应用
registerApplication(
  'react-app', // 应用名称
  () => import('http://localhost:3001/react-app.js'), // 加载函数
  (activityFunction) => {
    // 路径匹配规则，返回 true 表示该应用需要被激活
    return window.location.pathname.startsWith('/react');
  },
  { // 可选：传递给子应用的 props
    message: 'Hello from main app'
  }
);

// 启动 single-spa
start();
```

#### 1.4.3 子应用导出生命周期

single-spa 要求子应用导出特定的 lifecycle 函数：

```javascript
// react 子应用 - src/single-spa-react-app.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// 加载函数 - 返回一个 Promise
export function bootstrap(props) {
  console.log('React App 初始化', props);
  return Promise.resolve();
}

// 挂载函数 - 返回一个 Promise
export function mount(props) {
  console.log('React App 挂载', props);
  const container = document.getElementById('react-root');
  
  if (!container) {
    const newContainer = document.createElement('div');
    newContainer.id = 'react-root';
    document.body.appendChild(newContainer);
  }
  
  ReactDOM.createRoot(newContainer).render(<App />);
  return Promise.resolve();
}

// 卸载函数 - 返回一个 Promise
export function unmount(props) {
  console.log('React App 卸载', props);
  const container = document.getElementById('react-root');
  if (container) {
    ReactDOM.createRoot(container).unmount();
    container.remove();
  }
  return Promise.resolve();
}

// 可选：全局错误处理
export function unload(props) {
  console.log('React App 卸载实例', props);
  return Promise.resolve();
}
```

#### 1.4.4 Vue 子应用示例

```javascript
// vue 子应用 - src/single-spa-vue-app.js
import { createApp } from 'vue';
import App from './App.vue';

let app = null;

export function bootstrap() {
  console.log('Vue App 初始化');
  return Promise.resolve();
}

export function mount(props) {
  console.log('Vue App 挂载', props);
  const container = document.getElementById('vue-root') || createContainer();
  
  app = createApp(App);
  app.provide('mainAppProps', props); // 接收主应用传递的 props
  app.mount(container);
  
  return Promise.resolve();
}

export function unmount() {
  console.log('Vue App 卸载');
  if (app) {
    app.unmount();
    app = null;
  }
  return Promise.resolve();
}

function createContainer() {
  const container = document.createElement('div');
  container.id = 'vue-root';
  document.body.appendChild(container);
  return container;
}
```

### 1.5 应用场景与 Activity Function

Activity function 决定应用何时被激活：

```javascript
// 精确路径匹配
registerApplication(
  'app1',
  () => import('./app1.js'),
  () => window.location.pathname === '/app1'
);

// 前缀匹配
registerApplication(
  'app2',
  () => import('./app2.js'),
  () => window.location.pathname.startsWith('/app2')
);

// 多路径匹配
registerApplication(
  'app3',
  () => import('./app3.js'),
  () => ['/app3', '/app3-detail', '/app3-settings'].some(
    path => window.location.pathname.startsWith(path)
  )
);
```

### 1.6 样式隔离

single-spa 本身不提供样式隔离，需要手动处理：

#### 方案一：CSS Modules

```javascript
// webpack 配置中使用 css-loader 的 modules 选项
{
  test: /\.css$/,
  use: [
    'style-loader',
    {
      loader: 'css-loader',
      options: {
        modules: {
          localIdentName: '[name]__[local]--[hash:base64:5]'
        }
      }
    }
  ]
}
```

#### 方案二：CSS 命名空间

```css
/* 子应用根元素添加唯一的类名前缀 */
.react-app-container .button {
  color: blue;
}
```

### 1.7 应用间通讯

single-spa 通过 props 机制进行通讯：

```javascript
// 主应用 - 创建全局事件总线
const eventBus = {
  listeners: {},
  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
    return () => {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    };
  },
  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }
};

// 注册时传递通讯机制
registerApplication(
  'react-app',
  () => import('./react-app.js'),
  () => window.location.pathname.startsWith('/react'),
  { eventBus }
);
```

### 1.8 优缺点分析

**优点：**
- 轻量级（核心约 10KB）
- 框架无关，可混用 Vue、React、Angular 等
- 学习成本低，API 简洁
- 社区成熟，生态丰富

**缺点：**
- 不提供样式隔离，需自行处理
- 没有 JS 沙箱环境
- 子应用需要改造（导出 lifecycle）
- 没有预加载能力

### 1.9 适用场景

- 需要在同一页面混合使用多个框架
- 子应用可以接受一定改造
- 对性能要求较高，需要手动优化

---

## 2. qiankun - 蚂蚁金服微前端解决方案

### 2.1 简介

`qiankun` 是蚂蚁金服基于 `single-spa` 封装的微前端解决方案，提供了开箱即用的功能，包括 JS 沙箱、样式隔离、预加载等。

### 2.2 核心原理

qiankun 在 single-spa 的基础上增加了：
1. **JS 沙箱**：通过 Proxy 代理全局变量，实现子应用间的 JS 隔离
2. **样式隔离**：通过 CSS Module 或自定义 CSS 前缀实现样式隔离
3. **预加载**：应用空闲时预先加载子应用资源
4. **自动卸载**：子应用路由失活时自动卸载

### 2.3 快速开始

#### 2.3.1 主应用安装

```bash
npm install qiankun
```

#### 2.3.2 主应用配置

```javascript
// main.js
import { registerMicroApps, start } from 'qiankun';

// 注册子应用
registerMicroApps(
  [
    {
      name: 'react-app',
      entry: '//localhost:3001', // 子应用入口
      container: '#micro-app-root',
      activeRule: '/react',
      props: {
        message: 'Hello from main app'
      }
    },
    {
      name: 'vue-app',
      entry: '//localhost:3002',
      container: '#micro-app-root',
      activeRule: '/vue'
    }
  ],
  {
    // 全局生命周期钩子
    beforeLoad: [app => console.log('[主应用] before load', app.name)],
    beforeMount: [app => console.log('[主应用] before mount', app.name)],
    afterMount: [app => console.log('[主应用] after mount', app.name)],
    beforeUnmount: [app => console.log('[主应用] before unmount', app.name)],
    afterUnmount: [app => console.log('[主应用] after unmount', app.name)],
    loadErrorHandler: (app, e) => console.error('[主应用] load error', app.name, e)
  }
);

// 启动 qiankun
start({
  strictStyleIsolation: true // 开启严格样式隔离
});
```

### 2.4 子应用配置

#### 2.4.1 React 子应用配置

```javascript
// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

let root = null;

function render(props) {
  const { container } = props || {};
  root = ReactDOM.createRoot(
    container ? container.querySelector('#root') : document.getElementById('root')
  );
  root.render(<React.StrictMode><App /></React.StrictMode>);
}

// 独立运行时的入口
if (!window.__POWERED_BY_QIANKUN__) {
  render({});
}

// ============ qiankun 生命周期 ============
export async function bootstrap() {
  console.log('[React 子应用] bootstrap');
}

export async function mount(props) {
  console.log('[React 子应用] mount', props);
  render(props);
}

export async function unmount(props) {
  console.log('[React 子应用] unmount');
  if (root) {
    root.unmount();
    root = null;
  }
}

export async function update(props) {
  console.log('[React 子应用] update', props);
}
```

#### 2.4.2 Vue 子应用配置

```javascript
// vue.config.js
const { name } = require('./package.json');

module.exports = {
  devServer: {
    port: 3002,
    disableHostCheck: true,
    headers: { 'Access-Control-Allow-Origin': '*' }
  },
  configureWebpack: {
    output: {
      library: `${name}-[name]`,
      libraryTarget: 'umd',
      jsonpFunction: `webpackJsonp_${name}`
    }
  }
};
```

```javascript
// src/main.js
import Vue from 'vue';
import App from './App.vue';

let instance = null;

function render(props = {}) {
  const { container } = props;
  instance = new Vue({ render: h => h(App) })
    .$mount(container ? container.querySelector('#app') : '#app');
}

if (!window.__POWERED_BY_QIANKUN__) {
  render();
}

export async function bootstrap() { console.log('[Vue 子应用] bootstrap'); }
export async function mount(props) { console.log('[Vue 子应用] mount', props); render(props); }
export async function unmount() { console.log('[Vue 子应用] unmount'); instance.$destroy(); instance = null; }
export async function update(props) { console.log('[Vue 子应用] update', props); }
```

### 2.5 应用间通讯

#### 2.5.1 使用 initGlobalState（推荐）

```javascript
// main.js - 主应用
import { initGlobalState } from 'qiankun';

const initialState = { user: null };
const actions = initGlobalState(initialState);

// 监听全局状态变化
actions.onGlobalStateChange((state, prev) => {
  console.log('[主应用] 状态变更', state, prev);
});

// 设置全局状态
actions.setGlobalState({ user: { name: 'test' } });
```

```javascript
// 子应用中使用
export async function mount(props) {
  // 监听主应用状态变化
  props.onGlobalStateChange?.((state, prev) => {
    console.log('[子应用] 状态变化:', state, prev);
  }, true);
  
  // 修改全局状态
  props.setGlobalState?.({ user: { name: '子应用用户' } });
}
```

### 2.6 JS 沙箱原理

qiankun 通过 Proxy 实现 JS 沙箱：

```javascript
// 沙箱原理示意
class SandBox {
  constructor(name) {
    this.name = name;
    this.proxyWindow = new Proxy(window, {
      get(target, prop) {
        return sandboxProps[prop] ?? target[prop];
      },
      set(target, prop, value) {
        sandboxProps[prop] = value;
        return true;
      }
    });
  }
  
  active() {
    this.snapshot = new Map(Object.entries(window));
  }
  
  inactive() {
    Object.keys(sandboxProps).forEach(key => {
      if (!this.snapshot.has(key)) {
        delete window[key];
      } else {
        window[key] = this.snapshot.get(key);
      }
    });
  }
}
```

### 2.7 预加载机制

```javascript
start({
  prefetch: 'all', // 'all' | 'lazy' | []
  // 或自定义预加载策略
  prefetch: async (apps) => {
    await requestIdleCallback(async () => {
      for (const app of apps) {
        await loadMicroApp(app);
      }
    });
  }
});
```

### 2.8 优缺点分析

**优点：**
- 基于 single-spa，API 简洁易用
- 开箱即用：JS 沙箱、样式隔离、预加载等
- 社区活跃，文档完善
- 支持预加载子应用，提升体验

**缺点：**
- 对子应用有侵入性（需要导出 lifecycle）
- 样式隔离方案仍有局限性
- Shadow DOM 方案有兼容性问题

### 2.9 适用场景

- 企业级中后台应用
- 需要技术栈统一的微前端架构
- 对性能和体验有较高要求

---

## 3. Webpack Module Federation - Webpack 原生微前端方案

### 3.1 简介

`Module Federation` 是 Webpack 5 引入的原生模块共享方案，允许独立构建的应用在运行时共享模块。

### 3.2 核心概念

- **Host（主持人）**：动态加载其他应用模块的应用
- **Remote（远程模块）**：被其他应用动态加载的应用
- **Exposed Module（暴露模块）**：Remote 主动暴露给 Host 使用的模块
- **Shared Module（共享模块）**：Host 和 Remote 之间共享的模块

### 3.3 快速开始

#### 3.3.1 主应用配置（Host）

```javascript
// webpack.config.js
const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'host_app',
      shared: {
        react: { singleton: true, requiredVersion: '^17.0.0' },
        'react-dom': { singleton: true, requiredVersion: '^17.0.0' }
      }
    })
  ]
};
```

```jsx
// src/App.jsx - 动态加载 Remote 模块
import React, { Suspense } from 'react';

const RemoteButton = React.lazy(() => import('remote_app/RemoteButton'));

function App() {
  return (
    <div>
      <h1>Host 应用</h1>
      <Suspense fallback={<div>加载中...</div>}>
        <RemoteButton label="Remote 按钮" />
      </Suspense>
    </div>
  );
}
```

#### 3.3.2 子应用配置（Remote）

```javascript
// webpack.config.js
module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'remote_app',
      exposes: {
        './RemoteButton': './src/components/RemoteButton.jsx'
      },
      shared: {
        react: { singleton: true, requiredVersion: '^17.0.0' },
        'react-dom': { singleton: true, requiredVersion: '^17.0.0' }
      }
    })
  ]
};
```

```jsx
// src/components/RemoteButton.jsx
import React from 'react';

function RemoteButton({ label = 'Remote Button', onClick }) {
  return <button className="remote-button" onClick={onClick}>{label}</button>;
}

export default RemoteButton;
```

### 3.4 共享模块配置详解

```javascript
shared: {
  react: {
    singleton: true,        // 单例模式，避免多个实例
    strictVersion: true,    // 严格版本匹配
    requiredVersion: '^17.0.0',
    eager: false,           // 非贪婪模式，按需加载
    packageName: 'react'
  }
}
```

### 3.5 应用间通讯

Module Federation 本身不提供通讯机制，需要配合其他方案：

```javascript
// 通讯工具类
class MicroAppEventBus {
  constructor() { this.listeners = new Map(); }
  
  emit(event, data) {
    (this.listeners.get(event) || []).forEach(cb => cb(data));
  }
  
  on(event, callback) {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event).push(callback);
    return () => {
      const cbs = this.listeners.get(event);
      const idx = cbs.indexOf(callback);
      if (idx > -1) cbs.splice(idx, 1);
    };
  }
}

window.microAppEvents = new MicroAppEventBus();
```

### 3.6 优缺点分析

**优点：**
- Webpack 原生支持，无需额外依赖
- 真正的模块共享，减少重复打包
- 运行时共享，减少内存占用
- 灵活的共享策略配置

**缺点：**
- 需要 Webpack 5 或对应构建工具
- 不是完整的微前端方案，需配合路由管理
- 调试相对困难
- 不支持样式隔离

### 3.7 适用场景

- 多应用间需要共享组件/状态
- 希望减少整体打包体积
- 已有 Webpack 5 构建的项目

---

## 4. EMP - 欢聚时代微前端方案

### 4.1 简介

`EMP`（Enterprise Microfrontend Platform）是欢聚时代开源的微前端解决方案，基于 Webpack Module Federation 开发，提供了更完善的上层封装。

### 4.2 快速开始

#### 4.2.1 主应用安装

```bash
npm install @efox/emp
```

#### 4.2.2 主应用配置

```javascript
// emp.config.js
const { defineConfig } = require('@efox/emp');

module.exports = defineConfig({
  name: 'host-app',
  deploy: { publicPath: 'http://localhost:3000/' },
  shared: {
    react: { singleton: true, requiredVersion: '^17.0.0' },
    'react-dom': { singleton: true, requiredVersion: '^17.0.0' }
  },
  microApps: [
    { name: 'react-app', entry: 'http://localhost:3001', activePath: '/react' },
    { name: 'vue-app', entry: 'http://localhost:3002', activePath: '/vue' }
  ]
});
```

### 4.3 子应用配置

```javascript
// emp.config.js - 子应用
const { defineConfig } = require('@efox/emp');

module.exports = defineConfig({
  name: 'react-app',
  deploy: { publicPath: 'http://localhost:3001/' },
  exposes: {
    './Button': './src/components/Button.jsx'
  },
  shared: {
    react: { singleton: true },
    'react-dom': { singleton: true }
  }
});
```

### 4.4 优缺点分析

**优点：**
- 基于 Module Federation，共享能力强
- 配置简洁，上手快
- 支持动态部署
- 内置通讯机制

**缺点：**
- 生态相对较小
- 文档以中文为主，但示例不够丰富
- 与 qiankun 相比，社区活跃度较低

---

## 5. micro-app - 京东微前端方案

### 5.1 简介

`micro-app` 是京东前端团队开发的微前端框架，借鉴了 Web Component 的思想，通过 Custom Element 实现微前端。

### 5.2 核心原理

micro-app 通过 Custom Element（自定义元素）来加载子应用，每个子应用运行在隔离的 Shadow DOM 环境中。

### 5.3 快速开始

#### 5.3.1 主应用安装

```bash
npm install @micro-zoe/micro-app
```

#### 5.3.2 主应用配置

```javascript
// main.js
import microApp from '@micro-zoe/micro-app';

microApp.start({
  // 全局配置
  'global-asset': false,  // 是否加载全局资源
  inline: true,            // 是否内联 JS
  destroy: true,           // 卸载时是否销毁 DOM
});
```

```jsx
// App.jsx
import React from 'react';
import MicroApp from '@micro-zoe/micro-app';

function App() {
  return (
    <div>
      <h1>主应用</h1>
      
      {/* 加载 React 子应用 */}
      <micro-app 
        name="react-app" 
        url="http://localhost:3001" 
        baseroute="/react"
        data={{ message: 'Hello from main' }}
      />
      
      {/* 加载 Vue 子应用 */}
      <micro-app 
        name="vue-app" 
        url="http://localhost:3002" 
        baseroute="/vue"
      />
    </div>
  );
}
```

### 5.4 子应用配置

#### 5.4.1 React 子应用配置

```javascript
// 无需安装额外依赖
// 只需在入口文件添加以下代码

// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// 获取主应用传递的数据
const data = window.microApp.getData?.() || {};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<React.StrictMode><App data={data} /></React.StrictMode>);

// ============ 可选：监听主应用消息 ============
window.microApp?.addDataListener((data) => {
  console.log('[React 子应用] 收到主应用消息:', data);
});

// 独立运行时
if (!window.__MICRO_APP_ENVIRONMENT__) {
  root.render(<App data={{}} />);
}
```

#### 5.4.2 Vue 子应用配置

```javascript
// src/main.js
import Vue from 'vue';
import App from './App.vue';

let instance = null;

function render(data = {}) {
  instance = new Vue({
    render: h => h(App, { props: { microAppData: data } })
  }).$mount('#app');
}

// 监听主应用数据变化
if (window.microApp?.addDataListener) {
  window.microApp.addDataListener((data) => {
    console.log('[Vue 子应用] 收到主应用消息:', data);
    // 可以通过 Vuex 或 Pinia 更新状态
  });
}

// 独立运行
if (!window.__MICRO_APP_ENVIRONMENT__) {
  render({});
}
```

### 5.5 应用间通讯

#### 5.5.1 通过 data 属性传递数据

```jsx
// 主应用
<micro-app 
  name="react-app" 
  url="http://localhost:3001" 
  data={{ user: { name: 'test' }, token: 'abc123' }}
/>

// 发送数据给子应用
window.microApp.setData('react-app', { message: '新消息' });
```

#### 5.5.2 子应用接收数据

```javascript
// React 子应用
const data = window.microApp.getData?.() || {};

// 监听数据变化
window.microApp?.addDataListener((newData) => {
  console.log('数据更新:', newData);
});
```

#### 5.5.3 子应用向主应用发送消息

```javascript
// React 子应用
window.microApp?.dispatch({ 
  type: 'child-message', 
  payload: { from: 'react-app', content: 'Hello!' }
});
```

### 5.6 样式隔离

micro-app 默认使用 Shadow DOM 进行样式隔离，无需额外配置：

```jsx
// 主应用中的样式不会影响子应用
// 子应用中的样式也不会影响主应用
<micro-app 
  name="react-app" 
  url="http://localhost:3001"
  shadowDOM={true} // 默认 true
/>
```

### 5.7 JS 沙箱

micro-app 通过 Proxy 实现 JS 沙箱，确保子应用间的全局变量不互相污染：

```javascript
// 沙箱原理
class MicroAppSandbox {
  constructor(appName) {
    this.appName = appName;
    this.proxyWindow = new Proxy(window, {
      get: (target, prop) => {
        if (this.modifiedProps.has(prop)) {
          return this.modifiedProps.get(prop);
        }
        return target[prop];
      },
      set: (target, prop, value) => {
        this.modifiedProps.set(prop, value);
        return true;
      }
    });
  }
  
  // 激活沙箱
  active() {
    this.modifiedProps = new Map();
  }
  
  // 销毁沙箱
  inactive() {
    this.modifiedProps.clear();
  }
}
```

### 5.8 路由管理

micro-app 支持两种路由模式：

#### 模式一：跟随主应用 URL

```jsx
<micro-app 
  name="react-app" 
  url="http://localhost:3001" 
  baseroute="/react"
/>
```

子应用会根据 `baseroute` + 浏览器 URL 自动匹配路由。

#### 模式二：子应用独立路由

```jsx
<micro-app 
  name="react-app" 
  url="http://localhost:3001" 
  :url="reactUrl"
  :baseroute="baseRoute"
/>
```

### 5.9 生命周期

```javascript
// micro-app 提供以下生命周期钩子

// 主应用配置
microApp.start({
  'global-asset': false,
  inline: true,
});

// 生命周期回调
const microAppElement = document.querySelector('micro-app[name="react-app"]');

microAppElement.addEventListener('created', () => {
  console.log('子应用创建');
});

microAppElement.addEventListener('beforemount', () => {
  console.log('子应用即将挂载');
});

microAppElement.addEventListener('mounted', () => {
  console.log('子应用挂载完成');
});

microAppElement.addEventListener('unmount', () => {
  console.log('子应用卸载');
});

microAppElement.addEventListener('error', (e) => {
  console.log('子应用加载错误', e.detail.error);
});
```

### 5.10 优缺点分析

**优点：**
- 借鉴 Web Component 思想，实现简洁
- Shadow DOM 样式隔离，开箱即用
- 子应用无需改造，零侵入
- 支持 Vite 原生开发
- API 设计直观，易于上手

**缺点：**
- 依赖浏览器 Custom Element 支持
- Shadow DOM 方案有兼容性考虑
- 社区相对年轻，生态不够成熟
- 与其他框架混用时可能有冲突

### 5.11 适用场景

- 子应用改造困难或无法改造的场景
- 需要快速接入微前端的老项目
- 对样式隔离有较高要求
- 技术栈多样化的项目

---

## 6. 框架对比总结

### 6.1 功能对比表

| 特性 | single-spa | qiankun | Module Federation | EMP | micro-app |
|------|------------|---------|-------------------|-----|-----------|
| 框架支持 | 全部 | 全部 | 全部 | 全部 | 全部 |
| JS 沙箱 | ❌ | ✅ | ✅ | ✅ | ✅ |
| 样式隔离 | ❌ | ✅ | ❌ | ❌ | ✅ |
| 预加载 | ❌ | ✅ | ❌ | ✅ | ✅ |
| 子应用侵入性 | 高 | 高 | 中 | 中 | 低 |
| 学习成本 | 低 | 低 | 中 | 低 | 低 |
| 打包依赖 | Webpack | Webpack | Webpack 5 | Webpack | 任意 |
| Vite 支持 | 需配置 | 需配置 | 需插件 | 需插件 | 原生支持 |
| 社区活跃度 | 中 | 高 | 高 | 低 | 中 |
| 生产验证 | 大量 | 大量 | 大量 | 一般 | 一般 |

### 6.2 选型建议

#### 选择 single-spa 如果：
- 需要混用多种框架（React + Vue + Angular）
- 对打包体积有严格控制
- 愿意自行实现样式隔离和沙箱

#### 选择 qiankun 如果：
- 使用阿里系技术栈
- 需要开箱即用的完整方案
- 企业级中后台应用

#### 选择 Module Federation 如果：
- 多应用间需要大量共享代码
- 对打包体积优化有高要求
- 技术栈统一（都是 React 或都是 Vue）

#### 选择 EMP 如果：
- 需要快速搭建微前端架构
- 已有 Module Federation 基础
- 喜欢简洁的配置方式

#### 选择 micro-app 如果：
- 子应用无法或难以改造
- 需要快速接入老项目
- 对样式隔离有严格要求

### 6.3 迁移路径建议

1. **老项目改造**：micro-app（侵入性最低）
2. **新项目规划**：qiankun + 预留 Module Federation 方案
3. **技术栈统一**：Module Federation + single-spa
4. **快速原型**：EMP 或 micro-app

### 6.4 常见问题

**Q: 子应用需要改造吗？**
- single-spa、qiankun、EMP：需要（导出生命周期函数）
- Module Federation：需要（暴露模块）
- micro-app：不需要（零侵入）

**Q: 样式冲突怎么办？**
- 优先选择 micro-app（Shadow DOM 隔离）
- qiankun 可开启 strictStyleIsolation
- 手动方案：CSS Modules 或命名空间前缀

**Q: 如何选择构建工具？**
- 优先 Webpack 5（支持 Module Federation）
- Vite 项目可考虑 micro-app 或 @originjs/vite-plugin-federation

**Q: 微前端一定比分模块好吗？**
- 不一定。微前端适合多团队协作、独立部署场景
- 单体或小组件项目使用模块化即可，无需引入复杂性
