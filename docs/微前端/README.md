# 微前端文档

微前端是一种将大型前端应用拆分为多个独立子应用的架构风格，每个子应用可以独立开发、测试、部署。

## 📚 文档目录

### 框架详细介绍
- [01-微前端概念与优势](./01-微前端概念与优势.md)
- [02-京东micro-app详解](./02-京东micro-app详解.md)
- [03-阿里qiankun详解](./03-阿里qiankun详解.md)
- [04-字节跳动Garfish详解](./04-字节跳动Garfish详解.md)
- [05-帝国微前端EMP详解](./05-帝国微前端EMP详解.md)
- [06-Webpack Module Federation](./06-Webpack-Module-Federation详解.md)

### 比较与选型
- [07-框架对比与选型建议](./07-框架对比与选型建议.md)

---

## 🔥 主流微前端框架一览

| 框架 | 团队 | 特点 | GitHub Stars |
|------|------|------|--------------|
| [qiankun](https://github.com/umijs/qiankun) | 阿里 | 基于 single-spa，生态完善 | 15k+ |
| [micro-app](https://github.com/micro-zoe/micro-app) | 京东 | 零依赖，Web Component 沙箱 | 8k+ |
| [Garfish](https://github.com/modern-js-dev/Garfish) | 字节/快手 | 熔断机制，多实例支持 | 5k+ |
| [EMP](https://github.com/efoxTeam/emp) | 字节/水滴 | 双引擎支持，Webpack Module Federation | 3k+ |
| [Module Federation](https://webpack.js.org/concepts/module-federation/) | Webpack | 原生解决方案，无需框架 | 内置 |

## 📖 学习路径建议

### 入门路线（1-2周）
1. 阅读 01 微前端概念与优势（2-3小时）
2. 选择一个框架深入学习（建议 qiankun 或 micro-app）（6-8小时）
3. 完成框架的入门示例（3-4小时）

### 进阶路线（2-3周）
4. 学习 07 框架对比与选型建议（2-3小时）
5. 深入学习 Module Federation（6-8小时）
6. 实际项目迁移与优化（8-10小时）

## 🤔 什么时候需要微前端？

### 适合场景
- 大型 B 端管理系统（多个业务模块）
- 老旧项目渐进式升级（巨石应用的现代化改造）
- 多团队并行开发（自治团队独立发布）
- 独立子应用复用（将通用模块作为子应用）

### 不适合场景
- 小型简单应用（增加不必要的复杂度）
- 需要高度交互的应用（跨应用通信开销大）
- SEO 优先的应用（微前端对 SEO 不友好）

## 🛠 技术栈兼容性

| 框架 | React | Vue | Angular | Vanilla JS |
|------|-------|-----|---------|------------|
| qiankun | ✅ | ✅ | ⚠️ | ⚠️ |
| micro-app | ✅ | ✅ | ✅ | ✅ |
| Garfish | ✅ | ✅ | ✅ | ⚠️ |
| EMP | ✅ | ✅ | ✅ | ⚠️ |
| Module Federation | ✅ | ✅ | ✅ | ✅ |

> ✅ 完全支持  ⚠️ 需要额外配置  ❌ 不支持

## 🔗 相关资源

- [qiankun 官方文档](https://qiankun.umijs.org/)
- [micro-app 官方文档](https://micro-zoe.github.io/micro-app/)
- [Garfish 官方文档](https://www.garfish.js.org/)
- [EMP 官方文档](https://github.com/efoxTeam/emp)
- [Module Federation 文档](https://webpack.js.org/concepts/module-federation/)

---

*文档持续更新中，欢迎提出问题和改进建议*
