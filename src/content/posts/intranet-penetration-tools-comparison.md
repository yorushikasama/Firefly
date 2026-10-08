---
title: 内网穿透工具怎么选：frp、Tailscale、Cloudflare Tunnel、cpolar 横向对比
published: 2026-10-08
description: 家里或公司的机器没有公网 IP，外网就访问不到。frp、Tailscale、Cloudflare Tunnel、cpolar 这四款常被拿来对比，但它们的原理根本不在一个层面上。本文先把三类做法分清楚，再从部署成本、免费额度、带宽、安全性和国内可用性给出对比表格与选型建议。
tags: [内网穿透, frp, Tailscale, Cloudflare Tunnel, cpolar, 网络]
category: 技术
image: ./images/intranet-penetration-tools-comparison.avif
slug: intranet-penetration-tools-comparison
author: 楪祈
licenseName: CC BY-NC 4.0
licenseUrl: https://creativecommons.org/licenses/by-nc/4.0/
---

家里跑着 NAS、树莓派，或者一台常年开机的开发机，想在外网访问上面的服务，却发现压根连不上。运营商现在普遍不给公网 IPv4，光猫后面就是运营商的大内网；就算有公网 IP，路由器防火墙也默认拦掉所有入站连接。IPv6 理论上能绕开第一层，但很多网络环境根本没有 IPv6，或者光猫、路由、云服务商链路上某一环没打通。

内网穿透要解决的就是这个：没有公网 IP、也改不了路由器的情况下，让外网能访问到内网服务。

被问得最多的四款工具是 frp、Tailscale、Cloudflare Tunnel 和 cpolar。它们经常被放在一起比，但原理不在同一个层面上，直接比价格和功能容易选错方向。先分成三类，后面就顺了。

| 类型 | 工作方式 | 代表工具 |
|---|---|---|
| 自建反向代理 | 租一台公网 VPS，内网机器主动连上去，流量经 VPS 中转 | frp |
| SaaS 反向代理 | 服务商提供边缘节点，内网机器出站连过去，不用开入站端口 | Cloudflare Tunnel、cpolar |
| Mesh 组网 | 把多台设备组成虚拟局域网，设备之间直接互通 | Tailscale |

前两类解决的是「把一个服务暴露到公网」，第三类解决的是「让我的多台设备互相访问」。Tailscale 也能对外暴露服务，但要另外开 Funnel，限制还不少。

## frp：自己搭一个中转站

frp 是 Go 写的开源反向代理，Apache-2.0 协议，最新版本 v0.71.0（2026 年 8 月发布）。作者还在推进不兼容 v1 的 frp v2，项目算活跃。

架构就是标准的 C/S：frps 跑在有公网 IP 的服务器上，监听一个控制端口；frpc 跑在内网机器上，主动向 frps 建立长连接。外部请求打到 frps 之后，frps 顺着这条已经存在的长连接把流量转给 frpc，frpc 再交给本地服务。

因为是内网主动往外连，路由器上不用做端口映射，也不需要公网 IP——但你必须得有那台公网服务器。

一份最小的服务端配置 `frps.toml`：

```toml
bindPort = 7000
auth.method = "token"
auth.token = "换成你自己的高强度随机串"

# 域名虚拟主机（对外用 80/443 访问 HTTP 服务）
vhostHTTPPort = 80
vhostHTTPSPort = 443

# 面板，建议只对可信 IP 开放
webServer.addr = "0.0.0.0"
webServer.port = 7500
webServer.user = "admin"
webServer.password = "换成你的密码"
```

对应的 `frpc.toml`：

```toml
serverAddr = "你的公网服务器 IP"
serverPort = 7000
auth.method = "token"
auth.token = "与服务端保持一致"

# 把本地 8080 的网站映射成域名访问
[[proxies]]
name = "web"
type = "http"
localIP = "127.0.0.1"
localPort = 8080
customDomains = ["blog.example.com"]

# 把内网 SSH 映射到服务器的 6000 端口
[[proxies]]
name = "ssh"
type = "tcp"
localIP = "127.0.0.1"
localPort = 22
remotePort = 6000
```

这里能看出 frp 的两种暴露方式：HTTP 走 `customDomains` 用域名访问，TCP 走 `remotePort` 用端口访问，后者适合 SSH、数据库这类没域名的服务。

协议支持是 frp 最扎实的地方，TCP / UDP / HTTP / HTTPS 全覆盖。此外还有 xtcp 点对点模式（打洞成功就不过服务器，省带宽）、STCP 密钥保护、KCP 与 QUIC 传输、TLS 加密压缩、限速、连接池、负载均衡与健康检查、HTTP Basic Auth，以及一个 Prometheus 指标面板。配置能用 TOML / YAML / JSON 写，支持热重载。

麻烦的地方在于那台服务器得自己买、自己维护，安全责任也全在你身上。token 强度、面板暴露面、远端开放了哪些端口，任何一处疏忽都可能变成事故。另外有些杀毒软件会把 frpc 误判成木马，需要手动加白名单。

## Cloudflare Tunnel：不用管服务器的免费方案

