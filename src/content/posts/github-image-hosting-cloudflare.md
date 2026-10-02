---
title: GitHub 图床 + Cloudflare 加速访问教程
published: 2025-04-25
updated: 2025-04-25
description: 用 GitHub 私有仓库存图 + Cloudflare Workers 反代 raw.githubusercontent.com，打造免费且可加速的自建图床。教程覆盖创建仓库、生成 Token、部署 Workers 反代脚本、绑定自定义域名，以及 PicGo 上传配置。
tags: [GitHub, Cloudflare, 图床, PicGo, 建站]
category: 技术
image: ./images/github-image-hosting-cloudflare.avif
slug: github-image-hosting-cloudflare
author: skilladd
sourceLink: https://skilladd.org/2025/04/25/15.GitHub%E5%9B%BE%E5%BA%8A-Cloudflare%E5%8A%A0%E9%80%9F%E8%AE%BF%E9%97%AE%E6%95%99%E7%A8%8B/
licenseName: CC BY-NC 4.0
licenseUrl: https://creativecommons.org/licenses/by-nc/4.0/
---

<iframe src="https://player.bilibili.com/player.html?bvid=BV1pKLHzXEUy&amp;page=1&amp;high_quality=1&amp;autoplay=0" style="width: 100%; aspect-ratio: 16 / 9; border: none;" allowfullscreen></iframe>

---

## 前期准备

