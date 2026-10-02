---
title: 小白也能看懂的自建 Cloudflare 临时邮箱教程（域名邮箱）
published: 2026-03-05
description: 手把手教你把域名托管到 Cloudflare、配置邮件路由，并在 Cloudflare Workers + Pages 上部署开源项目 cloudflare_temp_email，最终拥有一个支持多用户的自建临时域名邮箱。
tags: [Cloudflare, 临时邮箱, 域名邮箱, Workers, 教程]
category: 技术
image: ./images/cloudflare-temp-email-domain-tutorial.avif
slug: cloudflare-temp-email-domain-tutorial
author: XiaoHuang
sourceLink: https://linux.do/t/topic/1666961
licenseName: CC BY-NC 4.0
licenseUrl: https://creativecommons.org/licenses/by-nc/4.0/
---

> 本文迁移自 LINUX DO 社区教程，仅保留有价值的正文内容，已标明出处。原作者允许在标注来源的前提下转载。

## 写在前面


**注意：** 此为临时邮箱。如果你会给域名一直续费，就能一直用自己的域名邮箱；如果只是「年抛域名」（用一年就丢弃），**请不要拿它注册重要的平台**。购买域名时也请留意续费价格。

整篇教程分成两部分：

- **第一部分**：把域名托管到 Cloudflare，并配置用自己的域名接收邮件、转发到常用邮箱。
- **第二部分**：在 Cloudflare 上部署并配置 `cloudflare_temp_email` 项目，得到一个完整的临时邮箱站点。

## 开始前的准备