Cloudflare Tunnel 的思路和 frp 一样，只是把中转服务器换成了 Cloudflare 自己的全球边缘网络。内网跑一个叫 `cloudflared` 的守护进程，它出站连到 Cloudflare 建立隧道；外面访问你的域名时，请求在 Cloudflare 边缘被接入，再顺着隧道回传到内网。

它吸引人的地方主要是这几点。免费，隧道本身不额外收费，也没有带宽和流量限制。不需要公网 IP，也不用开任何入站端口，因为连接方向是内网往外发起的。自动带 HTTPS、CDN 和 DDoS 防护，源站 IP 完全不暴露，这一点比端口映射实在得多。

前提是得有一个托管在 Cloudflare 的域名，NS 要指过去。没有域名就用不了，这是硬性条件。

创建隧道的基本流程：

```bash
cloudflared tunnel login          # 浏览器授权，选择要用的域名
cloudflared tunnel create my-nas  # 创建隧道，生成凭据文件
cloudflared tunnel route dns my-nas nas.example.com
```

然后写一份 `config.yml`，定义域名到本地服务的映射：

```yaml
tunnel: my-nas
credentials-file: /root/.cloudflared/<TUNNEL-ID>.json
ingress:
  - hostname: nas.example.com
    service: http://127.0.0.1:8080
  - hostname: ssh.example.com
    service: ssh://127.0.0.1:22
  # 兜底规则，不匹配的请求返回 404
  - service: http_status:404
```

装成系统服务开机自启：

```bash
sudo cloudflared service install
```

隧道有两种管理模式。本地管理就是上面这样，靠 `config.yml` 和凭据文件，配置都在机器上；远程管理是在 Cloudflare 后台点选配置，机器上只放一个 token。远程管理改配置不用登服务器，适合不想碰命令行的场景；本地管理便于纳入配置管理和版本控制。两者能力基本等价，按习惯选。

要提醒的是国内访问 Cloudflare 免费线路的延迟通常不理想，回源路径不由你控制。套了 CDN 之后实际体验可能反而不如直连，如果主要受众在国内，这一点得先实测。

## Tailscale：不是穿透服务，是给你组一个虚拟局域网

Tailscale 和前两者不是一类东西。它基于 WireGuard 做了一层 overlay 网络，把你的多台设备组成虚拟局域网，每台设备拿到一个 `100.x.y.z` 的地址，互相访问就像在同一个局域网里。

它不需要公网 IP，不需要域名，也不需要服务器。装上、登录，就完事了：

```bash
curl -fsSL https://tailscale.com/install.sh | sh
tailscale up
tailscale ip -4        # 查看本机在 tailnet 中的地址
```

之后在咖啡厅用笔记本访问家里的 NAS，地址就是那串 `100.x.y.z`。

NAT 打洞由 Tailscale 自己处理：能直连就直连（快），打不通就回退到 DERP 中继（稳但慢，流量绕一圈）。整个过程基本不用人管，这是它比 frp 省心最多的地方。

此外还有 MagicDNS（用设备名访问，不用记 IP）、subnet router（把整个内网网段共享给 tailnet）、exit node（借某台设备出口上网）、Tailscale SSH、基于身份的 ACL，以及任意 IdP 的 SSO 登录。免费 Personal 计划支持 6 个用户，设备数量基本不限，但明确限定非商业用途。

如果确实要把服务暴露到公网，而不只是设备互访，得开 Funnel：

```bash
tailscale funnel 443 on
tailscale funnel 8080
```

限制很硬：只能监听 443、8443、10000 三个端口，域名只能是 tailnet 自带的 `xxx.ts.net`，有不可配置的带宽限制，还必须走 TLS。临时演示、收个 webhook 够用，当正式的对外入口不合适。

还有个现实问题，每台要接入的设备都得装客户端并登录账号。给朋友的手机临时开个权限很别扭，给只会跑 IP 的 IoT 设备接入也麻烦。它的本质是把你自己的设备连起来，不是面向公网访客发布服务。

## cpolar：国产商业方案，快和省心

cpolar 是国内的商业内网穿透服务，中文界面、中文文档，有网页后台也有命令行客户端。用起来直接：

```bash
cpolar http 8080    # 把本地 8080 暴露成临时公网地址
cpolar tcp 22       # 映射 TCP 端口
```

它和 Cloudflare Tunnel 同属 SaaS 转发，不用准备服务器，也不用域名，免费版给随机子域名。免费版的限制是 1Mbps 带宽、单个进程最多 4 条隧道、随机 URL 子域名。

付费档位（官网标价，均为年付）：

| 档位 | 价格 | 带宽 | 隧道数 | 域名能力 |
|---|---|---|---|---|
| 免费 | ¥0 | 1Mbps | 4 条 | 随机子域名 |
| Base | ¥99/年 | 2Mbps | 8 条 | 保留 3 个子域名 |
| Pro | ¥149/年 | 3Mbps | 12 条 | 自定义域名、保留 5 个域名、2 个保留 TCP 地址、端到端 HTTPS |
| Business | ¥204/年 | 3Mbps | 20 条 | 含 Pro，另加 IP 白名单、泛域名、6 个保留 TCP 地址 |
| NAS 高带宽档 | ¥600/年起 | 10–30Mbps | 20 条 | 含 Pro 权益 |

