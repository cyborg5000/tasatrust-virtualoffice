import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, Building2, Mail, Calendar, User, Globe } from "lucide-react";
import { format } from "date-fns";
import type { Database } from "@/integrations/supabase/types";

type WebsiteBuild = Database["public"]["Tables"]["website_builds"]["Row"];

interface WebsiteBuildWithMember extends WebsiteBuild {
  member?: {
    company_name: string;
    email: string;
  } | null;
}

const STATUSES = [
  { value: "pending", label: "Pending Request" },
  { value: "in_progress", label: "In Progress" },
  { value: "in_review", label: "In Review" },
  { value: "completed", label: "Completed/Live" },
];

interface WebsiteBuildDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  build: WebsiteBuildWithMember | null;
  onSave: (id: string, updates: Partial<WebsiteBuild>) => Promise<void>;
}

export function WebsiteBuildDetailDialog({
  isOpen,
  onClose,
  build,
  onSave,
}: WebsiteBuildDetailDialogProps) {
  const [status, setStatus] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [domain, setDomain] = useState("");
  const [requirements, setRequirements] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (build) {
      setStatus(build.status || "pending");
      setAssignedTo(build.assigned_to || "");
      setDueDate(build.due_date || "");
      setDomain(build.domain || "");
      setRequirements(build.requirements || "");
    }
  }, [build]);

  const handleSave = async () => {
    if (!build) return;
    setIsSaving(true);
    try {
      await onSave(build.id, {
        status,
        assigned_to: assignedTo || null,
        due_date: dueDate || null,
        domain: domain || null,
        requirements: requirements || null,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  if (!build) return null;

  const statusConfig = STATUSES.find((s) => s.value === status);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Website Build Details</DialogTitle>
          <DialogDescription>
            Manage website build request for {build.member?.company_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Member Info */}
          <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                {build.member?.company_name || "Unknown"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>{build.member?.email || "—"}</span>
            </div>
            {build.created_at && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>
                  Requested on {format(new Date(build.created_at), "MMM d, yyyy")}
                </span>
              </div>
            )}
          </div>

          <Separator />

          {/* Status */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Assigned To */}
          <div className="space-y-2">
            <Label htmlFor="assignedTo">Assigned To</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="assignedTo"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder="Team member name"
                className="pl-9"
              />
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          {/* Domain */}
          <div className="space-y-2">
            <Label htmlFor="domain">Domain</Label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="domain"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="example.com"
                className="pl-9"
              />
            </div>
          </div>

          {/* Requirements */}
          <div className="space-y-2">
            <Label htmlFor="requirements">Member Requirements</Label>
            <Textarea
              id="requirements"
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="Website requirements and notes..."
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
