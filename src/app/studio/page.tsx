import { PlaceholderPage } from "@/components/placeholder-page";

export default function StudioPage() {
  return (
    <PlaceholderPage
      title="Studio"
      description="内容工作台，用于基于 Idea 和 Materials 生成博客、微博、Vlog 或脚本草稿。"
      milestone="Milestone 5"
      tasks={[
        "实现 Draft 生成面板和素材选择。",
        "支持 Blog、Weibo、Vlog、Script 输出格式。",
        "提供 Draft 编辑、保存和状态更新。",
      ]}
    />
  );
}
