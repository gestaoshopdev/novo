import { createFileRoute } from "@tanstack/react-router";
import { Store } from "lucide-react";
import { PageHeader, ComingSoonPanel } from "@/components/shared/PageHeader";
export const Route = createFileRoute("/app/store")({
  head: () => ({ meta: [{ title: "Loja · Nimbus" }] }),
  component: () => (<div><PageHeader title="Loja" subtitle="Sua loja online integrada." icon={Store} /><ComingSoonPanel title="Loja virtual" description="Configure domínio, tema, checkout e frete em poucos cliques." /></div>),
});
