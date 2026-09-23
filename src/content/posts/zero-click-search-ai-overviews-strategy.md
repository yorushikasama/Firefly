---
title: 网站排名没掉，流量没了：零点击搜索与 AI Overviews 的生存策略
published: 2026-04-19
updated: 2026-04-19
description: 排名正常但流量下滑？58.5%的搜索以零点击结束，AI Overviews 让点击率下降58%。本文教你诊断零点击问题、被 AI 引用的 CITABLE 框架，以及从流量导向转向品牌曝光的新 SEO 策略。
tags: [SEO优化, 零点击搜索, 品牌曝光]
category: 增长与SEO
image: ./images/zero-click-search-ai-overviews-strategy.jpg
slug: zero-click-search-ai-overviews-strategy
series: "SEO&GEO 实战指南：从 Google SEO 到 AI 搜索"
author: MoeWah
sourceLink: https://blog.moewah.com/posts/zero-click-search-ai-overviews-strategy/
licenseName: CC BY-NC-SA 4.0
licenseUrl: https://creativecommons.org/licenses/by-nc-sa/4.0/
---

## 排名正常，流量却在下滑

最近在几个SEO群里，经常看到类似的困惑。

「我的关键词排名没变，但点击率一直在掉，是不是被降权了？」

有个做外贸独立站的朋友更直接：「半年前排名第一能拿300点击，现在同样的位置，只有100出头。」

不是算法更新，不是竞争对手抢位。

是用户根本不需要点进来了。

---

## 先确认：是不是零点击导致的

看到点击下滑，别急着下结论。先做个诊断。

### 第一步：GSC 筛查

打开 Google Search Console → Performance → Queries。

筛选条件：

- Position ≤ 10（前十名）
- CTR：低于 2%

结果列表里的关键词，就是典型的「零点击候选」——排名很好，但用户不点。

### 第二步：对比趋势

看同一关键词的 Impressions（展示次数）和 Clicks（点击次数）曲线。

如果  **展示上升或持平、点击持续下滑** ，大概率是 SERP 特征变化导致的——Featured Snippet、AI Overview、Knowledge Panel 都可能「截走」点击。

如果展示和点击同时下滑，那可能是排名掉了，不是零点击。

### 第三步：确认 SERP 特征

手动搜索几个典型关键词，看 SERP 上有什么。

或者用 Ahrefs Site Explorer → Organic Keywords → SERP Features filter，筛选 “AI Overview”。

如果这些关键词确实触发 AI Overview，诊断就确认了。

---

## 60%的搜索，零点击

SparkToro 创始人 Rand Fishkin 在 2024 年发布了一份基于 Semrush Datos 点击流数据的研究，结果很直接：

**美国 58.5% 的 Google 搜索、欧盟 59.7% 的搜索，以零点击结束。**

换句话说，每 10 次搜索里，只有不到 4 次会产生点击。而且这 4 次点击里，还有近 30% 流向 Google 自己的产品——YouTube、Google Maps、Google Images。

真正到达「开放网络」的点击，每 1000 次搜索里只有 360 次。

这不是 Google 的锅，也不是 SEO 已死的信号。

这是一种新的搜索行为模式。

---

## AI Overviews，加速器

Ahrefs 在 2025 年 12 月更新了一组数据，更具体：

**当 AI Overview 出现在搜索结果中时，排名第一的页面点击率下降了约 58%。**

AI Overview 查询的零点击率达到 83%，远高于传统查询的 60%。

为什么？

因为 AI 已经把答案「合成」好了。

不同于 Featured Snippet 直接摘录网页内容，AI Overviews 会从多个来源提取信息，重新组织语言，给用户一个「完整」的回答。

用户看到了答案。

然后关掉搜索框。

你的网页还在第一位。

但没有人会点进来了。

---

## 那个流量导向的时代，结束了

说实话，我理解那种焦虑。

看着 GSC 里的点击曲线一路向下，关键词排名稳如泰山，却只能眼睁睁看着流量蒸发。

很多 SEO 从业者还在用旧框架思考：排名上去 → 点击进来 → 转化落地。

但这个链条已经断了。

**流量导向的时代，正在被可见性导向取代。**

这不是一句空洞的口号。

这意味着你的 KPI 需要变：从「点击量」变成「品牌曝光次数」。从「访问量」变成「被引用频率」。

听起来很虚对吧？

但仔细想想，当用户在 AI Overview 里看到你的品牌名称、你的观点被引用，那个印象是有真实价值的。

即使没有点击。

---

## 具体怎么做：被 AI Overviews 引用

既然点击回不来了，那就换个思路：让 AI 引用你。

根据 xseek 的研究，使用 Article 和 FAQPage 结构化数据的页面，出现在 Featured Snippets 和 AI Overview 引用中的概率是普通页面的 2.3 倍。

这是最直接的技术优化入口。

