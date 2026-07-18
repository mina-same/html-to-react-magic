import { useState } from "react";
import { useDonations } from "@/api/queries";
import { LoadingState } from "@/components/common/StateViews";
import StatsCards from "./StatsCards";
import DonationsTable from "./DonationsTable";
import DonationCreateModal from "./DonationCreateModal";
import ImportModal from "./ImportModal";

export default function DonationsPage({ userId }: { userId?: string }) {
  const donationsQ = useDonations(userId);
  const donations = donationsQ.data ?? [];
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div>
      {/* Stats */}
      {donationsQ.isLoading ? (
        <LoadingState minHeight={120} />
      ) : (
        <StatsCards donations={donations} />
      )}

      {/* Table */}
      <DonationsTable
        donations={donations}
        query={donationsQ}
        onCreateClick={() => setCreateOpen(true)}
      />

      <DonationCreateModal
        open={createOpen}
        assocId={userId}
        onClose={() => setCreateOpen(false)}
      />

      <ImportModal assocId={userId} />
    </div>
  );
}
