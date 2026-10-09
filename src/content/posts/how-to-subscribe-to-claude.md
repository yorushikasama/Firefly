---
title: 如何订阅 Claude：住宅 IP、美区 Apple ID 与礼品卡充值完整流程
published: 2026-10-09
description: 没有海外信用卡也能订阅 Claude：从准备住宅 IP、配置代理与防泄漏，到注册美区 Apple ID、用支付宝买礼品卡充值，最后在 App 内完成订阅。附分流规则和「购买未完成」的排查方法。
tags: [Claude, AI, 订阅教程, 美区AppleID, 住宅IP]
category: 技术
image: ./images/how-to-subscribe-to-claude.avif
slug: how-to-subscribe-to-claude
author: 楪祈
licenseName: CC BY-NC 4.0
licenseUrl: https://creativecommons.org/licenses/by-nc/4.0/
---

Claude 在大陆不提供服务，付款又必须用海外支付方式，整个过程比想象中绕。下面是完整流程，按顺序做完即可，不需要海外信用卡。

> **看之前先确认**：本文默认你已经会用代理——会导入节点、切换节点、打开和关闭代理。

整体流程：

**准备住宅 IP → 配置代理软件 → 防泄漏 → 改时区 → 注册 Gmail → 注册 Claude 并先用几天 → 注册美区 Apple ID → 买礼品卡充值 → 在 App 里订阅**

每一步都做完再做下一步，全程开着住宅节点。

## 一、准备住宅 IP

三选一，选好后只看对应的那一条，做完跳到「确认出口 IP」。

| 方案 | 折腾程度 | 适合谁 |
| --- | --- | --- |
| 一：自建节点 + 套住宅 IP | 高 | 喜欢折腾 |
| 二：住宅 IP 服务器 + 自建节点 | 中 | 愿意自建，不想配链式代理 |
| 三：直接买住宅节点 | 低 | 不想碰服务器 |

