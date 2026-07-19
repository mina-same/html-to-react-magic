import { PageHeader } from "@/components/dashboard/PageHeader";
import LogoTab from "./LogoTab";

interface Props {
  assocId?: string;
  assocName?: string;
}

export default function LogoPage({ assocId, assocName }: Props) {
  return (
    <div>
      <PageHeader title="الشعار المتحرك" description="صمّم شعاراً متحركاً لاستخدامه في الفيديوهات والمحتوى" />
      <LogoTab assocId={assocId ?? "guest"} assocName={assocName ?? "الجمعية"} />
    </div>
  );
}
