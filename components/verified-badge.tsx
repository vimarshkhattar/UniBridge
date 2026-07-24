import { ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { isStonyBrookEmail } from "@/lib/utils";

export function VerifiedBadge({ email }: { email: string }) {
  if (!isStonyBrookEmail(email)) return null;

  return (
    <Badge title="This badge only indicates the account uses a matching @stonybrook.edu email domain.">
      <ShieldCheck className="mr-1 size-3.5" aria-hidden />
      Stony Brook Verified
    </Badge>
  );
}