- **一个域名**：可在腾讯云、阿里云等任意支持域名注册的服务商购买。本文以腾讯云为例，示例域名为 `quickbox.cloud`（挑了个便宜的年抛域名来演示）。
- **一个 Cloudflare 账号**：没有就去 [cloudflare.com](https://www.cloudflare.com/) 注册一个，注册几乎没有验证，很方便。
- **项目地址**：[dreamhunter2333/cloudflare_temp_email](https://github.com/dreamhunter2333/cloudflare_temp_email)，原作者 @awsl，[官方文档](https://temp-mail-docs.awsl.uk/zh/)。记得给项目点个 star。

![在腾讯云购买域名](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/001.jpeg)

## 第一部分：将域名托管到 Cloudflare

> 建议先登录 Cloudflare，把右上角语言设置成简体中文，方便和教程对照。

![Cloudflare 语言设置为简体中文](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/002.png)

### 添加站点

进入 Cloudflare 后台，添加站点，填入你自己的域名。

![添加站点入口](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/003.png)

![填写要托管的域名](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/004.png)

![选择免费计划](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/005.jpeg)

![Cloudflare 扫描现有 DNS 记录](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/006.png)

Cloudflare 会给出两个 DNS 服务器地址，稍后要填到域名服务商那里。

![Cloudflare 分配的两个 DNS 服务器地址](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/007.png)

### 在域名服务商修改 DNS 服务器（以腾讯云为例）

打开域名服务商控制台，找到域名管理，把 DNS 服务器改成 Cloudflare 给的两个地址。

![打开腾讯云控制台](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/008.png)

![进入我的域名](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/009.png)

![域名管理页面](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/010.png)

![修改 DNS 服务器入口](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/011.png)

![粘贴 Cloudflare 提供的两个 DNS 地址](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/012.png)

回到 Cloudflare 点击检查；如果没反应，等十分钟左右再试。

![回到 Cloudflare 点击检查](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/013.png)

![等待激活](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/014.png)

![耐心等待 DNS 生效](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/015.png)

大概 7～8 分钟后，出现这样的提示就代表域名托管成功了。

![域名激活成功提示](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/016.png)

![站点已激活概览](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/017.png)

### 配置电子邮件路由

如果你只是想拥有一个自己的临时域名邮箱、只做接收（把邮件转发到常用邮箱），那么配置完这一步就够了，不用继续往下部署项目。

举个例子，我的域名是 `quickbox.cloud`，常用邮箱是 `xxxx@gmail.com`。配置 Catch-all 后，无论前缀是什么（`xiaohuang@`、`linuxdo@`、`bbb@`……），只要是 `*@quickbox.cloud` 都会转发到 `xxxx@gmail.com`。

![进入电子邮件路由](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/018.png)

![开始设置邮件路由](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/019.png)

> 在「目标地址」里填写你能收到邮件的常用邮箱，点击创建并继续。随后你的邮箱会收到一封验证邮件，打开链接即可完成验证。

![创建目标地址（填常用邮箱）](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/020.png)

![目标地址待验证](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/021.png)

![配置 Catch-all 规则](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/022.png)

![启用 Catch-all](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/023.png)

![设置转发到目标地址](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/024.png)

![邮件路由启用成功](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/025.png)

至此第一部分的配置全部完成，可以发一封测试邮件验证转发是否生效。

![测试收到转发邮件](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/026.png)

## 第二部分：在 Cloudflare 上部署 cloudflare_temp_email

既然已经能收到邮件了，为什么还要部署项目？因为项目提供了完整的临时邮箱站点，可以创建多个邮箱、查看邮件正文、分享给朋友一起使用。

### 创建 D1 数据库

回到 Cloudflare 首页，创建一个 D1 数据库，名称随便起。

![回到首页创建 D1](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/027.png)

![D1 数据库命名](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/028.png)

打开项目的 [db/schema.sql](https://github.com/dreamhunter2333/cloudflare_temp_email/blob/main/db/schema.sql) 复制里面的 SQL。

![打开 schema.sql](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/029.png)

把复制的 SQL 粘贴到输入框，点击「执行」。

![粘贴 SQL 并执行](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/030.png)

![执行成功](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/031.png)

回到概述刷新一下，表数量是 **10** 就代表成功。

![表数量为 10](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/032.png)

### 配置 KV 缓存

创建一个 KV 命名空间，名字自己起，先创建好，一会绑定要用。

![创建 KV 命名空间](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/033.png)

![KV 命名](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/034.png)

### 创建 Workers 部署后端

新建一个 Worker，名字随便填。

![Workers 入口](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/035.png)

![创建 Worker](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/036.png)

![Worker 命名](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/037.png)

#### 绑定 D1 数据库和 KV 缓存

进入 Worker 的设置，添加绑定。

![进入设置添加绑定](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/038.jpeg)

![添加 D1 数据库绑定](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/039.png)

> 数据库绑定的变量名称一定要填 `DB`，不能自己乱填！

![变量名称填 DB](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/040.png)

![KV 绑定入口](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/041.png)

![添加 KV 绑定](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/042.png)

> KV 绑定的变量名称也要和文档保持一致！

![KV 变量名称](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/043.png)

### 配置环境变量参数

参数很多，但不是所有都要配。下面列出的都建议配置，可以一次性填好再部署。**注意每个参数的「类型」（文本 / JSON），类型填错可能失效。**

![环境变量入口](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/044.png)

![添加变量](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/045.png)

![选择变量类型](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/046.png)

**DOMAINS**（类型：JSON）— 临时邮箱可用的域名列表。

```json
[
    "quickbox.cloud"
]
```

**DEFAULT_DOMAINS**（类型：JSON）— 未登录 / 无角色用户可用的域名列表。建议直接留空。

```json
[]
```

**DISABLE_ANONYMOUS_USER_CREATE_EMAIL**（类型：文本）— 设为 `true` 后，匿名用户无法创建邮箱，必须登录。

```
true
```

**JWT_SECRET**（类型：文本）— JWT 签名密钥，用于登录凭证和鉴权。请用 [Credentials Generator](https://www.librechat.ai/toolkit/creds_generator) 在线生成一个，**不要照抄别人的**。

![用 LibreChat 生成 JWT_SECRET](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/047.png)

**ADMIN_PASSWORDS**（类型：JSON）— 后台管理登录密码，可多个。不配置则无法登录后台。

```json
[
    "mypassword123"
]
```

**ENABLE_USER_CREATE_EMAIL**（类型：文本）— 是否允许用户创建邮箱地址，填 `true`。

```
true
```

**ENABLE_USER_DELETE_EMAIL**（类型：文本）— 是否允许用户删除邮件，默认 `false` 即可。

```
false
```

**USER_ROLES**（类型：JSON）— 配置用户角色及各角色可用的域名。单域名场景可以这样：

```json
[
    {
        "domains": ["quickbox.cloud"],
        "prefix": "",
        "role": "vip"
    },
    {
        "domains": ["quickbox.cloud"],
        "prefix": "",
        "role": "admin"
    }
]
```

**ADMIN_USER_ROLE**（类型：文本）— 可访问后台的角色名，被赋予该角色的用户即拥有后台权限。

```
admin
```

**ENABLE_AUTO_REPLY**（类型：文本）— 是否允许自动回复邮件，填 `false` 即可。

```
false
```

> 按上面给的参数配置好，一共是 10 个参数。

![配置完成的 10 个参数](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/048.png)

### 部署后端代码

先配置兼容性标志。

![兼容性标志入口](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/049.png)

![添加兼容性标志](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/050.png)

填入：

```
nodejs_compat
```

从项目的 [Releases](https://github.com/dreamhunter2333/cloudflare_temp_email/releases) 下载最新版本的 `worker.js`。

![GitHub Releases 页面](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/051.png)

![下载 worker.js](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/052.png)

把文件直接拖进去上传。

![拖拽上传代码](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/053.jpeg)

![上传完成](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/054.png)

如果拖拽上传失败，也可以打开代码文件全选复制，直接粘贴过来。

![打开代码全选复制](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/055.jpeg)

![粘贴代码](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/056.jpeg)

![点击部署](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/057.jpeg)

刷新后显示 OK，就代表后端部署成功。但还没结束，还要配置自定义域。

![后端部署成功](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/058.jpeg)

### 配置后端自定义域

给后端 Worker 绑定一个自定义域（域名改成你自己的）：

```
apimail.你的域名.com
```

![自定义域入口](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/059.png)

![填写 apimail 子域名](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/060.png)

访问该地址如果没显示 OK，稍等一会再试。

![访问后端显示 OK](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/061.png)

### 重新配置邮件路由

如果之前配置了 Catch-all 转发到常用邮箱，**这一步必须做**，否则邮箱站点收不到任何邮件——需要把 Catch-all 改成投递到部署好的 Worker。

![回到首页](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/062.png)

![进入邮件路由](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/063.png)

![修改 Catch-all 指向 Worker](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/064.png)

![保存路由规则](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/065.png)

### 部署前端页面

上一步配置了自定义域，就可以通过自己的域名访问后端接口了。生成前端代码时要填的后端地址就是刚才的自定义域（记得用 https，并且换成你自己的）：

```
https://apimail.你的域名.com
```

在 [Cloudflare Pages 前端文档](https://temp-mail-docs.awsl.uk/zh/) 页面生成前端代码。

![填写后端地址生成前端代码](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/066.jpeg)

![下载前端代码](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/067.png)

回到 Cloudflare 首页，创建一个 Pages 项目。

![Cloudflare Pages 入口](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/068.png)

![创建 Pages 项目](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/069.png)

把刚下载的前端代码文件拖进去。

![拖拽上传前端代码](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/070.jpeg)

> 「未找到处理」一定要改成 **single-page-application**，这样刷新才不会 404。项目名随便起。

![设置 SPA 处理方式](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/071.png)

![部署中](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/072.png)

![部署完成](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/073.png)

同样给前端添加自定义域：

```
mail.你的域名.com
```

![添加前端自定义域](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/074.png)

![填写 mail 子域名](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/075.png)

![确认添加](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/076.png)

![访问前端页面](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/077.png)

![用管理员密码登录](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/078.png)

登录成功，恭喜你，部署完成！

![登录成功，部署完成](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/079.png)

## 基本使用：给朋友创建一个账号

在后台可以为朋友创建独立用户，让 TA 用你的域名创建邮箱。

![后台用户管理](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/080.png)

![用户列表](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/081.png)

![创建新用户](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/082.png)

![填写用户信息](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/083.png)

![为用户分配角色](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/084.png)

![用户创建完成](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/085.png)

把前端地址发给对方，用分配的账号密码登录即可创建邮箱。

![对方登录](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/086.png)

![登录成功](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/087.png)

![创建邮箱地址](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/088.png)

![邮箱创建成功](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/089.png)

![使用邮箱地址](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/090.png)

![查看收件箱](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cloudflare-temp-email/091.png)

## 结语

到这里，一个支持多用户的自建临时邮箱就搭建完成了。再次提醒：**请不要拿它注册重要或危险的平台**，临时邮箱终究是临时的。



