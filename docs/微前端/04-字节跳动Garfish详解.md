# 04-字节跳动Garfish详解

Garfish 是字节跳动团队开发的微前端框架，最初服务于抖音、西瓜视频等大型应用，后来开源。特点是功能完善、支持多实例和熔断机制。

## 目录

1. [核心特性](#核心特性)
2. [快速开始](#快速开始)
3. [主应用配置](#主应用配置)
4. [子应用开发](#子应用开发)
5. [通信机制](#通信机制)
6. [高级特性](#高级特性)
7. [与 qiankun 对比](#与-qiankun-对比)

---

## 核心特性

### 1. 熔断机制

当子应用加载失败时，Garfish 会自动触发熔断，避免反复重试：

```
普通加载：请求失败 → 立即重试 → 可能多次失败
熔断加载：请求失败 → 触发熔断 → 一段时间内不重试 → 恢复后重试
```

### 2. 多实例支持

一个子应用可以在页面中多次挂载：

```jsx
// 页面左侧
<GarfishApp appName="order" basename="/order" />

// 页面右侧（同一个子应用，不同实例）
<GarfishApp appName="order" basename="/order-detail" />
```

### 3. 预加载与懒加载

```javascript
// 预加载（提前加载，用户访问时更快）
Garfish.preloadApps(['vue-app', 'react-app']);

// 懒加载（访问时才加载）
const app = Garfish.loadApp('vue-app', {
    entry: '//localhost:8081',
    basename: '/vue'
});
```

### 4. 完整的生命周期

```javascript
// 提供比 qiankun 更丰富的生命周期
export const lifecycle = {
    // 初始化
    async bootstrap() {},
    
    // 挂载前
    async beforeMount() {},
    
    // 挂载
    async mount() {},
    
    // 卸载前
    async beforeUnmount() {},
    
    // 卸载
    async unmount() {},
    
    // 销毁（可选）
    async destroy() {},
    
    // 激活（每次显示时调用）
    async show() {},
    
    // 隐藏（每次隐藏时调用）
    async hide() {}
};
```

### 5. 自动路由同步

Garfish 可以自动同步子应用的路由变化到浏览器地址栏：

```javascript
Garfish.loadApp('vue-app', {
    entry: '//localhost:8081',
    basename: '/vue',
    autoRefresh: true  // 自动同步路由
});
```

---

## 快速开始

### 安装

```bash
npm install garfish
```

### 基础项目结构

```
garfish-project/
├── main-app/
│   ├── package.json
│   └── src/
│       ├── main.jsx
│       └── App.jsx
│
├── child-vue/
│   ├── package.json
│   └── src/
│       ├── main.js
│       └── App.vue
│
└── child-react/
    ├── package.json
    └── src/
        └── index.jsx
```

---

## 主应用配置

### React 主应用

#### 1. 安装依赖

```bash
cd main-app
npm install garfish react react-dom react-router-dom
```

#### 2. 主应用入口

```jsx
// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Garfish, { registerGarfishApps } from 'garfish';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </React.StrictMode>
);

// ---------- Garfish 配置 ----------

// 1. 注册子应用
registerGarfishApps([
    {
        name: 'vue-app',                    // 唯一标识
        active: '/vue',                     // 激活路径
        entry: '//localhost:8081',          // 入口地址
        basename: '/vue',                   // 路由基础路径
        domGetter: '#micro-container',       // 挂载容器
        props: {
            // 传递给子应用的数据
            mainData: { from: '主应用' }
        }
    },
    {
        name: 'react-app',
        active: '/react',
        entry: '//localhost:8082',
        basename: '/react',
        domGetter: '#micro-container',
        props: {
            mainData: { from: '主应用' }
        }
    }
]);

// 2. 启动 Garfish
Garfish.run({
    // 主应用 basename
    basename: '/',
    
    // 挂载点
    domGetter: '#micro-container',
    
    // 自动显示子应用
    autoShowApp: true,
    
    // 屏蔽错误
    protectVariable: ['React', 'ReactDOM'],
    
    // 错误处理
    onError: (error) => {
        console.error('[Garfish] 错误', error);
    },
    
    // 子应用装载完成
    onAppEnter: ({ appName, app }) => {
        console.log(`[Garfish] ${appName} 进入`);
    },
    
    // 子应用路由变化
    onRouteChange: (next, prev) => {
        console.log('[Garfish] 路由变化', next, prev);
    }
});
```

#### 3. App.jsx

```jsx
// src/App.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function App() {
    const location = useLocation();
    
    // 是否显示子应用容器
    const showContainer = !['/'].includes(location.pathname);
    
    return (
        <div className="app">
            <nav>
                <Link to="/">首页</Link>
                <Link to="/vue">Vue 子应用</Link>
                <Link to="/react">React 子应用</Link>
            </nav>
            
            {/* 子应用容器 */}
            <div id="micro-container" style={{ minHeight: '400px' }} />
        </div>
    );
}

export default App;
```

### Vue 3 主应用

```javascript
// src/main.js
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import Garfish, { registerGarfishApps } from 'garfish';

const app = createApp(App);
app.use(router);
app.mount('#app');

// 注册子应用
registerGarfishApps([
    {
        name: 'vue-child',
        active: '/vue',
        entry: '//localhost:8081',
        basename: '/vue',
        domGetter: '#micro-container',
        props: {
            mainData: { from: '主应用' }
        }
    }
]);

// 启动
Garfish.run({
    basename: '/',
    domGetter: '#micro-container',
    autoShowApp: true
});
```

---

## 子应用开发

### Vue 3 子应用

#### 1. public-path.js

```javascript
// src/public-path.js
if (window.__GARFISH_PARENT__) {
    __webpack_public_path__ = window.__GARFISH_PUBLIC_PATH__;
}
```

#### 2. main.js

```javascript
// src/main.js
import './public-path';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

let app = null;

function render(props = {}) {
    const { container, basename = '/' } = props;
    
    app = createApp(App);
    app.use(router);
    
    // 设置路由基础路径
    if (basename) {
        router.options.base = basename;
    }
    
    // 挂载
    const mountNode = container ? container.querySelector('#app') : '#app';
    app.mount(mountNode);
}

// ---------- Garfish 生命周期 ----------

// 初始化
export async function bootstrap() {
    console.log('[Vue 子应用] 初始化');
}

// 挂载前
export async function beforeMount() {
    console.log('[Vue 子应用] 挂载前');
}

// 挂载
export async function mount(props) {
    console.log('[Vue 子应用] 挂载', props);
    render(props);
}

// 卸载前
export async function beforeUnmount() {
    console.log('[Vue 子应用] 卸载前');
}

// 卸载
export async function unmount() {
    console.log('[Vue 子应用] 卸载');
    app.unmount();
    app = null;
}

// 显示
export async function show() {
    console.log('[Vue 子应用] 显示');
}

// 隐藏
export async function hide() {
    console.log('[Vue 子应用] 隐藏');
}

// ---------- 非 Garfish 环境 ----------
if (!window.__GARFISH_PARENT__) {
    render({});
}
```

#### 3. vue.config.js

```javascript
// vue.config.js
const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
    devServer: {
        port: 8081,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        disableHostCheck: true
    },
    configureWebpack: {
        output: {
            library: 'vue-child',
            libraryTarget: 'umd',
            publicPath: 'http://localhost:8081/'
        }
    }
});
```

### React 18 子应用

#### 1. public-path.js

```javascript
// src/public-path.js
if (window.__GARFISH_PARENT__) {
    __webpack_public_path__ = window.__GARFISH_PUBLIC_PATH__;
}
```

#### 2. index.jsx

```jsx
// src/index.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './public-path';
import './index.css';

let root = null;

function render(props = {}) {
    const { container, basename = '/' } = props;
    
    root = ReactDOM.createRoot(
        container ? container.querySelector('#root') : document.getElementById('root')
    );
    
    root.render(
        <React.StrictMode>
            <App basename={basename} />
        </React.StrictMode>
    );
}

// ---------- Garfish 生命周期 ----------

export async function bootstrap() {
    console.log('[React 子应用] 初始化');
}

export async function beforeMount() {
    console.log('[React 子应用] 挂载前');
}

export async function mount(props) {
    console.log('[React 子应用] 挂载', props);
    render(props);
}

export async function beforeUnmount() {
    console.log('[React 子应用] 卸载前');
}

export async function unmount() {
    console.log('[React 子应用] 卸载');
    root.unmount();
    root = null;
}

export async function show() {
    console.log('[React 子应用] 显示');
}

export async function hide() {
    console.log('[React 子应用] 隐藏');
}

// ---------- 非 Garfish 环境 ----------
if (!window.__GARFISH_PARENT__) {
    render({ basename: '/' });
}
```

#### 3. App.jsx

```jsx
// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

function App({ basename }) {
    return (
        <BrowserRouter basename={basename}>
            <div className="react-child">
                <h1>React 子应用</h1>
                <nav>
                    <Link to="/">首页</Link>
                    <Link to="/about">关于</Link>
                </nav>
                <Routes>
                    <Route path="/" element={<div>首页</div>} />
                    <Route path="/about" element={<div>关于页面</div>} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;
```

---

## 通信机制

### props 传递

#### 主应用

```javascript
registerGarfishApps([
    {
        name: 'vue-app',
        active: '/vue',
        entry: '//localhost:8081',
        basename: '/vue',
        domGetter: '#micro-container',
        props: {
            // 基础数据
            mainData: { userName: '张三' },
            
            // 主应用方法
            onUserChange: (data) => {
                console.log('用户变化', data);
            },
            
            // 全局状态（使用 GlobalState）
            globalState: {
                // 初始状态
            }
        }
    }
]);
```

#### 子应用

```javascript
// mount 时接收
export async function mount(props) {
    console.log('收到主应用数据:', props.mainData);
    console.log('收到主应用方法:', props.onUserChange);
    
    // 调用主应用方法
    props.onUserChange({ userId: 123, name: '李四' });
}
```

### GlobalState 全局状态

#### 主应用

```jsx
import { registerGarfishApps, useGlobalBus, useGlobalState } from 'garfish';

// 定义全局状态
const globalState = {
    user: null,
    token: null
};

// 注册时传入
registerGarfishApps([{
    name: 'vue-app',
    // ...
    props: {
        globalState
    }
}]);

// 在组件中使用
function UserInfo() {
    const { setGlobalState, globalState } = useGlobalState();
    
    return (
        <div>
            <p>用户: {globalState.user?.name}</p>
            <button onClick={() => setGlobalState({ user: { name: '张三' } })}>
                更新用户
            </button>
        </div>
    );
}
```

#### 子应用

```javascript
// 通过 props 接收 globalState
export async function mount(props) {
    const { globalState } = props;
    
    // 监听变化
    globalState.on('userChange', (user) => {
        console.log('用户变化', user);
    });
    
    // 修改状态
    globalState.setGlobalState({
        user: { name: '李四' }
    });
}
```

---

## 高级特性

### 预加载子应用

```javascript
import Garfish from 'garfish';

// 预加载指定子应用
Garfish.preloadApps(['vue-app', 'react-app']);

// 或者预加载所有已注册的子应用
Garfish.preloadApps();
```

### 手动加载子应用

```javascript
import Garfish from 'garfish';

// 手动加载子应用（返回 Promise）
const app = await Garfish.loadApp('vue-app', {
    entry: '//localhost:8081',
    basename: '/vue',
    domGetter: '#custom-container',
    props: {
        mainData: { from: '手动加载' }
    }
});

// 手动挂载
await app.mount();

// 手动卸载
await app.unmount();

// 获取子应用实例
const instance = Garfish.getApp('vue-app');
console.log('实例状态:', instance.status);
```

### 熔断机制

```javascript
Garfish.run({
    // 熔断配置
    protect: {
        // 请求超时时间（ms）
        timeout: 5000,
        
        // 最大重试次数
        maxErrorNumber: 3,
        
        // 熔断恢复时间（ms）
        recoveryTime: 30000,
        
        // 是否启用熔断
        enable: true
    },
    
    // 错误处理
    onError: (error) => {
        // 如果是子应用加载错误
        if (error.from === 'app') {
            console.error(`子应用 ${error.appName} 加载失败`, error);
        }
    }
});
```

### 子应用隔离配置

```javascript
registerGarfishApps([{
    name: 'vue-app',
    active: '/vue',
    entry: '//localhost:8081',
    basename: '/vue',
    domGetter: '#micro-container',
    
    // 隔离配置
    sandbox: {
        // 快照沙箱（兼容性最好）
        // snapShot: true
        
        // 代理沙箱（性能更好）
        proxy: true,
        
        // 需要修复的全局变量
        fixModuleCreation: true,
        
        // 禁止修改的全局变量
        protectVariable: ['React', 'ReactDOM']
    }
}]);
```

### keepAlive 保持存活

```javascript
registerGarfishApps([{
    name: 'vue-app',
    active: '/vue',
    entry: '//localhost:8081',
    basename: '/vue',
    domGetter: '#micro-container',
    
    // 切换时不销毁，保持活跃
    keepAlive: true
}]);

// 主应用中使用 GarfishComponent
import { GarfishComponent } from 'garfish';

<GarfishComponent 
    appName="vue-app" 
    loadState="keepAlive"
/>
```

---

## 与 qiankun 对比

| 特性 | Garfish | qiankun |
|------|---------|---------|
| 团队 | 字节跳动 | 阿里 |
| GitHub Stars | 5k+ | 15k+ |
| 文档完善度 | 一般 | 完善 |
| 社区活跃度 | 一般 | 活跃 |
| 熔断机制 | ✅ 支持 | ❌ 不支持 |
| 多实例 | ✅ 支持 | ❌ 不支持 |
| show/hide 生命周期 | ✅ 支持 | ❌ 不支持 |
| 自动路由同步 | ✅ 支持 | ⚠️ 部分支持 |
| 预加载 | ✅ 支持 | ✅ 支持 |
| React Native 支持 | ❌ | ❌ |
| 学习曲线 | 中等 | 较低 |

### 选型建议

- **选择 Garfish**：需要熔断机制、多实例、show/hide 生命周期
- **选择 qiankun**：更看重社区生态、文档完善度、较低学习成本

---

## 下一步

下一章节：[05-帝国微前端EMP详解](./05-帝国微前端EMP详解.md)

---

*💡 提示：Garfish 文档：https://www.garfish.js.org/*
