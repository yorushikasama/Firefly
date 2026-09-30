---
title: 如何利用 GitHub 搭建自己的免费图床？
published: 2021-01-27
description: 面向博客作者的免费图床搭建教程：用 GitHub 仓库当存储，配合 PicGo 上传、jsDelivr CDN 加速，零成本拥有一个可随博客迁移的在线图床，并附 Gitee、SM.MS、Imgur 等替代方案。
tags: [GitHub, 图床, PicGo, jsDelivr, 博客]
category: 技术
image: ./images/github-picgo-free-image-hosting.avif
slug: github-picgo-free-image-hosting
author: 村雨遥
sourceLink: https://zhuanlan.zhihu.com/p/347342082
licenseName: CC BY-NC 4.0
licenseUrl: https://creativecommons.org/licenses/by-nc/4.0/
---

## 前言

对于写博客的朋友来讲，图床这个东西一定不会陌生，而且在一定程度上也给不少人造成过困扰。

对于还不清楚的朋友，这里大概说一下图床是个啥。所谓图床，可以理解为一个在线的、对外开放的相册：大家都能访问查看，但编辑、删除这些操作仅限拥有者——就像网盘里分享出来的公开照片，你可以查看、下载编辑，但所有权仍属于分享者。

那这东西和写博客有啥关系呢？我们写博客时经常要插入图片，本地写作时能正常预览，可一旦发布到网上就会发现图片加载失败——因为本地图片存在本地，平台不会自动帮你上传。这时候图床的重要性就凸显出来了。（当然，如果你是直接在平台里编辑，一般平台会自动把图片上传到它自己的服务器，那就不用担心。）


有了图床，在本地写好博客之后，就能任意复制到其他平台，不用再担心图片丢失。


## 准备工作

正式开始前，你只需要准备一样东西：

> 一个 GitHub 账号

就这么简单，只要有一个 GitHub 账号，你就能拥有一个免费图床。如果还没有，先去 [GitHub](https://github.com/) 注册一个。


## 搭建过程

1. 登录 GitHub 后，创建一个新的仓库；
2. 填写仓库相关资料，一般只需选一个合适的仓库名，然后确保仓库为 `public`，其他保持默认即可；
3. 创建成功后会进入仓库主界面。至此，图床仓库就算建好了，接下来就是如何上传图片。


![新建仓库入口](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img/github-picgo-free-image-hosting/05.jpg)

[填写仓库信息并设为 public](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img/github-picgo-free-image-hosting/06.jpg)

![仓库创建完成后的主界面](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img/github-picgo-free-image-hosting/07.jpg)

## 上传图片

仓库虽然建好了，但用传统方式往 GitHub 上传图片太麻烦。这里推荐使用开源图床工具 [PicGo](https://molunerfinn.com/PicGo/) 来作为图片上传工具。

PicGo 的安装很简单，去 [官网](https://molunerfinn.com/PicGo/) 下载对应版本安装即可。下面主要讲讲怎么用它上传图片。配置过程如下：

![PicGo 主界面](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img/github-picgo-free-image-hosting/08.jpg)

1. 先去 GitHub 创建一个 token：依次打开 `Settings -> Developer settings -> Personal access tokens`，点击 `Generate new token`；
2. 填写并勾选相关信息，然后点击 `Generate token`；
3. token 生成后**只会显示一次**，最好立刻复制保存到备忘录，方便下次使用，否则下次就得重新新建；
4. 打开 PicGo，依次进入「图床设置 -> GitHub 图床」；
5. 填写相关信息，最后点击「确定」即可；如需将其作为默认图床，点击「设为默认图床」；
6. 之后就能通过上传区上传图片了（Ctrl+V 粘贴或直接拖拽都行），也可以用快捷键上传（默认为 `Ctrl + Shift + P`）。

![进入 Developer settings](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img/github-picgo-free-image-hosting/09.jpg)

![新建 Personal access token](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img/github-picgo-free-image-hosting/10.jpg)

![填写并勾选 token 权限](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img/github-picgo-free-image-hosting/11.jpg)

![复制生成的 token](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img/github-picgo-free-image-hosting/12.jpg)

![打开 PicGo 的 GitHub 图床设置](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img/github-picgo-free-image-hosting/13.jpg)

![填写图床配置信息](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img/github-picgo-free-image-hosting/14.jpg)

![通过上传区上传图片](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img/github-picgo-free-image-hosting/15.jpg)

## 加速访问

你可能会发现，上传到 GitHub 的图片有时访问很慢，甚至直接加载不出来，那该怎么办呢？

这时可以用 [jsDelivr](https://www.jsdelivr.com/) 进行免费加速，设置方法也很简单，只需在 PicGo 的图床配置里填入如下自定义域名即可：

> https://cdn.jsdelivr.net/gh/用户名/仓库名

比如作者的就是 `https://cdn.jsdelivr.net/gh/cunyu1943/blog-imgs`。

![在 PicGo 中填写 jsDelivr 自定义域名](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img/github-picgo-free-image-hosting/16.jpg)

## 图床推荐

除了用 GitHub 搭建，也可以用 Gitee 来搭建，方式和本文大致相同。此外再推荐几个免费图床，大家可以按自己的喜好选择：

1. [路过图床](https://imgchr.com/)
2. [SM.MS](https://sm.ms/)
3. [Imgur](https://imgur.com/)

## 总结

到这里，搭建免费图床的教程就结束了。总结一下，主要有以下几部分：

1. 准备一个 GitHub 账号；
2. 搭建图床仓库；
3. 配置 PicGo 上传图片；
4. 用 jsDelivr 加速访问；
5. 其他免费图床推荐。

如果对上面的内容有疑问，欢迎留言交流。
