import type { DraftFormat } from "@/generated/prisma/enums";
import { db } from "@/lib/db";

export interface DraftGenerationResult {
  title: string;
  outline: string;
  content: string;
}

export interface DraftGeneratorInput {
  ideaId: string;
  format: DraftFormat;
}

export interface DraftGenerator {
  generate(input: DraftGeneratorInput): Promise<DraftGenerationResult>;
}

function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function truncate(value: string, maxLength: number): string {
  const normalized = normalizeText(value);

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength)}...`;
}

function buildBlogTitle(ideaTitle: string): string {
  return `关于「${ideaTitle}」的深度解析`;
}

function buildWeiboTitle(ideaTitle: string): string {
  return `分享：${ideaTitle}`;
}

function buildVlogTitle(ideaTitle: string): string {
  return `【Vlog】${ideaTitle} 探索之旅`;
}

function buildScriptTitle(ideaTitle: string): string {
  return `《${ideaTitle}》脚本`;
}

function buildBlogOutline(ideaTitle: string, summary: string | null): string {
  return `一、开篇：${ideaTitle}
二、背景介绍：${summary ? truncate(summary, 50) : "问题起源与背景"}
三、核心观点分析
四、实践案例与应用
五、总结与展望`;
}

function buildWeiboOutline(ideaTitle: string): string {
  return `1. 吸引眼球的开头
2. 核心观点 - ${truncate(ideaTitle, 30)}
3. 个人体验与案例
4. 互动结尾（提问/投票）`;
}

function buildVlogOutline(ideaTitle: string): string {
  return `[开场] 0:00-0:30 - 主题引入与今日亮点
[主体] 0:30-3:00 - ${ideaTitle} 核心内容
[案例] 3:00-5:00 - 实际演示/案例展示
[总结] 5:00-5:30 - 要点回顾与下期预告`;
}

function buildScriptOutline(ideaTitle: string): string {
  return `场景一：引入 - 提出「${ideaTitle}」主题
场景二：展开 - 分析核心要点
场景三：案例 - 展示实际应用
场景四：总结 - 提炼关键结论`;
}

function buildBlogContent(ideaTitle: string, summary: string | null): string {
  return `# ${buildBlogTitle(ideaTitle)}

## 引言

${summary ? summary : "这是一个值得深入探讨的话题。"}在这篇文章中，我们将系统地分析相关要点，为读者提供有价值的见解。

## 背景介绍

任何想法的产生都有其特定的背景。本文所讨论的主题也是如此。我们需要先理解问题的起源、发展历程和当前状态，才能更好地把握其本质。

## 核心观点分析

### 观点一：问题的本质

首先，我们需要明确问题的核心是什么。这需要我们从多个角度进行审视，剥离表面现象，抓住最根本的矛盾。

### 观点二：可能的解决方案

基于对问题本质的理解，我们可以探索几种可能的解决方案。每种方案都有其适用场景和局限性，需要根据具体情况进行选择。

### 观点三：实施路径

确定解决方案后，如何有效实施是另一个关键问题。这需要考虑资源、时间、团队等多个因素。

## 实践案例与应用

理论需要结合实践才能真正发挥价值。在这里，我们可以通过一些实际案例来验证上述观点，并从中总结出可复用的经验。

## 总结与展望

通过本文的分析，我们对这一主题有了更系统的理解。未来，随着技术和环境的变化，这个话题还会继续发展，值得我们持续关注。

---
*本文由 Echive AI 辅助生成*`;
}

function buildWeiboContent(ideaTitle: string, summary: string | null): string {
  return `💡 ${ideaTitle}

${summary ? truncate(summary, 140) : "刚刚有了一个很棒的想法，记录下来和大家分享～"}

#个人成长 #知识分享 #思考`;
}

function buildVlogContent(ideaTitle: string): string {
  return `# ${buildVlogTitle(ideaTitle)}

## 开场（0:00-0:30）

**镜头**：对着镜头微笑
**台词**："大家好，欢迎来到我的频道！今天我们来聊聊一个很有意思的话题——${ideaTitle}。"

## 主体（0:30-3:00）

**镜头**：切换到讲解模式
**台词**："最近我一直在思考这个问题，有了一些心得想和大家分享..."

（此处插入 B-roll 画面）

## 案例展示（3:00-5:00）

**镜头**：展示实际操作/案例
**台词**："让我们通过一个具体的例子来看看..."

## 总结（5:00-5:30）

**镜头**：回到面对镜头
**台词**："以上就是今天的全部内容。如果觉得有帮助，欢迎点赞、订阅、转发！我们下期再见～"

---
*Vlog 脚本由 Echive AI 生成*`;
}

function buildScriptContent(ideaTitle: string): string {
  return `# ${buildScriptTitle(ideaTitle)}

## 场景一：引入

**地点**：办公室/咖啡馆
**人物**：A、B

**A**：（若有所思）最近我一直在想一个问题...
**B**：什么问题？说来听听。
**A**：关于「${ideaTitle}」

## 场景二：展开

**A**：我觉得这个问题的核心在于...
**B**：确实，不过我觉得还有另一个角度...

## 场景三：案例

**A**：举个例子，上次...
**B**：哦对，那个案例很典型！

## 场景四：总结

**A**：所以总的来说...
**B**：说得好！我回去也要好好想想。

---
*脚本由 Echive AI 生成*`;
}

export class LocalDraftGenerator implements DraftGenerator {
  async generate(input: DraftGeneratorInput): Promise<DraftGenerationResult> {
    const idea = await db.idea.findUnique({
      where: { id: input.ideaId },
      select: { title: true, summary: true },
    });

    if (!idea) {
      throw new Error("Idea not found");
    }

    let title: string;
    let outline: string;
    let content: string;

    switch (input.format) {
      case "BLOG":
        title = buildBlogTitle(idea.title);
        outline = buildBlogOutline(idea.title, idea.summary);
        content = buildBlogContent(idea.title, idea.summary);
        break;
      case "WEIBO":
        title = buildWeiboTitle(idea.title);
        outline = buildWeiboOutline(idea.title);
        content = buildWeiboContent(idea.title, idea.summary);
        break;
      case "VLOG":
        title = buildVlogTitle(idea.title);
        outline = buildVlogOutline(idea.title);
        content = buildVlogContent(idea.title);
        break;
      case "SCRIPT":
        title = buildScriptTitle(idea.title);
        outline = buildScriptOutline(idea.title);
        content = buildScriptContent(idea.title);
        break;
      default:
        title = idea.title;
        outline = "";
        content = idea.summary || "";
    }

    return { title, outline, content };
  }
}

export function getDraftGenerator(): DraftGenerator {
  return new LocalDraftGenerator();
}
