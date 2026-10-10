---
title: Ubuntu 24.04 搭建 VLESS + REALITY + Vision 节点（3x-ui）
published: 2026-07-30
description: 在 Ubuntu 24.04 上用 3x-ui 搭建 VLESS + TCP(RAW) + REALITY + xtls-rprx-vision 节点的完整步骤，涵盖系统准备、BBR、UFW 防火墙、面板安装与 2FA、入站参数、订阅端口排查和客户端校验。
tags: [VLESS, REALITY, 3x-ui, Xray, Ubuntu]
category: 技术
image: ./images/ubuntu-vless-reality-vision-3x-ui.avif
slug: ubuntu-vless-reality-vision-3x-ui
author: SKYBYTE
sourceLink: https://skylink9119.github.io/2026/07/30/2026-august-debian-vless-tcp-raw-reality-vision/
licenseName: CC BY-NC-SA 4.0
licenseUrl: https://creativecommons.org/licenses/by-nc-sa/4.0/
---

`VLESS + TCP(RAW) + REALITY + xtls-rprx-vision` 是目前 Xray 生态里变量最少、故障点最少的组合之一。它不叠加 WebSocket、ECH、后量子等新参数，官方长期维护，客户端兼容面广，排障也简单，适合作为长期使用的主力节点。

下面是在 Ubuntu 24.04 上从零搭建的完整流程。

## 一、系统准备

以下命令以 root 执行。如果你的登录用户是 `ubuntu`（云镜像默认），在命令前加 `sudo`，或者先执行 `sudo -i` 切到 root。

### 1. 更新系统

```bash
apt update
apt full-upgrade -y
```

如果过程中弹出 needrestart 的交互界面，直接回车用默认选项即可。升级包含内核时，建议重启一次再继续。

### 2. 安装基础工具

```bash
apt install -y curl wget vim socat ca-certificates lsb-release gnupg ufw
```

Ubuntu 24.04 自带 ufw，这里重复安装不会有问题。

### 3. 设置时区

```bash
timedatectl set-timezone Asia/Shanghai
```

### 4. 开启 BBR

```bash
sh -c 'echo "net.core.default_qdisc=fq" >> /etc/sysctl.conf'
sh -c 'echo "net.ipv4.tcp_congestion_control=bbr" >> /etc/sysctl.conf'
sysctl -p
lsmod | grep bbr
```

`lsmod | grep bbr` 有返回值就说明 BBR 已启用。前两行是追加写入，重复执行会在 `/etc/sysctl.conf` 里留下重复配置，执行一次即可。

## 二、安装 3x-ui 面板

### 1. 执行安装脚本

```bash
bash <(curl -Ls https://raw.githubusercontent.com/mhsanaei/3x-ui/master/install.sh)
```

安装完成后记下面板的用户名、密码和端口。面板端口建议避开 `80`、`443`、`8080`，例如用 `54321`，避免和后面的节点端口混在一起。

截至 2026 年 7 月 30 日，3x-ui 稳定版为 v3.6.0，集成 Xray-core v26.7.28（该核心版本上游标记为预发布）。建议使用稳定更新通道，不要切到 Dev 通道，安装后可在面板里确认实际版本。

### 2. 开启防火墙

```bash
ufw default deny incoming
ufw default allow outgoing

ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 54321/tcp

ufw enable
ufw status
```

把 `54321` 换成你自己的面板端口。各行含义：

- `22/tcp`：SSH 登录
- `80/tcp`：Let's Encrypt 证书申请与续签
- `443/tcp`：节点入站端口
- `54321/tcp`：面板端口

如果你的 SSH 端口不是 22，改成真实端口，否则会把自己锁在服务器外面。云厂商后台的安全组也要同步放行这些端口，很多人以为开了 ufw 就够了，实际是被安全组挡住。

### 3. 查订阅端口

面板能登录、节点在监听，但客户端更新订阅一直超时，最常见的原因是订阅端口没有放行。三类端口要先分清：

- 面板端口：登录 3x-ui 后台用，例如 54321
- 节点端口：客户端实际连接入站用，例如 443
- 订阅端口：客户端拉取订阅链接时访问的端口，例如 2096

