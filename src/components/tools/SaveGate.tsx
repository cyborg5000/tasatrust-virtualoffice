// The lead-capture gate: using a tool is free; SAVING/DOWNLOADING requires a free account.
// Signed-in users pass straight through. Guests get a signup dialog (same Supabase auth as the member portal).
import { ReactNode, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, Lock } from "lucide-react";

type SaveGateProps = {
  onUnlocked: () => void;
  label?: string;
  toolSlug: string;
  children?: ReactNode;
};

export function SaveGate({ onUnlocked, label = "Download PDF", toolSlug }: SaveGateProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = () => {
    if (user) onUnlocked();
    else setOpen(true);
  };

  const goSignup = () => {
    navigate(`/signup?redirect=${encodeURIComponent(location.pathname)}&src=tool-${toolSlug}`);
  };
  const goLogin = () => {
    navigate(`/login?redirect=${encodeURIComponent(location.pathname)}&src=tool-${toolSlug}`);
  };

  return (
    <>
      <Button onClick={handleClick} className="gap-2">
        {user ? <Download className="size-4" /> : <Lock className="size-4" />}
        {label}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create a free account to download</DialogTitle>
            <DialogDescription>
              Your free TASA Trust account saves your documents, keeps your business details for next
              time, and unlocks every tool on this site. No payment needed.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Button onClick={goSignup}>Create free account</Button>
            <Button variant="outline" onClick={goLogin}>
              I already have an account
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
