import { PlaceholderPage } from "@/components/placeholder-page";

export default function VaultPage() {
  return (
    <PlaceholderPage
      title="Vault"
      description="沉淀可复用素材，支持文字、链接、摘录、截图说明、语音转写和聊天记录。"
      milestone="Milestone 4"
      tasks={[
        "实现 Material 创建、列表和状态切换。",
        "支持素材关联 Idea 与 Project。",
        "提供轻量标签和搜索能力。",
      ]}
    />
  );
}
