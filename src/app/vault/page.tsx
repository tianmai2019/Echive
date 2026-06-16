import { connection } from "next/server";
import { Archive } from "lucide-react";

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
import { listMaterials, isMaterialStatus, isMaterialType } from "@/lib/materials";
import {
  MATERIAL_STATUS_LABELS,
  MATERIAL_STATUS_OPTIONS,
  MATERIAL_TYPE_LABELS,
  MATERIAL_TYPE_OPTIONS,
} from "@/lib/material-metadata";
import { MaterialItem } from "./material-item";
import { MaterialCreateForm } from "./material-create-form";

interface VaultPageProps {
  searchParams: Promise<{
    status?: string | string[];
    type?: string | string[];
  }>;
}

function getParam(value?: string | string[]): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function buildVaultHref(params: { status?: string; type?: string }): string {
  const searchParams = new URLSearchParams();

  if (params.status) {
    searchParams.set("status", params.status);
  }

  if (params.type) {
    searchParams.set("type", params.type);
  }

  const query = searchParams.toString();
  return query ? `/vault?${query}` : "/vault";
}

export default async function VaultPage({ searchParams }: VaultPageProps) {
  await connection();

  const params = await searchParams;
  const statusParam = getParam(params.status);
  const typeParam = getParam(params.type);
  const selectedStatus = statusParam && isMaterialStatus(statusParam) ? statusParam : undefined;
  const selectedType = typeParam && isMaterialType(typeParam) ? typeParam : undefined;

  const materials = await listMaterials({
    status: selectedStatus,
    type: selectedType,
  });

  return (
    <AppShell>
      <section className="flex flex-1 flex-col gap-6 p-5 md:p-8">
        <div>
          <Badge className="w-fit">Milestone 4</Badge>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            Vault 素材库
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            沉淀可复用的创作素材，支持文字、链接、摘录、图片、语音转写和聊天记录。
          </p>
        </div>

        <Card className="border-none bg-white/84 shadow-xl shadow-slate-950/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Archive className="size-5 text-primary" />
              添加素材
            </CardTitle>
            <CardDescription>记录新的素材或灵感碎片。</CardDescription>
          </CardHeader>
          <CardContent>
            <MaterialCreateForm />
          </CardContent>
        </Card>

        <Card className="min-h-128 border-none bg-white/84 shadow-xl shadow-slate-950/10">
          <CardHeader className="gap-4">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Archive className="size-5 text-primary" />
                  素材列表
                </CardTitle>
                <CardDescription className="mt-2">
                  当前共 {materials.length} 个素材。
                </CardDescription>
              </div>

              <div className="space-y-3 xl:max-w-2xl">
                <div className="flex flex-wrap gap-2">
                  <Button
                    asChild
                    size="sm"
                    variant={selectedStatus ? "outline" : "default"}
                  >
                    <a href={buildVaultHref({ type: selectedType })}>
                      全部状态
                    </a>
                  </Button>
                  {MATERIAL_STATUS_OPTIONS.map((status) => (
                    <Button
                      key={status}
                      asChild
                      size="sm"
                      variant={selectedStatus === status ? "default" : "outline"}
                    >
                      <a
                        href={buildVaultHref({
                          status,
                          type: selectedType,
                        })}
                      >
                        {MATERIAL_STATUS_LABELS[status]}
                      </a>
                    </Button>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    asChild
                    size="sm"
                    variant={selectedType ? "outline" : "default"}
                  >
                    <a href={buildVaultHref({ status: selectedStatus })}>
                      全部类型
                    </a>
                  </Button>
                  {MATERIAL_TYPE_OPTIONS.map((type) => (
                    <Button
                      key={type}
                      asChild
                      size="sm"
                      variant={selectedType === type ? "default" : "outline"}
                    >
                      <a
                        href={buildVaultHref({
                          status: selectedStatus,
                          type,
                        })}
                      >
                        {MATERIAL_TYPE_LABELS[type]}
                      </a>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {materials.length === 0 ? (
              <div className="rounded-2xl bg-slate-100 p-8 text-center">
                <p className="text-sm text-slate-600">暂无素材。</p>
                <p className="mt-2 text-xs text-slate-500">
                  在上方添加您的第一个素材。
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {materials.map((material) => (
                  <MaterialItem key={material.id} material={material} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}
