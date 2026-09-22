---
title: 301重定向 vs Canonical标签：SEO实战经验分享
published: 2024-02-26
updated: 2026-01-26
description: 301重定向和canonical标签有什么区别？本文详细解析两者本质差异及实战应用场景，帮助你正确使用SEO技术避免权重损失和索引混乱。
tags: [增长与SEO, 避坑指南, SEO优化]
category: 增长与SEO
image: ./images/301-redirect-vs-canonical.avif
slug: 301-redirect-vs-canonical
series: "SEO&GEO 实战指南：从 Google SEO 到 AI 搜索"
author: MoeWah
sourceLink: https://blog.moewah.com/posts/708/
licenseName: CC BY-NC-SA 4.0
licenseUrl: https://creativecommons.org/licenses/by-nc-sa/4.0/
---

做了几年SEO，301重定向和canonical标签这两个东西，我踩过坑，也吃过亏。

> **301重定向和canonical本质完全不同**，但很多人搞混了，包括刚开始的我。

---

## 两者区别在哪？

301是服务器级别的指令，告诉搜索引擎和浏览器"这个页面搬家了"。用户访问旧URL时，地址栏会直接跳转到新URL，搜索引擎也会把旧页面的所有权重、排名信号全部传递给新页面。旧页面会被搜索引擎从索引中移除。

Canonical只是HTML里的一行标签，告诉搜索引擎"这几个页面内容都差不多，但这个URL才是正版"。用户访问时页面不跳转，地址栏也不变，搜索引擎只是会把排名信号合并到你指定的那个URL。**新旧页面可能都在索引里**。

### 可以这么理解

**301**是你真的搬了家，所有信件和访客都被引导到新地址，老地址没人去了。

**Canonical**是你还是住这里，但你告诉所有人"如果要在官方通讯录里找我，就记这个电话号码"，其他号码也能打到你。

---

## 实战场景

**旧页面要永久废弃**，所有流量和权重都导向一个全新的URL → 用301。

比如博客从 `www.moewah.com` 迁移到 `blog.moewah.com`，旧文章 `https://www.moewah.com/archives/5341.html` 迁移到 `https://blog.moewah.com/posts/5341/`，旧页面就不要了，直接301过去。

**新旧页面同时存在且内容高度相似**，但你需要保留所有URL供用户访问 → 用canonical。

同一篇文章可以通过 `https://blog.moewah.com/posts/5341/`、`https://blog.moewah.com/posts/5341/?ref=twitter`、`https://blog.moewah.com/posts/5341/?sort=newest` 访问，内容都差不多。就让后两个都指向 `https://blog.moewah.com/posts/5341/`。用户访问哪个都行，搜索引擎也知道哪个才是正版。

如果既改了URL又出现了新的重复页面？**两个都要用**。

先把旧的、已迁移的URL用301重定向到新的主URL，比如 `www.moewah.com` 的文章全部 301 到 `blog.moewah.com`。然后在新站点上，如果又因为参数产生了新的重复页面，就用canonical指向主URL。

---

## 配置示例

以 `www.moewah.com` 迁移到 `blog.moewah.com` 为例。

### Nginx 301 重定向

**全站所有页面 301 重定向**：

```nginx
server {
    listen 80;
    server_name www.moewah.com;
    return 301 https://blog.moewah.com$request_uri;
}

server {
    listen 443 ssl;
    server_name www.moewah.com;
    return 301 https://blog.moewah.com$request_uri;
}
```

**仅对文章页 301 重定向**：

把 `https://www.moewah.com/archives/5341.html` 迁移到 `https://blog.moewah.com/posts/5341/`

```nginx
# 方式1：单页面重定向
location = /archives/5341.html {
    return 301 https://blog.moewah.com/posts/5341/;
}

# 方式2：正则批量重定向
location ~ ^/archives/(\d+)\.html$ {
    return 301 https://blog.moewah.com/posts/$1/;
}
```

### Canonical 标签写法

**旧页面**：移除 canonical 标签或删除整个 HTML 文件

```html
<!-- 旧页面不添加 canonical -->
<!-- 文件会被 301 重定向，无需 canonical -->
```

**新页面**：canonical 指向自身 URL

```html
<head>
    <link rel="canonical" href="https://blog.moewah.com/posts/5341/" />
</head>
```

---

## 踩过的坑

**别对一个页面既做301又设置canonical**。旧页面要做301跳转前，先把canonical标签删了，不然搜索引擎会收到矛盾信号，搞不清你到底想干嘛。

**301重定向链别太长**。A重定向到B，B又重定向到C，甚至还有D，每次跳转都会削弱权重传递。A直接到C最好。

Canonical只是建议，不是命令。搜索引擎可能会忽略，但一般都会尊重。

规范页面要自引用，canonical指向自己。

### 排查检查清单

**canonical 检查点：**

- 每个页面只有一个canonical
- 不指向404页面
- 没有循环（A指向B，B指向A）
- HTTPS页面不指向HTTP
- 用绝对地址
- 所有重复内容都被覆盖了

**301 测试检查：**

- **测试301重定向要测所有HTTP方法**，不只是GET
- 验证返回状态码是"301 Moved Permanently"
- 重定向链不超过2次跳转

---

用301来永久搬家，用canonical来声明正版。

网站迁移时301是必须的、首要的操作，因为它直接影响用户访问和核心权重的传递。Canonical更多用于站内日常的SEO优化管理。

这么多年搞下来，我发现很多人把这两个东西混为一谈。其实它们解决的问题完全不一样：一个是处理URL变更，一个是处理重复内容。搞清楚这个，基本就不会再犯错。
