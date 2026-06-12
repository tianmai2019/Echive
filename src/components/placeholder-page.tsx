import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface PlaceholderPageProps {
  title: string;
  description: string;
  milestone: string;
  tasks: string[];
}

export function PlaceholderPage({
  title,
  description,
  milestone,
  tasks,
}: PlaceholderPageProps) {
  return (
    <AppShell>
      <section className="flex flex-1 items-center justify-center p-5 md:p-8">
        <Card className="w-full max-w-3xl border-none bg-white/84 shadow-xl shadow-slate-950/10">
          <CardHeader className="gap-4">
            <Badge className="w-fit">{milestone}</Badge>
            <div className="space-y-3">
              <CardTitle className="text-4xl tracking-tight">{title}</CardTitle>
              <CardDescription className="text-base leading-7">
                {description}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-3xl bg-slate-100 p-5">
              <p className="text-sm font-medium text-slate-950">后续任务</p>
              <ul className="mt-4 space-y-3 text-sm text-slate-700">
                {tasks.map((task) => (
                  <li key={task} className="flex gap-3">
                    <span className="mt-2 size-1.5 rounded-full bg-primary" />
                    <span>{task}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}
