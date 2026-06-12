import { PlaceholderPage } from "@/components/placeholder-page";

export default function ProjectsPage() {
  return (
    <PlaceholderPage
      title="Projects"
      description="长期主题与项目容器，用于聚合想法、任务、素材和草稿。"
      milestone="Milestone 3"
      tasks={[
        "实现 Project 创建、编辑和列表。",
        "支持 Idea 关联 Project。",
        "在项目详情中聚合 Ideas、Tasks、Materials 和 Drafts。",
      ]}
    />
  );
}