三者可以各不相同。查订阅端口有几种方法。

最直接的是看订阅链接本身：链接里显式写了端口就用那个端口；没写端口就按协议默认，https 是 443，http 是 80。

有服务器权限的话，看日志最稳：

```bash
journalctl -u x-ui -n 50 --no-pager
```

输出里类似 `Sub server running HTTPS on [::]:2096` 的 2096 就是订阅端口，而 `Web server` 后面的是面板端口。也可以直接看监听：

```bash
ss -tlnp | grep x-ui
```

确认后放行：

```bash
ufw allow 2096/tcp
ufw reload
```

云厂商安全组同样要放行。如果订阅链接前面套了 Nginx 或 Caddy 反代，客户端实际访问的可能是 443 而不是 x-ui 内部的订阅端口，以订阅链接实际内容为准。

### 4. 修改密码并开启 2FA

首次登录后先处理认证信息，再去建入站。进入 Panel Settings → Authentication，修改用户名和密码，开启 Two-Factor Authentication，用手机验证器扫码，例如 Google Authenticator、Microsoft Authenticator、Aegis，然后把当前验证码填回面板保存。

两个细节别省：2FA 的密钥或恢复信息要单独保存，不要只留在手机里；开启后退出面板重新登录一次，确认用户名、密码和动态验证码都正常。

忘记面板密码或 2FA 配错进不去时，在服务器执行 `x-ui`，按提示走账号重置流程，菜单里也会询问是否禁用已配置的 2FA。

## 三、添加 VLESS + REALITY + Vision 入站

在面板进入「入站列表」，点击「添加入站」。

基础设置：

- 协议：`vless`
- 监听 IP：留空
- 端口：`443`
- 客户端 ID：随机 UUID
- Email：随意填写
- Flow：必须选择 `xtls-rprx-vision`

传输设置：

- 网络：`tcp` 或 `raw`
- 安全：`reality`

新版 Xray 文档中，`TCP` 的主名已改成 `RAW`，但很多面板和客户端里仍然显示为 `TCP`，两者是同一类传输。

## 四、配置 REALITY 参数

REALITY 开启后重点只看这几项：

- target / dest：伪装目标站，例如 `dl.google.com:443`
- serverNames：对应 SNI，例如 `dl.google.com`
- privateKey：点击生成 X25519 密钥
- shortIds：随机生成
- fingerprint / uTLS：`chrome`
- spiderX：留空或填 `/`

几点注意：

- 目标站必须能从当前 VPS 正常访问，并支持 TLS 1.3、证书与 SNI 匹配
- 示例用的 `dl.google.com` 在不同线路上的可用性不一样，不要机械照抄
- 客户端反复出现 REALITY authentication failed 或连接超时，先检查 SNI、密钥和 Short ID，再换一个从 VPS 实测可访问的目标站
- uTLS 用 `chrome` 就够了，不建议乱改；spiderX 保持简单，没必要过度设计

## 五、保存并验证

保存入站后重启 Xray 核心，然后在入站列表复制节点链接或二维码，导入客户端。

导入后重点确认这几项：

- Security：`reality`
- Network：`tcp` / `raw`
- Flow：`xtls-rprx-vision`
- SNI：与你填写的伪装域名一致
- Public Key：服务端生成的公钥
- Short ID：与你分配的一致
- Fingerprint：`chrome`

## 参考

- [Project X VLESS Inbound 文档](https://xtls.github.io/en/config/inbounds/vless.html)
- [Project X VLESS Outbound 文档](https://xtls.github.io/en/config/outbounds/vless.html)
- [Project X Transport / REALITY 文档](https://xtls.github.io/en/config/transport.html)
- [Xray-core Releases](https://github.com/XTLS/Xray-core/releases)
- [3x-ui Releases](https://github.com/MHSanaei/3x-ui/releases)
- [XTLS/Xray-examples 官方示例库](https://github.com/XTLS/Xray-examples)
- [VLESS-TCP-XTLS-Vision-REALITY 官方示例](https://github.com/XTLS/Xray-examples/tree/main/VLESS-TCP-XTLS-Vision-REALITY)
