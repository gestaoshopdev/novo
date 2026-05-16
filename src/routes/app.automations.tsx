import { createFileRoute } from "@tanstack/react-router";
import { Zap } from "lucide-react";
import { PageHeader, ComingSoonPanel } from "@/components/shared/PageHeader";
export const Route = createFileRoute("/app/automations")({
  head: () => ({ meta: [{ title: "Automações · Nimbus" }] }),
  component: () => (<div><PageHeader title="Automações" subtitle="Workflows no-code estilo Zapier." icon={Zap} /><ComingSoonPanel title="Construtor de workflows" description="Crie automações com triggers, condições e ações. Conecte canais, IA e sistemas externos." /></div>),
});
