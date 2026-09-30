---
title: Fail2ban + Cloudflare 打造网站自动防御系统
published: 2026-05-01
updated: 2026-05-01
description: 用 Fail2ban 联动 Cloudflare API 打造网站自动防御系统：扫描 Nginx 日志识别恶意 IP，自动通过 Cloudflare 防火墙与本地 iptables 双重封禁。本文覆盖安装、工作原理、jail.local 与过滤规则配置，以及封禁、解封、重载、日志排错等常用命令。
tags: [Fail2ban, Cloudflare, 网站安全, Nginx, 运维]
category: 运维与安全
image: ./images/fail2ban-cloudflare-auto-defense.avif
slug: fail2ban-cloudflare-auto-defense
author: skilladd
sourceLink: https://skilladd.org/2026/05/01/53.Fail2ban%20+%20Cloudflare%20%E6%89%93%E9%80%A0%E7%BD%91%E7%AB%99%E8%87%AA%E5%8A%A8%E9%98%B2%E5%BE%A1%E7%B3%BB%E7%BB%9F/
licenseName: CC BY-NC 4.0
licenseUrl: https://creativecommons.org/licenses/by-nc/4.0/
---

## 简介

Fail2Ban 会扫描日志文件，`/var/log/auth.log` 并封禁尝试登录失败次数过多的 IP 地址。它通过更新系统防火墙规则，在可配置的时间段内拒绝来自这些 IP 地址的新连接来实现这一点。Fail2Ban 开箱即用，可读取许多标准日志文件，例如 sshd 和 Apache 的日志文件，并且可以轻松配置为读取您选择的任何日志文件，以及您希望记录的任何错误。

