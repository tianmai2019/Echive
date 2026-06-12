import { PlaceholderPage } from "@/components/placeholder-page";

export default function TasksPage() {
  return (
    <PlaceholderPage
      title="Tasks"
      description="把澄清后的想法拆解成可执行任务，并提供 Today、This Week 和状态管理。"
      milestone="Milestone 3"
      tasks={[
        "实现 AI 任务建议生成与保存。",
        "支持任务状态、优先级和截止日期。",
        "提供今日任务和本周任务视图。",
      ]}
    />
  );
}
