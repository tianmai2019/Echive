import { PlaceholderPage } from "@/components/placeholder-page";

export default function InboxPage() {
  return (
    <PlaceholderPage
      title="Inbox"
      description="统一承接所有新想法与输入，后续将支持快速记录、Idea 列表和澄清入口。"
      milestone="Milestone 2"
      tasks={[
        "实现 Quick Capture 输入框与 POST /api/ideas。",
        "展示 Idea 列表、状态筛选和详情入口。",
        "接入 AI 标题、摘要、澄清问题和 nextAction。",
      ]}
    />
  );
}
