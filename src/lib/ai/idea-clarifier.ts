export interface IdeaClarificationResult {
  title: string;
  summary: string;
  questions: string[];
  nextAction: string;
}

export interface IdeaClarifierInput {
  rawInput: string;
  currentTitle?: string | null;
}

export interface IdeaClarifier {
  clarify(input: IdeaClarifierInput): Promise<IdeaClarificationResult>;
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

function buildTitle(rawInput: string, currentTitle?: string | null): string {
  const source = normalizeText(currentTitle || rawInput);

  if (!source) {
    return "未命名想法";
  }

  return truncate(source, 32);
}

function buildSummary(rawInput: string): string {
  const normalized = normalizeText(rawInput);

  if (!normalized) {
    return "这是一个待澄清的新想法。";
  }

  return `围绕“${truncate(normalized, 54)}”的初步想法，需要进一步明确目标、受众和下一步行动。`;
}

export class LocalIdeaClarifier implements IdeaClarifier {
  async clarify(input: IdeaClarifierInput): Promise<IdeaClarificationResult> {
    const title = buildTitle(input.rawInput, input.currentTitle);
    const summary = buildSummary(input.rawInput);

    return {
      title,
      summary,
      questions: [
        "这个想法要解决的最具体问题是什么？",
        "第一批使用者是谁，他们现在如何处理这个问题？",
        "最小可验证成果应该长什么样？",
        "本周可以推进的第一个动作是什么？",
      ],
      nextAction: "把这个想法拆成一个可在 30 分钟内完成的小任务，并补充必要素材。",
    };
  }
}

export function getIdeaClarifier(): IdeaClarifier {
  return new LocalIdeaClarifier();
}
