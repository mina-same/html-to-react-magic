import { createFileRoute } from "@tanstack/react-router";
import CaptionsWorkspace from "@/components/captions/CaptionsWorkspace";

export const Route = createFileRoute("/captions")({
  head: () => ({ meta: [{ title: "Caption Editor – ساعِد" }] }),
  component: CaptionsWorkspace,
});
