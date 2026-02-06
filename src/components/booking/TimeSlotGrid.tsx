import { cn } from "@/lib/utils";

interface TimeSlot {
  hour: number;
  label: string;
  status: "available" | "booked" | "selected";
}

interface TimeSlotGridProps {
  slots: TimeSlot[];
  onSlotClick: (hour: number) => void;
  disabled?: boolean;
}

export function TimeSlotGrid({ slots, onSlotClick, disabled }: TimeSlotGridProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-foreground">Select Time Slots</h3>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-9">
        {slots.map((slot) => (
          <button
            key={slot.hour}
            type="button"
            disabled={disabled || slot.status === "booked"}
            onClick={() => onSlotClick(slot.hour)}
            className={cn(
              "flex flex-col items-center justify-center rounded-lg border p-3 text-sm font-medium transition-all",
              slot.status === "available" &&
                "border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 hover:border-primary/50",
              slot.status === "booked" &&
                "cursor-not-allowed border-muted bg-muted text-muted-foreground opacity-50",
              slot.status === "selected" &&
                "border-primary bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2",
              disabled && "pointer-events-none opacity-50"
            )}
          >
            <span>{slot.label}</span>
            <span className="text-xs opacity-70">
              {slot.status === "booked" ? "Booked" : slot.status === "selected" ? "Selected" : "Open"}
            </span>
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-primary/10 border border-primary/30" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-muted border border-muted" />
          <span>Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-primary" />
          <span>Selected</span>
        </div>
      </div>
    </div>
  );
}
