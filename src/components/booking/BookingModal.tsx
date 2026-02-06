import { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Loader2, Clock, Users, Calendar, MapPin } from "lucide-react";
import { format } from "date-fns";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (purpose: string, attendees: number) => Promise<void>;
  roomName: string;
  roomCapacity: number;
  selectedDate: Date;
  selectedSlots: number[];
  creditsRemaining: number;
  userTier: string;
}

export function BookingModal({
  isOpen,
  onClose,
  onConfirm,
  roomName,
  roomCapacity,
  selectedDate,
  selectedSlots,
  creditsRemaining,
  userTier,
}: BookingModalProps) {
  const [purpose, setPurpose] = useState("");
  const [attendees, setAttendees] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatTimeRange = (slots: number[]) => {
    if (slots.length === 0) return "";
    const sorted = [...slots].sort((a, b) => a - b);
    const startHour = sorted[0];
    const endHour = sorted[sorted.length - 1] + 1;
    const formatHour = (h: number) => {
      const period = h >= 12 ? "PM" : "AM";
      const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
      return `${hour}:00 ${period}`;
    };
    return `${formatHour(startHour)} - ${formatHour(endHour)}`;
  };

  const handleSubmit = async () => {
    if (!purpose.trim()) return;
    setIsSubmitting(true);
    try {
      await onConfirm(purpose, attendees);
      setPurpose("");
      setAttendees(1);
    } finally {
      setIsSubmitting(false);
    }
  };

  const hoursNeeded = selectedSlots.length;
  const willUseCredits = creditsRemaining > 0;
  const creditsCost = Math.min(hoursNeeded, creditsRemaining);
  const additionalHours = Math.max(0, hoursNeeded - creditsRemaining);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Your Booking</DialogTitle>
          <DialogDescription>
            Review your booking details before confirming
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Booking Summary */}
          <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="font-medium">{roomName}</span>
              <Badge variant="secondary" className="text-xs">
                Up to {roomCapacity} people
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{format(selectedDate, "EEEE, MMMM d, yyyy")}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{formatTimeRange(selectedSlots)}</span>
              <span>({hoursNeeded} hour{hoursNeeded > 1 ? "s" : ""})</span>
            </div>
          </div>

          {/* Credits Info */}
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Your Plan</span>
              <Badge variant="outline" className="capitalize">
                {userTier}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-muted-foreground">Credits Remaining</span>
              <span className="font-medium text-primary">{creditsRemaining} hours</span>
            </div>
            {willUseCredits && (
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-muted-foreground">Credits Used</span>
                <span className="font-medium">{creditsCost} hours</span>
              </div>
            )}
            {additionalHours > 0 && (
              <div className="flex items-center justify-between text-sm mt-2 text-destructive">
                <span>Additional Charge</span>
                <span className="font-medium">${additionalHours * 25}/hr</span>
              </div>
            )}
          </div>

          {/* Purpose Input */}
          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose of Meeting *</Label>
            <Textarea
              id="purpose"
              placeholder="e.g., Client meeting, Team workshop, Interview..."
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="resize-none"
              rows={2}
            />
          </div>

          {/* Attendees Input */}
          <div className="space-y-2">
            <Label htmlFor="attendees">Number of Attendees</Label>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <Input
                id="attendees"
                type="number"
                min={1}
                max={roomCapacity}
                value={attendees}
                onChange={(e) => setAttendees(Math.min(roomCapacity, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">
                / {roomCapacity} max
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !purpose.trim()}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Booking...
              </>
            ) : (
              "Confirm Booking"
            )}
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-full"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
