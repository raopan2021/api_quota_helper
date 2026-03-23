# Three.js 教程总览

本教程致力于将 Three.js 官方文档拆分为更易于学习的中文子教程，每个章节专注于一个特定主题，配有详细的代码示例和运行效果说明。

## 📚 教程目录

### 第一部分：基础入门
- [01-开发环境搭建与第一个3D场景](./01基础入门/01-开发环境搭建与第一个3D场景.md)
- [02-坐标系与基础图形](./01基础入门/02-坐标系与基础图形.md)
- [03-场景、相机与渲染器详解](./01基础入门/03-场景、相机与渲染器详解.md)

### 第二部分：材质与光照
- [01-材质基础与常用材质详解](./02材质与光照/01-材质基础与常用材质详解.md)
- [02-光照类型与光源详解](./02材质与光照/02-光照类型与光源详解.md)
- [03-阴影系统配置与优化](./02材质与光照/03-阴影系统配置与优化.md)

### 第三部分：相机控制
- [01-相机类型与选择指南](./03相机控制/01-相机类型与选择指南.md)
- [02-轨道控制器(OrbitControls)详解](./03相机控制/02-轨道控制器详解.md)
- [03-相机动画与过渡效果](./03相机控制/03-相机动画与过渡效果.md)

### 第四部分：动画与交互
- [01-动画循环与关键帧动画](./04动画与交互/01-动画循环与关键帧动画.md)
- [02-用户交互事件处理](./04动画与交互/02-用户交互事件处理.md)
- [03-性能优化与帧率控制](./04动画与交互/03-性能优化与帧率控制.md)

### 第五部分：高级特效
- [01-粒子系统与实例化渲染](./05高级特效/01-粒子系统与实例化渲染.md)
- [02-着色器(Shader)入门](./05高级特效/02-着色器入门.md)
- [03-后期处理与滤镜效果](./05高级特效/03-后期处理与滤镜效果.md)

## 🔧 微前端文档
详细的微前端框架介绍请参考 [微前端文档](../微前端/README.md)

## 📖 学习路径建议

### 入门路线（1-2周）
1. 完成 01 基础入门（4-6小时）
2. 完成 02 材质与光照（4-6小时）
3. 完成 03 相机控制（3-4小时）
4. 完成 04 动画与交互（4-6小时）

### 进阶路线（2-3周）
5. 学习 05 高级特效（8-10小时）
6. 阅读 Three.js 官方示例源码
7. 尝试自己实现一个3D项目

## 🛠 必备开发工具

### VSCode 扩展推荐
- `Three.js Snippets` - Three.js 代码片段
- `ESLint` - 代码检查
- `Prettier` - 代码格式化
- `Live Server` - 本地开发服务器

### 浏览器调试工具
- Chrome DevTools - 性能分析
- Three.js Inspector - 场景可视化调试

## 📦 CDN 引入方式（快速上手）

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Three.js 快速开始</title>
    <style>
        body { margin: 0; overflow: hidden; }
        canvas { display: block; }
    </style>
</head>
<body>
    <!-- 引入 Three.js -->
    <script type="importmap">
    {
        "imports": {
            "three": "https://unpkg.com/three@0.160.0/build/three.module.js",
            "three/addons/": "https://unpkg.com/three@0.160.0/examples/jsm/"
        }
    }
    </script>
    <script type="module">
        import * as THREE from 'three';
        
        // 你的代码
        console.log('Three.js 版本:', THREE.REVISION);
    </script>
</body>
</html>
```

## ❓ 常见问题

### Q: Three.js 和 WebGL 的关系是什么？
A: WebGL 是浏览器提供的底层 2D 图形 API，而 Three.js 是基于 WebGL 的高级 3D 框架。Three.js 封装了 WebGL 的复杂操作，让开发者可以更便捷地创建 3D 场景。

### Q: 需要深入学习数学知识吗？
A: 入门阶段只需要了解基础的坐标系和向量概念。进阶学习时可能需要了解矩阵运算和空间变换，但 Three.js 提供了完善的封装，大多数情况下不需要手动计算。

### Q: Three.js 支持哪些输出格式？
A: 常用的 3D 模型格式如 GLTF/GLB、OBJ、FBX 等都有对应的加载器支持。

## 🔗 相关资源

- [Three.js 官方文档](https://threejs.org/)
- [Three.js 示例库](https://threejs.org/examples/)
- [Three.js GitHub 仓库](https://github.com/mrdoob/three.js)
- [Three.js Discord 社区](https://discord.gg/threejs)

---

*教程会持续更新，欢迎提出问题和改进建议*
