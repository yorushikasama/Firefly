# jsDelivr 图床链接规范（blog-img 仓库）

本站文章图片托管在 GitHub 仓库 `yorushika333-ship-it/blog-img`，通过 jsDelivr CDN 引用。

> **2026-10-01 重要更新**：经实测，jsDelivr 目前对 GitHub 文件请求**大范围返回 301 跳转到 raw.githubusercontent.com**，详见下文「jsDelivr 直出失效问题」。本文的 URL 格式规范仍然有效（`@main` 是官方格式），但「jsDelivr 加速」在当前行为下已不可依赖，迁移方案待定。

## 正确的 URL 格式

jsDelivr 的 GitHub 路径要求带分支或版本号：

```
https://cdn.jsdelivr.net/gh/<用户名>/<仓库名>@<分支或版本>/<文件路径>
```

本站统一使用 `@main`：

```
https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/<文章目录>/<图片文件>
```

省略分支（`gh/用户名/仓库名/<路径>`）不属于官方格式，jsDelivr 对其解析行为没有保证，跳转时会被重定向到 `HEAD`。**一律带 `@main`，不要省略。**

## jsDelivr 直出失效问题（2026-10-01 实测）

对以下所有 URL 形式做实测，多数边缘节点返回 `301 Moved Permanently` → `raw.githubusercontent.com`：

| 形式 | 示例 | 结果 |
| --- | --- | --- |
| 无分支 | `/gh/yorushika333-ship-it/blog-img/img.png` | 301 → raw `/HEAD/` |
| `@main` | `/gh/.../blog-img@main/img.png` | 301 → raw `/main/` |
| `@master` | `/gh/.../blog-img@master/img.png` | 301 → raw `/master/` |
| 版本 tag | `gh/jquery/jquery@3.7.1/README.md` | 301 → raw（对照仓库同样如此） |
| commit hash | `gh/.../blog-img@341d7c1.../img.png` | 301 → raw |

关键结论：

- **对照仓库（jquery、cunyu1943/blog-imgs）同样 301**，说明这是 jsDelivr 的全局行为变化，不是本仓库被特殊处理。
- 部分边缘节点仍能直出 200（缓存命中），同一 URL 时而 200 时而 301，**行为按边缘节点/地区不一致**。
- 未找到官方公告（[jsDelivr Status](https://status.jsdelivr.com/) 无相关通告；GitHub issues 与社区讨论亦无定论），无法判断是永久策略还是阶段性故障。
- 301 响应自身带 `Cache-Control: max-age=604800`，一旦被浏览器/中间层缓存，最长 7 天内都会持续跳转。

**实际影响**：所有文章图片的最终宿主变成了 `raw.githubusercontent.com`（301 之后加载）。该域名在国内访问极不稳定，图片大面积加载失败的风险高——这正是当初选择「GitHub + jsDelivr」图床方案要规避的问题。此外 raw.githubusercontent.com 无 CDN 缓存策略，且有速率限制。

### 可选的迁移方案（待定）

1. **Cloudflare Workers 反代 raw.githubusercontent.com**：站内文章 [GitHub 私有仓库 + Cloudflare Workers 图床教程](../src/content/posts/github-image-hosting-cloudflare.md) 就是这个方案。若反代已部署，把文章里的 `cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main` 批量替换为反代域名即可，零存储成本。
2. **迁移到 Cloudflare R2**：本站背景视频已托管在 R2（`video.yorushika.cyou`）。R2 免费额度 10GB、出口流量免费，全部文章图片合计预计不足 100MB，绰绰有余；自定义域名走 CF 自动证书。需要把图床仓库图片一次性上传 R2 并批量替换 URL。
3. **维持现状**：图片经 301 仍可访问（海外正常），接受国内访问不稳定的风险。

## PicGo 配置（新增图片）

无论最终选哪个方案，图床仓库的使用方式不变，PicGo 的「自定义域名」务必带分支：

```
https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main
```

若采纳方案 1 或 2，这里应改成对应的反代域名 / R2 域名。

## 修复记录

- **2026-10-01**：批量将 6 篇文章共 137 处无分支 URL 补上 `@main`，涉及：
  - `cloudflare-temp-email-domain-tutorial.md`（91 处）
  - `github-image-hosting-cloudflare.md`（13 处）
  - `cloudflare-email-routing-custom-domain.md`（13 处）
  - `github-picgo-free-image-hosting.md`（12 处 + 更正正文中教读者填写的自定义域名格式，示例从第三方仓库改为本站仓库）
  - `google-search-central-live-2026-seo-insights.md`（6 处）
  - `google-ai-content-seo-truth.md`（2 处）
- **2026-10-01**：发现 jsDelivr 全局 301 跳转问题（见上），记录待迁移。

## 相关文件

- `src/config/resourcesConfig.ts`：资源页图标引用，已是 `@main` 格式，可作参照。
