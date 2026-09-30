---
title: 使用 Cloudflare 邮件转发功能实现自定义邮箱域
published: 2023-09-17
updated: 2023-12-29
description: 利用 Cloudflare Email Routing 免费实现自定义域名邮箱：把域名 DNS 托管到 Cloudflare、配置目标地址与 Catch-all 规则，让任意前缀的邮件转发到你的常用邮箱，并附 Gmail / Outlook / 163 的自定义域名代发。
tags: [Cloudflare, 域名邮箱, 邮件转发, Email Routing, 教程]
category: 技术
image: ./images/cloudflare-email-routing-custom-domain.avif
slug: cloudflare-email-routing-custom-domain
author: LeeLurker
sourceLink: https://hexo.leelurker.com/posts/11197
licenseName: CC BY-NC 4.0
licenseUrl: https://creativecommons.org/licenses/by-nc/4.0/
---

> 本文迁移自 LeeLurker 的博客，仅保留有价值的正文内容，已标明出处。

## 简介

Cloudflare 是世界上用户量最大的 CDN 服务商，截至 2022 年 1 月已有 400 万用户。它主要提供 DNS 解析、网络安全 DDoS 防护、CDN 等网络相关服务，因为基础服务免费所以用户众多。除 DDoS 防护和 CDN 外，Cloudflare 近年新业务扩展迅速，如 Cloudflare Registrar 域名购买服务、Cloudflare R2 对象存储服务等。

本文主要介绍 Cloudflare Email Routing 邮箱转发服务的使用。有个人域名的朋友，可以用企业邮箱服务或者邮箱转发服务来创建自定义域名邮箱。既然 DNS 解析服务商直接提供了免费且配置简单的服务，干嘛不去试下呢？

## 一、使用 Cloudflare 域名解析服务

如果你的域名已使用 Cloudflare 作为域名解析服务商，请直接看第三步。

如果仍在使用域名注册商自带的 DNS 解析，或使用其他服务商，请自行斟酌是否要将 DNS 服务商换为 Cloudflare：切换后可能会导致国内访问较慢，且不支持同时使用多个域名服务商。

## 二、添加 Cloudflare 的 MX 记录

在 Cloudflare 后台点击 Email 即可开始配置（新版本菜单栏在左侧，与下图稍有区别）。点击添加记录即可一键导入 Cloudflare 自家的 MX 服务器记录信息。

> **注意**：DNS 解析记录中如果添加过其他邮箱服务商的 MX 记录，需要先删除原有 MX 记录。

![在 Cloudflare 后台一键导入 MX 记录](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img/cloudflare-email-forwarding/001.png)

## 三、配置 Cloudflare Email Routing

### 3.1 Destination addresses（目标地址）

这里首先配置目标邮箱地址。填入目标邮箱地址后，目标邮箱会收到来自 Cloudflare 的验证邮件，点击邮件里的链接即可验证成功。

Destination addresses 目标地址是**同一 Cloudflare 账户下所有域名共享的**。同一个账户下，如果你在配置域名 A 的邮件转发时验证了 `test@example.com`，那配置域名 B 的邮件转发时可以直接填入 `test@example.com`，无需再次验证。

![配置目标地址并完成验证](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img/cloudflare-email-forwarding/002.png)

### 3.2 Custom addresses（自定义地址）

添加且验证目标邮箱后，在这里填入自己想使用的域名前缀，指向目标邮箱即可。

### 3.3 Catch-all address（所有邮箱地址）

配置 Catch-all 后，无论邮箱前缀是什么，所有发给该域名的邮件都会转发到指定目标邮箱。

比较在乎隐私保护的朋友可以使用这个服务：比如在注册各种网站服务时用服务名称临时编个前缀——注册 craft 时就用 `craft@example.com`，注册 disney+ 时就用 `disney@example.com`。这样收到垃圾邮件时，可以知道是哪家服务商把你的信息泄露了，也可以根据收件人来拒收邮件。

## 四、使用自定义域名发邮件

