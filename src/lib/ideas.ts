import {
  AIActionType,
  ConversationType,
  IdeaStatus,
  IdeaType,
  MessageRole,
  type IdeaStatus as IdeaStatusValue,
} from "@/generated/prisma/enums";
import { getIdeaClarifier, type IdeaClarificationResult } from "@/lib/ai/idea-clarifier";
import { getDemoUser } from "@/lib/demo-user";
import { db } from "@/lib/db";

export const IDEA_STATUS_OPTIONS = Object.values(IdeaStatus);

export function isIdeaStatus(value: string): value is IdeaStatusValue {
  return IDEA_STATUS_OPTIONS.includes(value as IdeaStatusValue);
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function deriveIdeaTitle(rawInput: string): string {
  const normalized = normalizeWhitespace(rawInput);

  if (!normalized) {
    return "未命名想法";
  }

  return normalized.length > 42 ? `${normalized.slice(0, 42)}...` : normalized;
}

export async function createIdea(rawInput: string) {
  const user = await getDemoUser();
  const normalizedInput = rawInput.trim();

  return db.idea.create({
    data: {
      userId: user.id,
      title: deriveIdeaTitle(normalizedInput),
      rawInput: normalizedInput,
      type: IdeaType.IDEA,
      status: IdeaStatus.CAPTURED,
    },
  });
}

export async function listIdeas(status?: IdeaStatusValue) {
  const user = await getDemoUser();

  return db.idea.findMany({
    where: {
      userId: user.id,
      ...(status ? { status } : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      rawInput: true,
      summary: true,
      status: true,
      type: true,
      nextAction: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function getIdeaById(id: string) {
  const user = await getDemoUser();

  return db.idea.findFirst({
    where: {
      id,
      userId: user.id,
    },
    include: {
      project: {
        select: {
          id: true,
          title: true,
          status: true,
        },
      },
      tasks: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          status: true,
          priority: true,
          dueDate: true,
        },
      },
      materials: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          type: true,
          status: true,
        },
      },
      conversations: {
        where: { type: ConversationType.IDEA_CLARIFICATION },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          id: true,
          title: true,
          createdAt: true,
          messages: {
            orderBy: { createdAt: "asc" },
            select: {
              id: true,
              role: true,
              content: true,
              createdAt: true,
            },
          },
        },
      },
      aiActionLogs: {
        where: { actionType: AIActionType.CLARIFY_IDEA },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          id: true,
          output: true,
          createdAt: true,
        },
      },
    },
  });
}

interface UpdateIdeaInput {
  title?: string;
  summary?: string | null;
  status?: IdeaStatusValue;
  nextAction?: string | null;
}

export async function updateIdea(id: string, input: UpdateIdeaInput) {
  const user = await getDemoUser();
  const existingIdea = await db.idea.findFirst({
    where: {
      id,
      userId: user.id,
    },
    select: { id: true },
  });

  if (!existingIdea) {
    return null;
  }

  return db.idea.update({
    where: { id },
    data: input,
  });
}

export async function clarifyIdea(id: string) {
  const user = await getDemoUser();
  const idea = await db.idea.findFirst({
    where: {
      id,
      userId: user.id,
    },
  });

  if (!idea) {
    return null;
  }

  const clarifier = getIdeaClarifier();
  const result = await clarifier.clarify({
    rawInput: idea.rawInput,
    currentTitle: idea.title,
  });
  const output = JSON.stringify(result, null, 2);

  const updatedIdea = await db.$transaction(async (tx) => {
    const conversation = await tx.conversation.create({
      data: {
        userId: user.id,
        ideaId: idea.id,
        type: ConversationType.IDEA_CLARIFICATION,
        title: `Clarify: ${result.title}`,
      },
    });

    await tx.message.createMany({
      data: [
        {
          conversationId: conversation.id,
          role: MessageRole.USER,
          content: idea.rawInput,
        },
        {
          conversationId: conversation.id,
          role: MessageRole.ASSISTANT,
          content: output,
        },
      ],
    });

    await tx.aIActionLog.create({
      data: {
        userId: user.id,
        ideaId: idea.id,
        actionType: AIActionType.CLARIFY_IDEA,
        input: idea.rawInput,
        output,
      },
    });

    return tx.idea.update({
      where: { id: idea.id },
      data: {
        title: result.title,
        summary: result.summary,
        nextAction: result.nextAction,
        status: IdeaStatus.CLARIFIED,
      },
    });
  });

  return {
    idea: updatedIdea,
    clarification: result,
  };
}

export function parseClarificationOutput(
  output?: string | null
): IdeaClarificationResult | null {
  if (!output) {
    return null;
  }

  try {
    const parsed = JSON.parse(output) as Partial<IdeaClarificationResult>;

    if (
      typeof parsed.title !== "string" ||
      typeof parsed.summary !== "string" ||
      !Array.isArray(parsed.questions) ||
      typeof parsed.nextAction !== "string"
    ) {
      return null;
    }

    return {
      title: parsed.title,
      summary: parsed.summary,
      questions: parsed.questions.filter(
        (question): question is string => typeof question === "string"
      ),
      nextAction: parsed.nextAction,
    };
  } catch {
    return null;
  }
}