项目地址：[链接直达](https://github.com/fail2ban/fail2ban)

## 安装

```bash
sudo apt install fail2ban
```

一键脚步安装工具：[GitHub - skilladd/skills_tools: 一个方便你在服务器上快速部署服务的脚本文件](https://github.com/skilladd/skills_tools)

执行脚步

```bash
bash skills_tools.sh
```

## 工作原理

`/etc/fail2ban/action.d/cloudflare.conf` 文件的功能，Fail2ban 执行封禁和解封时调用 Cloudflare 防火墙的具体命令

```bash
root@0af312e4-3463-477c-94cf-856d9eb909ef:~# cat /etc/fail2ban/action.d/cloudflare.conf
[Definition]
actionban = curl -s -o /dev/null -X POST "https://api.cloudflare.com/client/v4/zones/CF_ZONE_ID/firewall/access_rules/rules" \
            -H "Authorization: Bearer CF_API_TOKEN" \
            -H "Content-Type: application/json" \
            --data '{"mode":"block","configuration":{"target":"ip","value":"<ip>"},"notes":"Fail2ban"}'

actionunban = RULE_ID=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones/CF_ZONE_ID/firewall/access_rules/rules?configuration_target=ip&configuration_value=<ip>" \
              -H "Authorization: Bearer CF_API_TOKEN" \
              -H "Content-Type: application/json" | jq -r '.result[0].id') && \
              if [ "$RULE_ID" != "null" ]; then \
              curl -s -o /dev/null -X DELETE "https://api.cloudflare.com/client/v4/zones/CF_ZONE_ID/firewall/access_rules/rules/$RULE_ID" \
              -H "Authorization: Bearer CF_API_TOKEN" \
              -H "Content-Type: application/json"; fi
```

文件内容解析

- 通过 Cloudflare API 创建一条防火墙 IP 访问规则。
- `mode` 为 `block`，直接阻止该 IP 访问。
- `notes` 标记为 `Fail2ban`，便于在 Cloudflare 面板中识别。
- 请求结果丢弃到 `/dev/null`，不保存输出。
- 解封动作，先查询该 IP 对应的防火墙规则 ID（因为同一 IP 可能有重复规则，这里只取第一个）

`/etc/fail2ban/jail.local`，Fail2ban 的配置文件

```ini
[DEFAULT]
ignoreip = 127.0.0.1/8 ::1 173.245.48.0/20 103.21.244.0/22 103.22.200.0/22 103.31.4.0/22 141.101.64.0/18 108.162.192.0/18 190.93.240.0/20 188.114.96.0/20 197.234.240.0/22 198.41.128.0/17 162.158.0.0/15 104.16.0.0/13 104.24.0.0/14 172.64.0.0/13 131.0.72.0/22 2400:cb00::/32 2606:4700::/32 2803:f800::/32 2405:b500::/32 2405:8100::/32 2a06:98c0::/29 2c0f:f248::/32


[nginx-limit]
enabled = true
filter = nginx-limit
action = cloudflare
         iptables-multiport[name=nginx, port="http,https"]
logpath = /var/log/nginx/access.log
backend = polling
findtime = 600
maxretry = 10
bantime = 3600
```

`ignoreip` 列表包含 **Cloudflare 所有的回源 IP 段**（IPv4 和 IPv6），确保 Fail2ban 永远不会封禁这些 Cloudflare 的服务器地址。

- **filter**：引用 `nginx-limit.conf` 中定义的正则规则。
- **action**：同时使用两个动作：
  - `cloudflare`：即上面定义的 Cloudflare API 封禁/解封。
  - `iptables-multiport`：本地同时用 iptables 封禁端口 80,443。这提供了双重防护（即使 Cloudflare 封禁失败，本地 iptables 依然生效，但要注意 iptables 匹配的 IP 是实际连接来源 IP，如果前面没有正确还原真实 IP，可能会封禁 Cloudflare IP）。
- **logpath**：监控 `/var/log/nginx/access.log`。
- **findtime**：600 秒（10 分钟）内的统计窗口。
- **maxretry**：在此窗口内同一个 IP 匹配 10 次失败则封禁。
- **bantime**：封禁时长 3600 秒（1 小时）。
- **backend = polling**：因为要监控轮转的日志文件，这里使用轮询方式而非 inotify。

`/etc/fail2ban/filter.d/nginx-limit.conf`，匹配用户非法操作的文件

```ini
[Definition]
failregex = ^<HOST> -.*"(GET|POST|PUT|DELETE|HEAD).*HTTP.*" (400|403|404|444|429) .*$
ignoreregex =
```

- **failregex** 解析 Nginx 日志行（默认组合格式），匹配条件：
  - 请求方法为 `GET|POST|PUT|DELETE|HEAD` 等。
  - 响应状态码为 **4xx 客户端错误**，具体是 `400`（错误请求）、`403`（禁止）、`404`（未找到）、`444`（Nginx 特殊状态，直接关闭连接）、`429`（请求过多）。
- `<HOST>` 会被 Fail2ban 自动提取为 IP 地址。

## 常用的命令

### 服务管理 (systemctl)

```bash
sudo systemctl start fail2ban       # 启动服务
sudo systemctl stop fail2ban        # 停止服务
sudo systemctl restart fail2ban     # 重启服务（配置修改后使用）
sudo systemctl status fail2ban      # 查看服务运行状态
sudo systemctl enable fail2ban      # 开机自启
sudo systemctl disable fail2ban     # 取消自启
```

### 整体状态与 Jail 列表

```bash
# 查看所有 jail 的简要状态（包括已封禁 IP 数量）
sudo fail2ban-client status

# 查看某个具体 jail 的详细状态（如你配置的 nginx-limit）
sudo fail2ban-client status nginx-limit
```

> `fail2ban-client set nginx-limit banip` 命令中的 `nginx-limit` **是 jail 的名称**，在你的 `jail.local` 里定义了 `[nginx-limit]` 这个段落。

### 手动封禁与解封

```bash
# 手动封禁一个 IP（临时加入 jail）
sudo fail2ban-client set nginx-limit banip 192.168.1.100

# 手动解封一个 IP
sudo fail2ban-client set nginx-limit unbanip 192.168.1.100

# 批量解封（清空某个 jail 的所有封禁）
sudo fail2ban-client unban --all                     # 解封所有 jail 的全部 IP
sudo fail2ban-client set nginx-limit unban --all     # 仅清空指定 jail
```

### 配置管理与重载

```bash
# 重载配置文件（修改 jail.local / filter 后，不会中断现有封禁）
sudo fail2ban-client reload

# 仅重启某个 jail（先停止再启动该 jail）
sudo fail2ban-client restart nginx-limit

# 停止/启动某个 jail 而不影响其他
sudo fail2ban-client stop nginx-limit
sudo fail2ban-client start nginx-limit

# 检查配置文件语法是否正确（推荐在重启前执行）
sudo fail2ban-client -d            # 输出完整运行时配置（dry-run）
# 或者
sudo fail2ban-server -t            # 显式测试语法
```

### 日志监控与排错

```bash
# 实时查看 Fail2ban 主日志（包含封禁/解封/错误）
sudo tail -f /var/log/fail2ban.log

# 配合 grep 过滤特定 jail
sudo tail -f /var/log/fail2ban.log | grep nginx-limit

# 查看 Fail2ban 相关 syslog（部分系统）
sudo journalctl -u fail2ban -f
```