优势是国内节点访问快、中文支持好、图形化上手快，也不用自有域名和服务器，对完全不想碰命令行的人很友好。但免费版 1Mbps 只够调试和看看后台，稍微正经一点的用法就得付费，自定义域名也要到 Pro 档才有。

## 横向对比

| 对比维度 | frp | Cloudflare Tunnel | Tailscale | cpolar |
|---|---|---|---|---|
| 原理类型 | 自建反向代理 | SaaS 反向代理 | Mesh 组网 | SaaS 反向代理 |
| 需要公网服务器 | 需要（自备 VPS） | 不需要 | 不需要 | 不需要 |
| 需要有域名 | 可选（TCP 可只用端口） | 必须，且托管在 CF | 不需要 | 免费版不需要 |
| 是否开入站端口 | 需要（在 VPS 上） | 不需要 | 不需要 | 不需要 |
| 免费额度 | 软件免费，服务器自付 | 免费，无带宽/流量限制 | 免费 6 用户，设备不限，限非商业 | 免费 1Mbps、4 隧道、随机域名 |
| 付费价格 | 仅服务器成本 | 基本无需付费 | 团队规模化时按用户计费 | ¥99–204/年 |
| 带宽表现 | 取决于 VPS 带宽 | 无硬性限制，国内延迟偏高 | 直连很快，中继时较慢 | 免费 1–3Mbps，付费档仍有限 |
| 协议支持 | TCP/UDP/HTTP/HTTPS 全覆盖 | HTTP/HTTPS/TCP/SSH 等 | 任意（IP 层互通） | HTTP/TCP/TLS |
| 客户端要求 | 内网装 frpc | 内网装 cloudflared | 每台设备都要装并登录 | 内网装客户端 |
| 对外访问 | 域名或 IP:端口 | 域名，自动 HTTPS | 默认仅 tailnet 内可见 | 随机或自定义域名 |
| 安全模型 | 自建，责任自负 | 源站 IP 不暴露 + CF 防护 | 身份认证 + ACL | 服务商托管 |
| 国内访问体验 | 取决于 VPS 线路 | 一般，需实测 | 直连好，中继差 | 较好，国内节点 |
| 运维成本 | 高（服务器 + 安全） | 低 | 低 | 最低 |

## 按场景怎么选

- 有 VPS，要暴露多个端口，还得有 TCP 服务（游戏服务器、数据库、一堆自建服务），上 frp。协议覆盖最全，xtcp 打洞还能省掉服务器带宽。
- 有域名托管在 Cloudflare，主要是 Web 服务对外，又不想维护服务器，用 Cloudflare Tunnel。免费、无带宽限制、源站 IP 不暴露，是现在对外发布性价比最高的做法。
- 核心诉求是自己的多台设备互相访问（笔记本连家里 NAS、远程桌面、跨地域组内网），用 Tailscale。零配置打洞，体验最接近「本来就在同一个局域网」。别把它当穿透服务使。
- 没有服务器、没有域名、不想碰命令行，用户又主要在国内，选 cpolar。花点小钱换省心，中文后台点几下就通了。
- 也可以组合。不少人最终是 Tailscale 管设备互联，Cloudflare Tunnel 管对外服务：自己日常访问走 Tailscale 直连，快又安全；需要给公网访客看的服务交给 Cloudflare Tunnel，免费还不用管服务器。这样既不用承担 frp 的服务器运维，也不用为了对外访问付费。

## 几个安全提醒

内网穿透的本质是在内网和公网之间主动开一条通道，所以不管选哪个工具，下面几点都值得留意：

- 别把不设密码的后台暴露出去。NAS 管理页、Docker 面板、数据库管理工具被扫到就是灾难，暴露前先加认证。
- frp 的 token 一定要用高强度随机串，别用示例值；面板端口不要对全网开放，最好只在需要时通过 SSH 隧道访问。
- Cloudflare Tunnel 暴露非 HTTP 服务（比如 SSH）时，建议配合 Zero Trust 的 Access 策略做身份校验，而不是裸奔一条隧道。
- Tailscale 的 Funnel 是把服务真正放到公网，一旦开启就是公开可访问，务必确认服务本身有认证。
- 有条件的话优先走 CDN 或 VPN，而不是直接暴露端口，能少掉绝大部分扫描流量。

## 写在最后

这四个工具没有谁绝对更好，只有合不合适。frp 控制权最大、协议最全，代价是服务器和安全得自己扛；Cloudflare Tunnel 用「域名必须托管在 CF」换来免费无限带宽和零运维；Tailscale 解决的是设备互联而非服务发布，体验最好但基本只有自己能用；cpolar 拿国内节点和中文体验换一点订阅费。

先想清楚要的是「让公网访问某个服务」，还是「让我的设备互相访问」，答案基本就有了。而很多人最后的做法是两者都用，而不是二选一。
