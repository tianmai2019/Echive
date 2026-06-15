import { TaskPriority, type TaskPriority as TaskPriorityValue } from "@/generated/prisma/enums";

export interface TaskSuggestion {
  title: string;
  description: string;
  priority: TaskPriorityValue;
}

export interface TaskGenerationResult {
  tasks: TaskSuggestion[];
}

export interface TaskGeneratorInput {
  ideaTitle: string;
  ideaSummary?: string | null;
  ideaRawInput?: string | null;
}

export interface TaskGenerator {
  generateTasks(input: TaskGeneratorInput): Promise<TaskGenerationResult>;
}

function normalizeText(value?: string | null): string {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function buildContext(input: TaskGeneratorInput): string {
  const title = normalizeText(input.ideaTitle) || "未命名想法";
  const summary = normalizeText(input.ideaSummary);
  const rawInput = normalizeText(input.ideaRawInput);

  return summary || rawInput || title;
}

export class LocalTaskGenerator implements TaskGenerator {
  async generateTasks(input: TaskGeneratorInput): Promise<TaskGenerationResult> {
    const ideaTitle = normalizeText(input.ideaTitle) || "未命名想法";
    const context = buildContext(input);

    return {
      tasks: [
        {
          title: `${ideaTitle}：明确目标与验收标准`,
          description: `围绕“${ideaTitle}”明确目标，并结合“${context}”写下本阶段要达成的具体目标、完成定义和不可做范围。`,
          priority: TaskPriority.HIGH,
        },
        {
          title: `${ideaTitle}：收集必要素材`,
          description: "整理已有资料、参考链接、约束条件和关键上下文，为后续执行降低阻力。",
          priority: TaskPriority.MEDIUM,
        },
        {
          title: `${ideaTitle}：拆解最小可行版本`,
          description: "把想法拆成一个可以在短周期内验证的最小交付物，并列出关键步骤。",
          priority: TaskPriority.HIGH,
        },
        {
          title: `${ideaTitle}：完成第一轮验证`,
          description: "执行最小版本，记录验证结果、阻塞问题和下一步调整方向。",
          priority: TaskPriority.HIGH,
        },
        {
          title: `${ideaTitle}：复盘并沉淀记录`,
          description: "复盘执行过程，把结论、素材和后续机会沉淀回 Echive。",
          priority: TaskPriority.LOW,
        },
      ],
    };
  }
}

export function getTaskGenerator(): TaskGenerator {
  return new LocalTaskGenerator();
}