对大部分用户来说，完成上述步骤、使用自定义域名进行**收件**即可。如果有使用自定义域名**发邮件**的需求，请继续往下看，这里以 Gmail 为例。

> **注意**：以下所有的邮件代发只是声明发件人为 `test@example.com`，但实际发件人均是各自代发邮箱的域名，**可能会暴露你的真实邮件地址**。如果不想要暴露自己常用邮件地址，建议单独申请一个邮箱专门用来代发邮件。

### 4.1 Gmail 邮箱

在浏览器新窗口打开 [Google 应用密码配置页面](https://myaccount.google.com/apppasswords)，登录谷歌账户后即可获取一个新的专属应用密码。「设备」可以选择其他，然后自己填入自定义信息方便记忆。获取密码后记得先保存。

![获取 Google 应用密码](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img/cloudflare-email-forwarding/004.png)

在 Gmail 设置 – Accounts and Import 中，找到发送邮件的位置，点击「添加新邮箱地址」。

![Gmail 中添加新邮箱地址](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img/cloudflare-email-forwarding/005.png)

点击添加新邮箱地址，会出现下图弹窗：

- **邮箱名字**会用于之后发邮件的默认名，会对外展示，请慎重填写。
- **域名邮箱地址**请事先在 Cloudflare 中配置此前缀域名邮箱，确认可以接收邮件。

![填写发件人名称与域名邮箱地址](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img/cloudflare-email-forwarding/006.png)

进入下一步，填写 SMTP 信息：

- **SMTP 服务器**：`smtp.gmail.com`
- **端口**：保持默认即可，如果需要变更协议，端口需要做相应变更
- **username**：填写原本 Gmail 的用户名，即邮箱地址中除去 `@gmail.com` 之外的信息
- **password**：使用上一步获取的专属应用密码

![填写 SMTP 参数](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img/cloudflare-email-forwarding/007.png)

如果上述信息填写成功，即可进入下一页面，Gmail 会收到一封邮件，填入对应的验证码即可。

![填入 Gmail 验证码](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img/cloudflare-email-forwarding/008.png)

配置完成后，发送邮件时就可以选择自定义邮箱了。也可以在 Gmail 设置中将此邮箱地址作为默认发件地址。

![发件时选择自定义邮箱](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img/cloudflare-email-forwarding/009.png)

### 4.2 Outlook 邮箱

- 进入邮箱设置 → 邮件 → 同步电子邮件

![Outlook 同步电子邮件设置](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img/cloudflare-email-forwarding/010.png)

- 选择或选择主类别

![选择主类别](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img/cloudflare-email-forwarding/011.png)

- 之后与 Gmail 操作相似，完成身份认证即可

### 4.3 163 邮箱

- 进入邮箱设置 → 账号与邮箱中心 → 添加发件人

![163 邮箱添加发件人](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img/cloudflare-email-forwarding/012.png)

- 选择通过网易代发

![选择通过网易代发](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img/cloudflare-email-forwarding/013.png)

- 完成代发邮件验证

![完成代发验证](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img/cloudflare-email-forwarding/014.png)

## 其他邮箱服务

| 服务 | 说明 |
| --- | --- |
| improvmx | 发件收费，服务器在法国 |
| forward email | 发件免费，隐私保护收费，服务器在美国 |
| mailway | 全免费，有延迟，服务器在美国 + 英国 |
| Cloudflare | 只能收，需要 DNS 托管 |
| Google Domains | 只能收，需要转移域名 |
| 腾讯企业邮 | 免费，需要绑定微信 |
| 网易企业邮 | 免费，广告多 |
| 阿里企业邮 | 免费版 5 年可手动续期 |

## 参考

- 如何使用 Cloudflare 配置域名邮箱收发邮件 – 数字移民
- 利用 Cloudflare 和 Gmail 配置域名邮箱的收发 | Verne in GitHub
- 隆重推出 Cloudflare 电子邮件路由服务！ – 知乎
- 域名邮箱操作指南 – Cloudflare 邮件转发 | yukaPriL
