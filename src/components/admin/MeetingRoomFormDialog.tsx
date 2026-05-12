import { useEffect, useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";

export interface MeetingRoomFormData {
  name: string;
  capacity: number;
  location: string;
  is_active: boolean;
}

interface MeetingRoomFormDialogProps {
  isOpen: boolean;
  mode: "create" | "edit";
  initialData?: MeetingRoomFormData | null;
  onClose: () => void;
  onSubmit: (data: MeetingRoomFormData) => Promise<void>;
}

const defaultFormData: MeetingRoomFormData = {
  name: "",
  capacity: 4,
  location: "",
  is_active: true,
};

export function MeetingRoomFormDialog({
  isOpen,
  mode,
  initialData,
  onClose,
  onSubmit,
}: MeetingRoomFormDialogProps) {
  const [formData, setFormData] = useState<MeetingRoomFormData>(defaultFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setFormData(initialData || defaultFormData);
  }, [initialData, isOpen]);

  const handleSubmit = async () => {
    if (!formData.name.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        name: formData.name.trim(),
        location: formData.location.trim(),
        capacity: Math.max(1, Math.round(Number(formData.capacity) || 1)),
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add Meeting Room" : "Edit Meeting Room"}
          </DialogTitle>
          <DialogDescription>
            Active rooms appear in the member booking flow.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="meeting-room-name">Room Name *</Label>
            <Input
              id="meeting-room-name"
              value={formData.name}
              onChange={(event) => setFormData({ ...formData, name: event.target.value })}
              placeholder="Conference Room"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="meeting-room-capacity">Capacity</Label>
              <Input
                id="meeting-room-capacity"
                type="number"
                min="1"
                step="1"
                value={formData.capacity}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    capacity: Math.max(1, parseInt(event.target.value, 10) || 1),
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="meeting-room-location">Location</Label>
              <Input
                id="meeting-room-location"
                value={formData.location}
                onChange={(event) => setFormData({ ...formData, location: event.target.value })}
                placeholder="Second Floor"
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-md border border-border bg-muted/30 px-3 py-2">
            <div>
              <Label htmlFor="meeting-room-active">Available to members</Label>
              <p className="text-xs text-muted-foreground">
                Members can only book active rooms.
              </p>
            </div>
            <Switch
              id="meeting-room-active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !formData.name.trim()}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : mode === "create" ? (
              "Add Room"
            ) : (
              "Save Room"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
