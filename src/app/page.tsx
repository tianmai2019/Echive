import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

const overviewCards = [
  { label: "今日任务", value: "0", hint: "Day 1 暂未接入数据" },
  { label: "最近想法", value: "0", hint: "Inbox API 将在 Day 4 开始" },
  { label: "待澄清", value: "0", hint: "AI Clarifier 属于 Milestone 2" },
  { label: "草稿", value: "0", hint: "Studio 属于 Milestone 5" },
];

const milestones = [
  "Foundation：项目基础、Prisma、UI Shell",
  "Idea Flow：想法输入与 AI 澄清",
  "Planning：项目管理与任务拆解",
  "Vault：素材沉淀与复用",
  "Studio：草稿生成与编辑",
];

export default function Home() {
  return (
    <AppShell>
      <section className="flex flex-1 flex-col gap-8 p-5 md:p-8">
        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
          <Card className="overflow-hidden border-none bg-slate-950 text-white shadow-xl shadow-slate-950/15">
            <CardHeader className="relative z-10 gap-4 p-8">
              <Badge className="w-fit bg-amber-200 text-slate-950 hover:bg-amber-200">
                MVP Foundation
              </Badge>
              <div className="max-w-2xl space-y-4">
                <CardTitle className="text-4xl leading-tight tracking-tight md:text-6xl">
                  把灵感变成行动，把素材变成输出。
                </CardTitle>
                <CardDescription className="text-base leading-7 text-slate-300 md:text-lg">
                  Echive 是面向个人创作者与独立开发者的 AI 数字管家。Day 1
                  的目标是建立稳定的应用、数据模型和 UI 基础。
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="grid gap-3 px-8 pb-8 sm:grid-cols-2">
              {overviewCards.map((card) => (
                <div
                  key={card.label}
                  className="rounded-3xl border border-white/10 bg-white/8 p-5"
                >
                  <p className="text-sm text-slate-300">{card.label}</p>
                  <p className="mt-3 text-4xl font-semibold">{card.value}</p>
                  <p className="mt-2 text-xs text-slate-400">{card.hint}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-none bg-white/82 shadow-xl shadow-slate-950/10">
            <CardHeader>
              <CardTitle>Quick Capture</CardTitle>
              <CardDescription>
                先放置首页输入入口，后续接入 Idea 创建 API。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="记录一个新想法，例如：做一个个人数字管家，帮我管理创作工作流。"
                className="min-h-36 resize-none bg-white"
                disabled
              />
              <Button disabled className="w-full">
                Day 2 后接入保存
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="border-none bg-white/82 shadow-xl shadow-slate-950/10">
          <CardHeader>
            <CardTitle>执行路线</CardTitle>
            <CardDescription>
              按天推进，先保证 Foundation 可验证，再进入业务闭环。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-5">
              {milestones.map((milestone, index) => (
                <div key={milestone} className="rounded-3xl bg-slate-100 p-4">
                  <span className="text-xs font-semibold text-primary">
                    0{index + 1}
                  </span>
                  <p className="mt-3 text-sm leading-6 text-slate-700">
                    {milestone}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}
