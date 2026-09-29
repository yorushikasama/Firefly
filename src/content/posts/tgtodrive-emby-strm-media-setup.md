---
title: TgtoDrive + Emby STRM 观影方案分享
published: 2026-09-29
description: 基于 115 网盘 + STRM + 302 重定向搭建的家庭影音方案。用 TgtoDrive 负责 115 转存、重命名、STRM 生成与 302 重定向，配合 Emby、MediaInfoKeeper、danmu-api 与 Cloudflare Tunnel，实现发送分享链接即自动入库、随处流畅观影。
tags: [Emby, STRM, 115网盘, TgtoDrive, 家庭影音]
category: 技术
image: ./images/tgtodrive-emby-strm-media-setup.avif
slug: tgtodrive-emby-strm-media-setup
author: sugarbliss
sourceLink: https://linux.do/t/topic/2966994
licenseName: CC BY-NC 4.0
licenseUrl: https://creativecommons.org/licenses/by-nc/4.0/
---

各个视频平台资源分散，要追剧往往得同时开多个会员，而且部分影片是阉割版、画质也一般。为此可以走 **115 网盘 + STRM** 这套自建方案：把资源转存到网盘，用 STRM 文件在媒体中心里建立索引，再通过 302 重定向直连播放，兼顾画质与存储成本。

下面两篇教程是这套方案的基础参考：

- [因为买不起内存，我使用了树莓派 + 115 网盘 + Strm 搭建了家庭影音库（踩坑实录）](https://linux.do/t/topic/1546541)
- [使用 MoviePilot 实现 115 网盘 + Emby STRM 302 播放](https://linux.do/t/topic/719335)

在此基础上，本文改用新发现的开源库 **TgtoDrive**。如果你只用 115 网盘、不玩 PT，就用不到 MoviePilot，TgtoDrive 更为对口。

## 组件构成

- **TgtoDrive**：核心组件，负责 115 网盘转存、重命名、STRM 生成与 302 重定向。
- **Emby Server**：媒体中心，必不可少。
- **MediaInfoKeeper**：Emby 插件，作用类似"神医助手"，用于提高起播速度。
- **danmu-api**：弹幕服务，可选，不需要弹幕可以不装。
- **Cloudflare Tunnel**：内网穿透，用于在外网流畅访问 Emby；其他内网穿透方案同样可行。

## 配置教程

详细配置步骤见作者整理的文档：[https://strm.dpdkg.com/](https://strm.dpdkg.com/)

## 使用流程

全部配置完成后，在影巢、dian115 之类的资源分享平台拿到 115 分享链接，直接发送给 Telegram 机器人，即可坐等新片自动入库，整个流程相当顺畅。
