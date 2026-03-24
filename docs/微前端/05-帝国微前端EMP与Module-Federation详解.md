# 05-帝国微前端EMP与Module Federation详解

本章节介绍两种特殊的微前端方案：EMP（Empire Micro Program，字节跳动水滴团队开发）和 Webpack Module Federation（Webpack 5 内置方案）。

## 目录

1. [EMP 概述](#emp-概述)
2. [Webpack Module Federation 概述](#webpack-module-federation-概述)
3. [EMP 使用详解](#emp-使用详解)
4. [Module Federation 使用详解](#module-federation-使用详解)
5. [两者对比](#两者对比)

---

## EMP 概述

### 什么是 EMP？

EMP（Empire Micro Program）是字节跳动水滴团队开发的微前端框架，特点是对 Webpack Module Federation 的原生支持，同时支持 Vue、React 等多种框架。

### 核心特性

| 特性 | 说明 |
|------|------|
| 双引擎支持 | 同时支持 Webpack 4/5 |
| Module Federation 原生支持 | 直接使用 MF 方案 |
| 去中心化 | 子应用可以独立部署 |
| 共享依赖 | 子应用之间共享公共依赖 |
| 插件化 | 通过插件扩展功能 |

### 架构图

```
┌─────────────────────────────────────────────────────────┐
│                    EMP 主应用                           │
│  ┌───────────────────────────────────────────────────┐ │
│  │              Module Federation                     │ │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐        │ │
│  │  │ Remote1 │  │ Remote2 │  │ Remote3 │        │ │
│  │  │ (Vue)   │  │(React)  │  │(Vanilla)│        │ │
│  │  └─────────┘  └─────────┘  └─────────┘        │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## Webpack Module Federation 概述

### 什么是 Module Federation？

Module Federation 是 Webpack 5 引入的模块共享方案，允许一个应用动态加载另一个应用的代码，实现真正的运行时集成。

### 核心概念

| 概念 | 说明 |
|------|------|
| Host（主机） | 引用其他应用的主应用 |
| Remote（远程） | 被其他应用引用的子应用 |
| Exposes | 暴露给其他应用的模块 |
| Shared | 与其他应用共享的依赖 |

### 与传统微前端的区别

```
传统微前端：
┌──────────┐     ┌──────────┐     ┌──────────┐
│  子应用A  │     │  子应用B  │     │  子应用C  │
│  (独立)   │     │  (独立)   │     │  (独立)   │
└────┬─────┘     └────┬─────┘     └────┬─────┘
     │                 │                 │
     └─────────────────┴─────────────────┘
                          ↓
                   运行时动态加载

Module Federation：
┌──────────────────────────────────────────┐
│               共享依赖                    │
│  ┌────────────────────────────────────┐ │
│  │ React | Vue | Lodash | Day.js     │ │
│  └────────────────────────────────────┘ │
└──────────────────────────────────────────┘
                          ↓
┌──────────┐     ┌──────────┐     ┌──────────┐
│  Host    │ ←→  │  Remote1 │ ←→  │  Remote2 │
│  (主应用) │     │  (子应用) │     │  (子应用) │
└──────────┘     └──────────┘     └──────────┘
     ↓                 ↓                 ↓
  加载 Remote1      暴露模块          暴露模块
  加载 Remote2      加载 Remote2      加载 Host
```

---

## EMP 使用详解

### 安装

```bash
npm install @efox/emp -D
```

### 项目初始化

```bash
# 创建 EMP 项目
npx @efox/emp init

# 或在现有项目添加
npm install @efox/emp -D
```

### 基本配置

#### 1. 主应用配置

```javascript
// emp.config.js
const { defineConfig } = require('@efox/emp');

module.exports = defineConfig({
    // 项目类型
    projectType: 'host',
    
    // 开发服务器
    devServer: {
        port: 8000,
        headers: {
            'Access-Control-Allow-Origin': '*'
        }
    },
    
    // Module Federation 配置
    federation: {
        name: 'hostApp',
        remotes: {
            // 暴露的远程模块
            remoteVueApp: 'remoteVueApp@http://localhost:8001/remoteEntry.js',
            remoteReactApp: 'remoteReactApp@http://localhost:8002/remoteEntry.js'
        },
        shared: {
            // 共享依赖（只保留一份）
            react: { singleton: true, requiredVersion: '^18.0.0' },
            'react-dom': { singleton: true, requiredVersion: '^18.0.0' },
            vue: { singleton: true, requiredVersion: '^3.0.0' }
        }
    }
});
```

#### 2. 子应用配置

```javascript
// 子应用 emp.config.js（Vue）
const { defineConfig } = require('@efox/emp');

module.exports = defineConfig({
    projectType: 'remote',
    
    devServer: {
        port: 8001,
        headers: {
            'Access-Control-Allow-Origin': '*'
        }
    },
    
    federation: {
        name: 'remoteVueApp',
        filename: 'remoteEntry.js',
        exposes: {
            // 暴露组件
            './Button': './src/components/Button.vue',
            './Table': './src/components/Table.vue',
            // 暴露应用入口
            './App': './src/App.vue'
        },
        shared: {
            vue: { singleton: true },
            'vue-router': { singleton: true }
        }
    }
});
```

### 主应用使用

```jsx
// src/App.jsx
import React, { lazy, Suspense } from 'react';

// 动态导入远程模块（EMP 方式）
const RemoteVueButton = React.lazy(() => import('remoteVueApp/Button'));
const RemoteVueApp = React.lazy(() => import('remoteVueApp/App'));

function App() {
    return (
        <div className="app">
            <h1>EMP 主应用</h1>
            
            {/* 使用远程 Vue 组件 */}
            <Suspense fallback={<div>加载中...</div>}>
                <RemoteVueButton />
            </Suspense>
            
            {/* 使用远程 Vue 应用 */}
            <Suspense fallback={<div>加载中...</div>}>
                <RemoteVueApp />
            </Suspense>
        </div>
    );
}

export default App;
```

### 子应用开发（Vue 3）

```vue
<!-- src/components/Button.vue -->
<template>
    <button class="emp-button" @click="handleClick">
        {{ text }}
    </button>
</template>

<script>
export default {
    name: 'EmpButton',
    props: {
        text: {
            type: String,
            default: '按钮'
        }
    },
    emits: ['click'],
    setup(props, { emit }) {
        const handleClick = () => {
            emit('click');
        };
        return { handleClick };
    }
};
</script>
```

```javascript
// src/App.vue
<template>
    <div class="remote-vue-app">
        <h2>远程 Vue 应用</h2>
        <Button text="远程按钮" @click="handleClick" />
    </div>
</template>

<script>
import Button from './components/Button.vue';

export default {
    name: 'RemoteVueApp',
    components: { Button },
    setup() {
        const handleClick = () => {
            console.log('按钮点击');
        };
        return { handleClick };
    }
};
</script>
```

---

## Module Federation 使用详解

### 基本概念

```
┌─────────────────────────────────────────────────────────┐
│                     Webpack Config                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  new ModuleFederationPlugin({                          │
│    name: 'host',           // 应用名称                  │
│    filename: 'remoteEntry.js',  // 入口文件名           │
│    remotes: {               // 远程模块                  │
│      remoteApp: 'remoteApp@http://localhost:8081/remoteEntry.js'    │
│    },                       │
│    exposes: {                // 暴露模块                  │
│      './Component': './src/Component.js'                │
│    },                       │
│    shared: {                // 共享依赖                  │
│      react: { singleton: true },                      │
│      'react-dom': { singleton: true }                  │
│    }                        │
│  })                                                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 完整示例

#### 1. 主应用（React + Webpack 5）

```javascript
// webpack.config.js
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
    mode: 'development',
    entry: './src/index.js',
    devServer: {
        port: 3000,
        headers: {
            'Access-Control-Allow-Origin': '*'
        }
    },
    plugins: [
        new ModuleFederationPlugin({
            name: 'host',
            remotes: {
                // 引用远程子应用
                remoteVueApp: 'remoteVueApp@http://localhost:8081/remoteEntry.js',
                remoteReactApp: 'remoteReactApp@http://localhost:8082/remoteEntry.js'
            },
            shared: {
                react: { singleton: true, requiredVersion: '^18.0.0' },
                'react-dom': { singleton: true, requiredVersion: '^18.0.0' }
            }
        }),
        new HtmlWebpackPlugin({
            template: './public/index.html'
        })
    ]
};
```

```jsx
// src/App.jsx
import React, { Suspense, lazy } from 'react';

function App() {
    return (
        <div className="host-app">
            <h1>Module Federation 主应用</h1>
            
            <nav>
                <a href="/">首页</a>
                <a href="/vue">Vue 子应用</a>
                <a href="/react">React 子应用</a>
            </nav>
            
            {/* 懒加载远程模块 */}
            <Suspense fallback={<div>加载中...</div>}>
                <Routes>
                    <Route path="/vue" element={<RemoteVueApp />} />
                    <Route path="/react" element={<RemoteReactApp />} />
                </Routes>
            </Suspense>
        </div>
    );
}

// 动态导入远程组件
const RemoteVueApp = lazy(() => import('remoteVueApp/App'));
const RemoteReactApp = lazy(() => import('remoteReactApp/App'));

export default App;
```

```javascript
// src/index.js
import('./bootstrap');

async function bootstrap() {
    const React = await import('react');
    const ReactDOM = await import('react-dom/client');
    const App = await import('./App');
    
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(React.createElement(App.default));
}
```

#### 2. Vue 3 子应用

```javascript
// webpack.config.js
const { VueLoaderPlugin } = require('vue-loader');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;
const path = require('path');

module.exports = {
    mode: 'development',
    entry: './src/index.js',
    devServer: {
        port: 8081,
        headers: {
            'Access-Control-Allow-Origin': '*'
        }
    },
    module: {
        rules: [
            { test: /\.vue$/, loader: 'vue-loader' }
        ]
    },
    plugins: [
        new VueLoaderPlugin(),
        new ModuleFederationPlugin({
            name: 'remoteVueApp',
            filename: 'remoteEntry.js',
            exposes: {
                './Button': './src/components/Button.vue',
                './App': './src/App.vue'
            },
            shared: {
                vue: { singleton: true, requiredVersion: '^3.0.0' },
                'vue-router': { singleton: true }
            }
        }),
        new HtmlWebpackPlugin({
            template: './public/index.html'
        })
    ]
};
```

```javascript
// src/bootstrap.js
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

const app = createApp(App);
app.use(router);
app.mount('#app');
```

```javascript
// src/index.js
// EMP/Module Federation 入口
// 动态导入 bootstrap，让 webpack 处理模块加载
import('./bootstrap');
```

#### 3. React 子应用

```javascript
// webpack.config.js
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
    mode: 'development',
    entry: './src/index.js',
    devServer: {
        port: 8082,
        headers: {
            'Access-Control-Allow-Origin': '*'
        }
    },
    plugins: [
        new ModuleFederationPlugin({
            name: 'remoteReactApp',
            filename: 'remoteEntry.js',
            exposes: {
                './App': './src/App.jsx',
                './Button': './src/components/Button.jsx'
            },
            shared: {
                react: { singleton: true, requiredVersion: '^18.0.0' },
                'react-dom': { singleton: true, requiredVersion: '^18.0.0' }
            }
        }),
        new HtmlWebpackPlugin({
            template: './public/index.html'
        })
    ]
};
```

```jsx
// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

function App() {
    return (
        <BrowserRouter basename="/react">
            <div className="remote-react-app">
                <h2>远程 React 子应用</h2>
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

```javascript
// src/bootstrap.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
```

```javascript
// src/index.js
import('./bootstrap');
```

### 共享依赖配置详解

```javascript
new ModuleFederationPlugin({
    shared: {
        // 基础配置
        react: { singleton: true },
        
        // 指定版本范围
        'react-dom': { 
            singleton: true, 
            requiredVersion: '^18.0.0' 
        },
        
        // 指定版本
        lodash: {
            requiredVersion: '^4.17.21'
        },
        
        // 禁用共享（每个应用独立）
        moment: false,
        
        // 严格版本匹配
        dayjs: {
            singleton: true,
            strictVersion: true
        },
        
        // 导入时 eager（不使用异步加载）
        'react-dom': {
            singleton: true,
            eager: true
        }
    }
});
```

### 运行时的动态加载

```javascript
// 运行时动态加载远程模块（不需要构建时声明）
import('http://localhost:8081/remoteEntry.js').then((container) => {
    // 获取远程模块
    return container.get('./Button');
}).then((module) => {
    // 使用模块
    const Button = module.default;
    // ...
});
```

---

## 两者对比

### EMP vs Module Federation

| 特性 | EMP | Module Federation |
|------|-----|-------------------|
| 实现方式 | Webpack 插件封装 | Webpack 5 内置 |
| 学习成本 | 较低（有封装） | 较高（需要理解 MF 原理） |
| 配置简化 | ✅ 提供简化配置 | ❌ 需要手动配置 |
| 插件支持 | ✅ 丰富的插件生态 | ❌ 依赖原生配置 |
| Vue 支持 | ✅ 良好 | ✅ 需要额外处理 |
| React 支持 | ✅ 良好 | ✅ 良好 |
| 部署复杂度 | 较低 | 较高（需要正确配置 URL） |

### 选型建议

#### 选择 EMP 的场景
- 想要 Module Federation 的能力，但不想深入研究配置
- 使用 Webpack 4 或 5
- 需要更好的开发体验和调试支持

#### 选择原生 Module Federation 的场景
- 对构建过程有完全控制需求
- 需要定制化的模块共享策略
- 愿意投入时间深入理解 MF 原理

---

## 下一步

下一章节：[06-Webpack-Module-Federation详解](./06-Webpack-Module-Federation详解.md)

---

*💡 提示：*
- *EMP 文档：https://github.com/efoxTeam/emp*
- *Module Federation 文档：https://webpack.js.org/concepts/module-federation/*