**买之前**：先找商家要 IP，用 [ipinfo.io](https://ipinfo.io/what-is-my-ip) 和 [scamalytics.com](https://scamalytics.com/) 测一下，类型要是「住宅/ISP」，风险分数要低。不要用 ping0.cc 测。

**不要用机场节点。**

### 方案一：自建节点 + 套住宅 IP

1. 先按常规方案搭好自己的节点（VPS + 3x-ui + VLESS Reality），这里不展开。
2. 在 [proxy.qsu.hk](https://proxy.qsu.hk/) 买住宅代理（不是主站 qsu.hk，主站卖的是方案二的服务器），记下协议、IP、端口、账号密码。**免费套餐**：注册账号后选择 SOCKS5 协议的套餐，下单时填优惠码 `qiansu998` 即可免费获得。流量额度以下单页面为准。
3. 新增出站：3x-ui → Xray 设置 → 出站 → 添加出站，按下表填写：

| 设置项 | 填写内容 |
| --- | --- |
| 协议 | SOCKS5 |
| 标签（Tag） | `residential` |
| 地址 | 住宅 IP 地址 |
| 端口 | 商家给的端口 |
| 用户名、密码 | 商家给的账号密码 |

4. 新增路由规则：Xray 设置 → 路由规则 → 添加规则，出站标签选 `residential`，domain 填：

```text
geosite:anthropic
domain:ipinfo.io
```

5. 先点保存，再点「重启 Xray」，不重启不生效。

### 方案二：住宅 IP 服务器 + 自建节点

1. 买一台住宅 IP 服务器：[VoyraCloud](https://www.voyracloud.com/?ref_code=HYEWZ46M) 或 [QSU](https://qsu.hk/aff/GAZUQBSL)（这两家的住宅服务器我都没用过）。
2. 用和方案一相同的方式在上面搭节点（VPS + 3x-ui + VLESS Reality），不用再套住宅代理。

### 方案三：直接买住宅节点

1. 在 ipequal 买套餐，**使用类型选「1 人独享」**。国内能打开的地址：[ipequal](https://www.ipequal.com/?ref=6adabd0307)；开代理才能打开的地址：[ipequal](https://www.equaldcdn.com/?ref=6adabd0307)。（我没用过，是很多人推荐的。建议先买一个月。）
2. 复制订阅链接，**通过剪贴板**导入代理软件。
3. 用 Claude 时选中这个住宅节点。

已经有别的节点、想只让 Claude 走住宅节点的，看文末「分流规则」。

### 确认出口 IP

开着代理打开 [ipinfo.io](https://ipinfo.io/what-is-my-ip)：

- 类型显示「住宅/ISP」，就成功了。
- 记下 IP 所在的地区。

## 二、配置代理软件

1. **电脑开 TUN 模式**。以 v2rayN 为例：右键 → 以管理员身份运行 → 主界面底部打开「启用 Tun」。
2. **确认 Claude 走代理**。不确定的话，用 Claude 时直接开全局。
3. **手机**：Shadowrocket 这类软件打开就行，确认 Claude 走的是住宅节点。
4. **用 Claude 时固定用这一个节点，不要换来换去。**

## 三、防泄漏

### 1. DNS

1. 开 TUN 模式（上一步已做）。
2. v2rayN → DNS 设置：国外域名用远程 DNS（`1.1.1.1` 或 `8.8.8.8`），并且通过代理查询。
3. v2rayN → 路由设置：「域名解析策略」选 `AsIs`。
4. 关掉浏览器的「安全 DNS」：
   - Chrome：设置 → 隐私和安全 → 安全 → 关闭「使用安全 DNS」。
   - Edge：设置 → 隐私、搜索和服务 → 关闭「使用安全 DNS」。

**检测**：打开 [browserleaks.com/dns](https://browserleaks.com/dns)，结果里不能有国内的 DNS（比如 China Telecom、China Unicom）。

### 2. WebRTC

- Chrome / Edge：装插件 WebRTC Leak Prevent；或者在 uBlock Origin 设置里勾选「防止 WebRTC 泄露本地 IP 地址」。
- Firefox：地址栏输入 `about:config`，把 `media.peerconnection.enabled` 改为 `false`。

**检测**：打开 [browserleaks.com/webrtc](https://browserleaks.com/webrtc)，「Public IP」只能是你的住宅 IP。

### 3. IPv6

检测网站上如果出现国内的 IPv6 地址，在电脑网卡设置里关掉 IPv6。

## 四、改时区

时区选 Claude 支持的地区，比如台湾、新加坡；不确定就选住宅 IP 所在城市的时区。**中国大陆和香港不行。**

**电脑（Windows）**：设置 → 时间和语言 → 日期和时间 → 关闭「自动设置时区」→ 手动选时区。

**iPhone**：

1. 设置 → 隐私与安全性 → 定位服务 → 系统服务（滑到最底下）→ 关闭「设定时区」。
2. 设置 → 通用 → 日期与时间 → 关闭「自动设置」→ 手动选城市。

两步都要做。

## 五、注册 Gmail

已经有 Gmail 的跳过。美区 Apple ID 现在不能用 QQ 邮箱注册，必须用 Gmail。

1. 手机配好代理，和电脑一样走住宅节点。
2. 下载 Gmail：
   - iOS：App Store 搜 Gmail。
   - 安卓：先下载 Google Play，再从里面下载 Gmail。Google Play 只从手机自带的应用商店或其他可信来源下载。
3. 打开 Gmail →「设置电子邮件」→「Google」→「创建账号」，跟着提示做。手机号可以用 +86。

**可选**：打开 [policies.google.com/terms](https://policies.google.com/terms)，看「国家/地区版本」。如果是中国大陆或香港，在同一页面申请改成住宅 IP 所在地区。审核期间保持住宅 IP 网络。

## 六、注册 Claude

1. 前面五步都做完、检测都通过，再注册。
2. 用 Google 账号注册。
3. 一个 IP 只注册一个账号。
4. **注册后先正常用几天**，最好用完免费额度、等它弹出升级提示，再订阅。

## 七、订阅（iPhone）

安卓用户：我没有验证过的方案。听说可以用美区 Google Play 礼品卡，但我没试过。

### 1. 注册美区 Apple ID

已经有美区 Apple ID 的跳过。

1. 浏览器（手机、电脑都行）打开 [appleid.apple.com](https://appleid.apple.com) → 点右上角箭头 →「创建你的 Apple 账户」。
2. 国家/地区选「美国」；姓名可以填拼音；生日要满 18 岁；邮箱用 Gmail；手机号可以用 +86。
3. 完成邮箱和手机验证。
4. 重新登录一次，确认地区是美国。付款方式不用填。

### 2. 在 App Store 登录

1. 打开 **App Store（不是「设置」）** → 右上角头像 → 拉到最底部，退出原账号。
2. 登录美区 Apple ID。
3. 配置账单寄送地址，**付款方式不要动**，保持「无」：
   - 右上角头像 → 你的名字 →「账单寄送地址」（此时「付款方式」应该显示「无」）。
   - 会跳到「添加付款方式」页面，不用填（第一次进入可能要求填付款方式才能保存，也不用管），直接返回。
   - 回到「管理付款方式」，点下面的「账单寄送地址」→ 右上角「编辑」，填地址并保存。地址填免税州的（比如俄勒冈州），要真实存在、格式正确，网上能搜到。
4. 搜 Claude，认准开发者是 Anthropic，下载。
5. 设置 → 屏幕使用时间 → 内容与隐私访问限制 → iTunes 与 App Store 购买项目 → App 内购买项目 → 选「**允许**」。

### 3. 买礼品卡充值

1. 手机浏览器搜索 pockyt shop，打开 [shop.pockyt.io](https://shop.pockyt.io)，点左上角「游客」。
2. 登录页「其他登录方式」选支付宝。
3. 在支付宝里：「美国」→「App Store & iTunes」→ 输入面额 → 购买。**先买 2 美元**，到账了再买 5 美元，一点点加。显示「缺货」的话，等页面上写的恢复时间再买。
4. 订单页面复制礼品卡号码 → App Store → 右上角头像 →「兑换代码」→ 填入号码。
5. 余额要比 Claude App 里显示的订阅价格多一点。

不要买来路不明的便宜卡，可能是黑卡，兑换后 Apple ID 可能被锁。

### 4. 在 App 内订阅

1. 打开 Claude App，用 Google 账号登录你的 Claude 账号。
2. 点升级 → 选方案 → 用 Apple ID 余额付款。
3. 订阅可以在 App Store → 右上角头像 →「订阅」里管理或取消。

提示「购买未完成」的，**不要反复重试**，看文末「购买未完成」。

## 八、订阅之后

- 刚开始少用，慢慢增加使用量。
- 一直用同一个节点、同一个住宅 IP。
- 不要在很多设备上登录，没走代理的设备上绝对不要登录。

## 附：分流规则

只让 Claude 走住宅节点、其他网站走原来的节点时用。规则放在最前面，`住宅节点` 换成你的节点或策略组名字。

**Clash Verge**（住宅节点和原来的节点要在同一份配置里）：

```text
- DOMAIN-SUFFIX,claude.ai,住宅节点
- DOMAIN-SUFFIX,claude.com,住宅节点
- DOMAIN-SUFFIX,anthropic.com,住宅节点
- DOMAIN-SUFFIX,ipinfo.io,住宅节点
```

**Shadowrocket**：配置 → 规则 → 新增 `DOMAIN-SUFFIX` 规则，域名同上，策略选住宅节点。

**v2rayN**：不方便分流，用 Claude 时直接切到住宅节点。

看不懂就不分流，用 Claude 时全局走住宅节点。

## 附：购买未完成

1. 把报错截图和 App Store 账户设置的截图发给 AI（Claude 免费版、ChatGPT 都可以），说明情况，让它帮你检查设置。
2. 还是不行，按 AI 说的，打开苹果自带的「支持」App（Apple Support）联系在线客服。
3. 「支持」App 里登录的是 iCloud 主账号（国区），订阅用的是美区账号，所以大概率会转到说英文的海外客服。**继续靠 AI**：客服发一句，复制给 AI；AI 的回答，再复制给客服。记得让 AI 跟客服说清楚，要处理的是 App Store 上的美区账号。
4. 客服让你等 72 小时的话，记下 Case ID，**这 72 小时里什么都别做**：不购买、不换账号、不改付款信息和账单地址。
5. 72 小时后再买。还失败的话，带着 Case ID 再联系客服，同样让 AI 帮你沟通。
