---
title: CC Desk Tunnel：让云端 Claude Code 直接开发你的本机项目
published: 2026-10-07
description: 把官方 Claude Code 放在 VPS 的 Docker 里跑、模型请求从服务器发出，同时通过 WSS 与 SSH 隧道把本机的文件读写、编译、调试能力交给它，用起来接近本机安装的 CLI。低配小鸡也能带得动，附带作者关于安全与封号风险的提醒。
tags: [ClaudeCode, Claude, 开源, 隧道, 远程开发]
category: Claude
series: "Claude 实战指南：从订阅开通到云端开发"
seriesOrder: 2
image: ./images/cc-desk-tunnel-remote-claude-code.avif
slug: cc-desk-tunnel-remote-claude-code
author: feizhu
sourceLink: https://linux.do/t/topic/2990573
licenseName: CC BY-NC 4.0
licenseUrl: https://creativecommons.org/licenses/by-nc/4.0/
---

> 思路是让 Claude Code 跑在远程服务器上，但项目、编译器、编辑器继续留在本机——点开、选项目、开聊，不用一直挂着远程桌面，也不用在两台机器之间来回同步代码。

这里分享一个折腾出来的小工具，叫 **CC Desk Tunnel**，目前已有 Windows、Linux x86、Linux arm、macOS 多端。

它的基础思路相当于**通过远程桌面用 Claude 的 Plus 版本**：常见的防封做法是把 Claude 装在国外电脑上、自己通过远程桌面使用，避免本地环境泄露。本项目在此基础上新增了**一键与本地电脑互联，让 Claude 直接使用本地环境做开发**，使用体验近似于直接在本机安装 Claude Code。因为开发环境可以位于本机，**VPS 用低配机器就够了**。

## 起因

远程桌面用 Claude Code 实在麻烦：需要 VPS 有一定的配置，还要来回搬运项目代码。更麻烦的是调试部署任务——本地的一些内网环境在 VPS 上根本不存在，只能先用 Claude 开发完拷贝回本机，再让 Codex 调试。

于是就有了这个想法：**让 Claude Code 放在远程服务器上跑，但项目、编译器、编辑器这些都继续留在 Windows**。希望 Claude 能直接在本机干活，使用体验就像本机软件一样。

- 仓库：[cc-desk-tunnel](https://github.com/sun168567/cc-desk-tunnel)
- 安装包：[GitHub Releases](https://github.com/sun168567/cc-desk-tunnel/releases/latest)

结构原理图如下：

![CC Desk Tunnel 结构原理图](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cc-desk-tunnel/001.jpeg)

## 效果示意截图

（以下为 v0.2.7 版界面。10 月 12 日已更新 macOS 与 Linux 图形客户端实验性版）

客户端界面：左侧是项目与会话列表，右侧是流式回复、工具调用和审批状态。

![CC Desk Tunnel 桌面客户端会话界面](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cc-desk-tunnel/002.png)

账号与用量设置页：

![CC Desk Tunnel 账号设置界面](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cc-desk-tunnel/003.png)

macOS 端效果：

![CC Desk Tunnel macOS 客户端](https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img@main/cc-desk-tunnel/004.png)

## 结构原理

- **Linux 服务器**：Docker 里跑未修改的官方 Claude Code。模型请求从服务器发出，原生会话与登录也保存在服务器的持久数据目录。
- **Windows 本机**：桌面客户端，负责聊天、项目和设置界面，以及本机的文件读写、编译、测试。
- **控制消息 WSS 通道**：将本机 APP 中的会话提问等操作发送到远端 Claude Code 上执行，并将运行情况实时回传给本机显示。
- **SSH 通道**：将本机 Windows 的命令执行能力挂载到远端 Claude Code 上，使其能直接通过命令操作本机。

如果你本来就习惯在自己的 VPS 上跑 CC，又不喜欢远程桌面或者终端，本项目恰好提供了一个中间桥梁：运行端还是那台服务器，操作起来更接近本机桌面。

## 功能简介

- 基本的 coding agent 软件功能，如建立项目、在项目下建会话；会话可以搜索、改名、删除、分叉等。
- 美观地查看流式回复、思考摘要和工具入参、结果、中途干预等，可以理解为 CLI 的 UI 美化版。
- 模型、推理强度、审批模式、上下文占用和主动压缩，以及部分 Claude Code 设置。
- 从客户端走官方授权登录、退出，查看用量；另外有草稿保存、托盘和定时发送提示词。

## 安全提醒

作者在帖内明确列出了几点，使用前值得先读一遍：

**项目以 Vibe Coding 为主。** 仅是个人项目，主要靠 AI 编写，不够成熟，不能保证安全性，是否接受需要自行判断。

**服务器安全。** 服务器一定要是自己控制、可信的。连上以后，它就能直接操作你的本地电脑。

**报毒问题。** frpc 这类主流隧道工具因为经常被滥用，可能被归成远控或风险软件，开发测试时也遇到过杀毒软件报毒。如果担心风险，也可以自己从源码编译使用。

**不保证账号不被封。** 虽然 CLI 在服务器、模型请求也从服务器出去，理论上就是原生的外网运行环境，但 Claude 封号原因非常复杂，很难说这种方式就能保证账号不被封；封号也可能与 IP 干净程度、支付方式等有关。建议优先选择允许使用地区的、IP 比较干净的 VPS。

## 社区里的几个问题

- **VPS 配置**：作者用 2 核 1G 只在本地开发，感觉绰绰有余；如果需要云端开发环境，这个配置就不够了。
- **对 VPS 的要求**：找一台国外地区、IP 大体干净的中低配 VPS 即可，比如大厂云。作者提到封号和 IP 质量的关系没那么大，反而其他因素影响更大；如果在意 IP 质量也可以选家宽，但建议选择自带家宽环境的 VPS，避免开代理——代理本身也是可被识别的特征之一，反而增大风险。