### 格式要求

**Schema Markup（JSON-LD 格式）**

关键字段不能错：`datePublished`、`@type`、价格信息必须与页面可见内容一致。一个字段对不上，Google 的结构化数据处理管道就会触发「信任惩罚」。

**HTML 结构清晰**

机器要能「读懂」你的内容。标题层级、列表格式、定义标签，都要符合语义化标准。

**实体明确**

AI 需要知道你是谁。如果它无法确定你的品牌与竞争对手的区别，就算内容再好，也不会优先引用你。

### 内容层面

Discovered Labs 提出了一个 CITABLE 框架，核心是七件事：

| 框架要点 | 具体做法 | 示例 |
|---|---|---|
| C - Clear entity | 开头明确告诉 AI 你是谁 | 「Ahrefs 是一款 SEO 工具，提供反向链接分析和关键词研究功能」 |
| I - Inverted pyramid | 结论前置 40-60 字，让 AI 能直接提取 | 「结构化数据可提升 AI 引用概率 2.3 倍」放在段落第一句 |
| T - Trust signals | 作者资质、引用来源、数据出处 | 「根据 SparkToro 2024 年研究……」而非「研究表明……」 |
| A - Attribution pattern | 所有数据标注来源链接 | 每个统计数字后面跟 — [来源链接] |
| B - Blocks | 用 200-400 字结构化段落，而非长段落 | 一个段落只讲一个观点，方便 AI 切片提取 |
| L - Labeled data | 关键数据用显式标签 | 「58.5% 的搜索为零点击」而非「大多数搜索」 |
| E - Entity-first | 围绕实体写作，而非关键词堆砌 | 文章讲「Ahrefs 如何做关键词研究」，而非「关键词研究工具推荐」 |

简单说：写得像百科全书词条——清晰、准确、可验证、有来源。

---

## 新 SEO 策略：品牌曝光 > 单纯流量

我见过不少独立站站长，看到流量下滑就开始疯狂发外链、堆内容、换模板。

方向错了。

**零点击时代，SEO 的核心任务不是「把人拉进来」，而是「让品牌被看到」。**

### 具体调整

**监测指标换一套**

- 品牌搜索量是否增长
- 直接访问（Direct Traffic）是否上升
- AI Overview 引用频率
- SERP 特征出现次数

如果品牌搜索量和直接访问在增长，即使点击下降，你的 SEO 也是有效的。

**追踪 AI Overview 引用**

Ahrefs：

1. Site Explorer → Organic Keywords
2. SERP Features filter → 勾选 “AI Overview”
3. 查看哪些关键词触发 AI Overview，以及你的页面是否被引用

Semrush：

1. Position Tracking → 添加目标关键词
2. SERP Features 列会显示 AI Overview 标记
3. 或用 Domain Overview → Organic Rankings → 篮选 AI Overview 关键词

**手动检查**

搜索你的目标关键词，看 AI Overview 是否出现，以及引用来源里有没有你的域名。

如果被引用但没链接——这是「品牌曝光」信号，记下来。

如果没被引用——看引用的是谁，分析他们内容结构与你有什么不同。

**内容策略调整**

原创研究、数据驱动内容、交互式工具——这些 AI 无法完全替代的内容类型，价值在上升。

纯信息类内容，比如「什么是 XX」「XX 怎么用」，会越来越多被 AI 直接回答。

**品牌实体建设**

增加品牌提及（无论是否有链接）、保持一致的品牌信息、提升在垂直领域的权威性。

这些是 AI 引用的关键信号。

---

## 一点心态

这篇文章不想制造焦虑。

零点击搜索是趋势，不是波动。

期待流量回到 2020 年的水平，就像期待智能手机消失一样不现实。

但换个角度想：

**当用户在 AI Overview 里看到你的观点、记住你的品牌，你其实已经在转化漏斗里了。**

只是这个漏斗，不再从点击开始。

从曝光开始。

这是一个更长的游戏，但玩得好的人，护城河会更深。

---

## 数据来源

- SparkToro：[2024 Zero-Click Search Study](https://sparktoro.com/blog/2024-zero-click-search-study-for-every-1000-us-google-searches-only-374-clicks-go-to-the-open-web-in-the-eu-its-360/)（Rand Fishkin，基于 Semrush Datos 数据）
- Ahrefs：[Update: AI Overviews Reduce Clicks by 58%](https://ahrefs.com/blog/ai-overviews-reduce-clicks-update/)（2025 年 12 月）
- xseek：[Structured Data for AI Search: How Schema Markup Drives 40% More AI Citations](https://www.xseek.io/learnings/how-does-structured-data-boost-ai-search-visibility)
- Discovered Labs：[CITABLE: The AEO Content Framework](https://discoveredlabs.com/blog/citable-the-aeo-content-framework-we-use-to-get-b2b-brands-cited-by-ai)