1. Cloudflare 的账号：[Cloudflare Dashboard](https://dash.cloudflare.com/)（**必须**）
2. GitHub 的账号：[GitHub](https://github.com/)（**必须**）
3. 一个域名

## 创建 GitHub 仓库

登录 GitHub，点击创建仓库的按钮。

![创建 GitHub 仓库](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/github-image-hosting/github1.png)

输入**自定义仓库名**，勾选上仓库**私有**

![设置仓库名并勾选私有](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/github-image-hosting/github2.png)

仓库创建后，随便创建一个文件

![在仓库中创建文件](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/github-image-hosting/github3.png)

点击创建，到此存储图片的仓库创建完成。

![仓库创建完成](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/github-image-hosting/github5.png)

## 获取 GitHub 的 Token

1. 点击 GitHub 头像，点击**设置**（**settings**）的按钮
2. 点击「**开发者设置**」

![进入开发者设置](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/github-image-hosting/github6.png)

创建 token

![创建 token](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/github-image-hosting/github7.png)

![配置 token 权限](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/github-image-hosting/github8.png)

创建完成，保存一下 token。

![保存 token](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/github-image-hosting/github9.png)

## CloudFlare 加速图床访问

### 创建 workers 项目

1. 登录 CloudFlare 的网站
2. 创建一个 **workers** 的项目

![创建 workers 项目](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/github-image-hosting/github11.png)

在 **Workers.js**，粘贴如下代码

<!-- CODE-MARKER -->
```js
// raw.githubusercontent.com是GitHub提供的直接访问仓库原始文件（如代码、图片、文本）的域名。
const upstream = "raw.githubusercontent.com";

// Custom pathname for the upstream website.
const upstream_path = "/<用户>/<仓库名>/<分支>";

// github personal access token.
const github_token = "github的token";

// Website you intended to retrieve for users using mobile devices.
const upstream_mobile = upstream;

// Countries and regions where you wish to suspend your service.
const blocked_region = [];

// IP addresses which you wish to block from using your service.
const blocked_ip_address = ["0.0.0.0", "127.0.0.1"];

// Whether to use HTTPS protocol for upstream address.
const https = true;

// Whether to disable cache.
const disable_cache = false;

// Replace texts.
const replace_dict = {
  $upstream: "$custom_domain",
};

addEventListener("fetch", (event) => {
  event.respondWith(fetchAndApply(event.request));
});

<!-- CODE-MARKER2 -->
async function fetchAndApply(request) {
  const region = request.headers.get("cf-ipcountry")?.toUpperCase();
  const ip_address = request.headers.get("cf-connecting-ip");
  const user_agent = request.headers.get("user-agent");

  let response = null;
  let url = new URL(request.url);
  let url_hostname = url.hostname;

  if (https == true) {
    url.protocol = "https:";
  } else {
    url.protocol = "http:";
  }

  if (await device_status(user_agent)) {
    var upstream_domain = upstream;
  } else {
    var upstream_domain = upstream_mobile;
  }

  url.host = upstream_domain;
  if (url.pathname == "/") {
    url.pathname = upstream_path;
  } else {
    url.pathname = upstream_path + url.pathname;
  }

  if (blocked_region.includes(region)) {
    response = new Response(
      "Access denied: WorkersProxy is not available in your region yet.",
      {
        status: 403,
      }
    );
  } else if (blocked_ip_address.includes(ip_address)) {
    response = new Response(
      "Access denied: Your IP address is blocked by WorkersProxy.",
      {
        status: 403,
      }
    );
  } else {
<!-- CODE-MARKER3 -->
    let method = request.method;
    let request_headers = request.headers;
    let new_request_headers = new Headers(request_headers);

    new_request_headers.set("Host", upstream_domain);
    new_request_headers.set("Referer", url.protocol + "//" + url_hostname);
    new_request_headers.set("Authorization", "token " + github_token);

    let original_response = await fetch(url.href, {
      method: method,
      headers: new_request_headers,
      body: request.body,
    });

    connection_upgrade = new_request_headers.get("Upgrade");
    if (connection_upgrade && connection_upgrade.toLowerCase() == "websocket") {
      return original_response;
    }

    let original_response_clone = original_response.clone();
    let original_text = null;
    let response_headers = original_response.headers;
    let new_response_headers = new Headers(response_headers);
    let status = original_response.status;

    if (disable_cache) {
      new_response_headers.set("Cache-Control", "no-store");
    } else {
      new_response_headers.set("Cache-Control", "max-age=43200000");
    }

    new_response_headers.set("access-control-allow-origin", "*");
    new_response_headers.set("access-control-allow-credentials", true);
    new_response_headers.delete("content-security-policy");
    new_response_headers.delete("content-security-policy-report-only");
    new_response_headers.delete("clear-site-data");

<!-- CODE-MARKER4 -->
    if (new_response_headers.get("x-pjax-url")) {
      new_response_headers.set(
        "x-pjax-url",
        response_headers
          .get("x-pjax-url")
          .replace("//" + upstream_domain, "//" + url_hostname)
      );
    }

    const content_type = new_response_headers.get("content-type");
    if (
      content_type != null &&
      content_type.includes("text/html") &&
      content_type.includes("UTF-8")
    ) {
      original_text = await replace_response_text(
        original_response_clone,
        upstream_domain,
        url_hostname
      );
    } else {
      original_text = original_response_clone.body;
    }

    response = new Response(original_text, {
      status,
      headers: new_response_headers,
    });
  }
  return response;
}

<!-- CODE-MARKER5 -->
async function replace_response_text(response, upstream_domain, host_name) {
  let text = await response.text();

  var i, j;
  for (i in replace_dict) {
    j = replace_dict[i];
    if (i == "$upstream") {
      i = upstream_domain;
    } else if (i == "$custom_domain") {
      i = host_name;
    }

    if (j == "$upstream") {
      j = upstream_domain;
    } else if (j == "$custom_domain") {
      j = host_name;
    }

    let re = new RegExp(i, "g");
    text = text.replace(re, j);
  }
  return text;
}

async function device_status(user_agent_info) {
  var agents = [
    "Android",
    "iPhone",
    "SymbianOS",
    "Windows Phone",
    "iPad",
    "iPod",
  ];
  var flag = true;
  for (var v = 0; v < agents.length; v++) {
    if (user_agent_info.indexOf(agents[v]) > 0) {
      flag = false;
      break;
    }
  }
  return flag;
}
```

最后替换一下这两项内容，然后点击**部署**：

- `upstream_path = "/<用户>/<仓库名>/<分支>"`
- `github_token = "github的token"`

![替换配置并部署](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/github-image-hosting/github14.png)

### 配置域名

输入自定义域名

![绑定自定义域名](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/github-image-hosting/github15.png)

## PicGo 安装 / 配置

PicGo 项目地址：**[链接直达](https://github.com/Molunerfinn/PicGo)**

安装 PicGo 项目 2.4.0 版本下载：[链接直达](https://github.com/Molunerfinn/PicGo/releases)（**修复插件列表无法搜索的问题**）

![PicGo 上传配置](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/github-image-hosting/github16.png)

## 问题

每天有 **10 万次**的请求限制，但是对于个人而言，足以。

![每日请求量统计](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/github-image-hosting/2.png)
