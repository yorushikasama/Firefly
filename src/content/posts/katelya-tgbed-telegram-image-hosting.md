---
title: Katelya-TGBed：基于 Telegram 的免费无限图床/网盘方案
published: 2026-09-24
description: Katelya-TGBed 是一个利用 Telegram 作为后端存储、部署在 Cloudflare Pages 上的免费无限图床/文件床方案。主打轻量、免费、易部署，支持图片/视频/音频/文档在线预览、CDN 加速、上传 API，以及 R2、KV 扩展。
tags: [Telegram, Cloudflare, 图床, 网盘, 开源]
category: 技术
image: ./images/katelya-tgbed-telegram-image-hosting.avif
slug: katelya-tgbed-telegram-image-hosting
author: katelya77
sourceLink: https://linux.do/t/topic/1568602
licenseName: CC BY-NC 4.0
licenseUrl: https://creativecommons.org/licenses/by-nc/4.0/
---

**Katelya-TGBed** 是一个利用 Telegram 作为后端存储、旨在提供无限空间且高速访问的图床/文件床方案。项目开源，主打**轻量、免费、易部署**，特别适合个人开发者、博客主或需要临时文件存储的场景。

> 项目地址：[GitHub - katelya77/Katelya-TGBed](https://github.com/katelya77/Katelya-TGBed)

## 核心特性

- **无限存储**：依托 Telegram 的服务器，理论上没有存储上限。
- **多种文件格式预览**：支持图片、视频、音频、文档格式的在线预览。
- **高速访问**：结合 Cloudflare 全球 CDN 加速，图片加载可达毫秒级响应。
- **API 支持**：提供标准的上传 API，方便集成到 PicGo 或其他工具中。
- **隐私安全**：支持自定义配置，图片/文件通过 Bot 传输，安全可控。
- **简单部署**：支持一键部署到 Cloudflare Pages，无需购买服务器，零成本运行。

> 理论上支持所有格式的文件存储。

## 技术栈

- **后端**：Cloudflare Pages
- **存储**：Telegram Bot API、R2、KV
- **前端**：HTML

## 如何使用

直接参考项目内的 **README 部署指导** 即可完成部署，流程较为简单；遇到问题也可以把文档发给 AI 协助排查。

## 项目地址

- **GitHub**：[github.com/katelya77/Katelya-TGBed](https://github.com/katelya77/Katelya-TGBed)
