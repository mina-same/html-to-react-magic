import { toast } from "sonner";
import DonationModal from "../../modals/DonationModal";
import { useCreateDonation } from "@/api/mutations";
import type { Donation } from "../../types";

interface Props {
  open: boolean;
  assocId?: string;
  onClose: () => void;
}

/**
 * Wraps the shared `DonationModal` form and wires it to the React Query
 * `useCreateDonation` mutation. The modal's `onSave` is fire-and-forget; the
 * mutation runs in the background, invalidates the donations list, and surfaces
 * a toast for both success and failure.
 */
export default function DonationCreateModal({ open, assocId, onClose }: Props) {
  const createM = useCreateDonation(assocId);

  const handleSave = (payload: Omit<Donation, "id">) => {
    if (!assocId) {
      toast.error("يلزم تسجيل الدخول أولاً.");
      return;
    }
    createM.mutate(payload, {
      onSuccess: (created) => {
        if (created) toast.success("تمت إضافة التبرع بنجاح");
        else toast.error("تعذر حفظ التبرع");
      },
      onError: () => toast.error("تعذر حفظ التبرع"),
    });
  };

  return <DonationModal open={open} onSave={handleSave} onClose={onClose} />;
}
