import { useState, useEffect, useMemo } from "react";
import { format, addDays, isBefore, startOfDay } from "date-fns";
import { MemberLayout } from "@/components/member/MemberLayout";
import { TimeSlotGrid } from "@/components/booking/TimeSlotGrid";
import { BookingModal } from "@/components/booking/BookingModal";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAdminMemberView } from "@/hooks/useAdminMemberView";
import { CalendarIcon, Clock, MapPin, Users, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Database } from "@/integrations/supabase/types";

type MeetingRoom = Database["public"]["Tables"]["meeting_rooms"]["Row"];
type SubscriptionTier = Database["public"]["Enums"]["subscription_tier"];

interface BookedSlot {
  hour: number;
  bookingId: string;
}

// Hours from 9 AM to 6 PM
const BUSINESS_HOURS = Array.from({ length: 9 }, (_, i) => i + 9);

// Credits per tier (hours of free meeting room per month)
const TIER_CREDITS: Record<SubscriptionTier, number> = {
  basic: 2,
  essential: 4,
  professional: 8,
};

export default function MemberBookings() {
  const { effectiveMemberId, isViewingAsMember } = useAdminMemberView();
  const { toast } = useToast();

  const [rooms, setRooms] = useState<MeetingRoom[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlots, setSelectedSlots] = useState<number[]>([]);
  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);
  const [userTier, setUserTier] = useState<SubscriptionTier>("basic");
  const [usedCredits, setUsedCredits] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingSlots, setIsFetchingSlots] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);
  const maxDate = addDays(new Date(), 30);

  // Fetch rooms and user subscription on mount
  useEffect(() => {
    async function fetchInitialData() {
      setIsLoading(true);

      // Fetch meeting rooms
      const { data: roomsData } = await supabase
        .from("meeting_rooms")
        .select("*")
        .eq("is_active", true)
        .order("capacity", { ascending: true });

      if (roomsData && roomsData.length > 0) {
        setRooms(roomsData);
        setSelectedRoomId(roomsData[0].id);
      }

      // Fetch user subscription tier
      if (effectiveMemberId) {
        const { data: subscriptionData } = await supabase
          .from("subscriptions")
          .select("tier")
          .eq("member_id", effectiveMemberId)
          .eq("status", "active")
          .maybeSingle();

        if (subscriptionData) {
          setUserTier(subscriptionData.tier);
        }

        // Fetch used credits this month (count of booked hours)
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const { count } = await supabase
          .from("bookings")
          .select("*", { count: "exact", head: true })
          .eq("member_id", effectiveMemberId)
          .eq("status", "confirmed")
          .gte("created_at", startOfMonth.toISOString());

        setUsedCredits(count || 0);
      }

      setIsLoading(false);
    }

    fetchInitialData();
  }, [effectiveMemberId]);

  // Fetch booked slots when room or date changes
  useEffect(() => {
    async function fetchBookedSlots() {
      if (!selectedRoomId || !selectedDate) return;

      setIsFetchingSlots(true);

      const dateStr = format(selectedDate, "yyyy-MM-dd");

      // Fetch booking slots for this room and date
      const { data: slotsData } = await supabase
        .from("booking_slots")
        .select(`
          id,
          start_time,
          is_available,
          bookings (
            id,
            status
          )
        `)
        .eq("meeting_room_id", selectedRoomId)
        .eq("date", dateStr);

      const booked: BookedSlot[] = [];

      if (slotsData) {
        slotsData.forEach((slot) => {
          // Parse hour from time string (e.g., "09:00:00" -> 9)
          const hour = parseInt(slot.start_time.split(":")[0], 10);
          
          // Check if slot has a confirmed booking
          const hasConfirmedBooking = slot.bookings?.some(
            (b: { status: string }) => b.status === "confirmed" || b.status === "pending"
          );

          if (!slot.is_available || hasConfirmedBooking) {
            booked.push({
              hour,
              bookingId: slot.id,
            });
          }
        });
      }

      setBookedSlots(booked);
      setSelectedSlots([]); // Reset selection when room/date changes
      setIsFetchingSlots(false);
    }

    fetchBookedSlots();
  }, [selectedRoomId, selectedDate]);

  // Calculate credits remaining
  const creditsRemaining = useMemo(() => {
    const totalCredits = TIER_CREDITS[userTier];
    return Math.max(0, totalCredits - usedCredits);
  }, [userTier, usedCredits]);

  // Build time slots with status
  const timeSlots = useMemo(() => {
    return BUSINESS_HOURS.map((hour) => {
      const isBooked = bookedSlots.some((b) => b.hour === hour);
      const isSelected = selectedSlots.includes(hour);

      return {
        hour,
        label: `${hour > 12 ? hour - 12 : hour}${hour >= 12 ? "PM" : "AM"}`,
        status: isBooked ? "booked" : isSelected ? "selected" : "available",
      } as const;
    });
  }, [bookedSlots, selectedSlots]);

  const handleSlotClick = (hour: number) => {
    setSelectedSlots((prev) =>
      prev.includes(hour)
        ? prev.filter((h) => h !== hour)
        : [...prev, hour].sort((a, b) => a - b)
    );
  };

  const handleBookingConfirm = async (purpose: string, attendees: number) => {
    if (isViewingAsMember) {
      toast({
        title: "View-only mode",
        description: "Bookings are not created while an admin is viewing as a member.",
      });
      return;
    }

    if (!effectiveMemberId || !selectedRoomId || selectedSlots.length === 0) return;

    const dateStr = format(selectedDate, "yyyy-MM-dd");

    try {
      // Check for double booking before inserting
      for (const hour of selectedSlots) {
        const startTime = `${hour.toString().padStart(2, "0")}:00:00`;
        const endTime = `${(hour + 1).toString().padStart(2, "0")}:00:00`;

        // Check if slot exists and is available
        const { data: existingSlot } = await supabase
          .from("booking_slots")
          .select("id, is_available")
          .eq("meeting_room_id", selectedRoomId)
          .eq("date", dateStr)
          .eq("start_time", startTime)
          .maybeSingle();

        if (existingSlot && !existingSlot.is_available) {
          throw new Error(`The ${hour > 12 ? hour - 12 : hour}${hour >= 12 ? "PM" : "AM"} slot has already been booked.`);
        }

        // Check for existing confirmed bookings on this slot
        if (existingSlot) {
          const { data: existingBookings } = await supabase
            .from("bookings")
            .select("id")
            .eq("booking_slot_id", existingSlot.id)
            .in("status", ["pending", "confirmed"]);

          if (existingBookings && existingBookings.length > 0) {
            throw new Error(`The ${hour > 12 ? hour - 12 : hour}${hour >= 12 ? "PM" : "AM"} slot has already been booked.`);
          }
        }
      }

      // Create booking slots and bookings for each selected hour
      for (const hour of selectedSlots) {
        const startTime = `${hour.toString().padStart(2, "0")}:00:00`;
        const endTime = `${(hour + 1).toString().padStart(2, "0")}:00:00`;

        // Insert or update booking slot
        const { data: slotData, error: slotError } = await supabase
          .from("booking_slots")
          .upsert(
            {
              meeting_room_id: selectedRoomId,
              date: dateStr,
              start_time: startTime,
              end_time: endTime,
              is_available: false,
            },
            {
              onConflict: "meeting_room_id,date,start_time",
              ignoreDuplicates: false,
            }
          )
          .select()
          .single();

        if (slotError) {
          // If upsert fails, try to get existing slot
          const { data: existingSlot } = await supabase
            .from("booking_slots")
            .select("id")
            .eq("meeting_room_id", selectedRoomId)
            .eq("date", dateStr)
            .eq("start_time", startTime)
            .single();

          if (!existingSlot) throw slotError;

          // Create booking with existing slot
          const { error: bookingError } = await supabase.from("bookings").insert({
            member_id: effectiveMemberId,
            booking_slot_id: existingSlot.id,
            status: "confirmed",
            purpose: `${purpose} (${attendees} attendees)`,
          });

          if (bookingError) throw bookingError;
        } else {
          // Create booking with new slot
          const { error: bookingError } = await supabase.from("bookings").insert({
            member_id: effectiveMemberId,
            booking_slot_id: slotData.id,
            status: "confirmed",
            purpose: `${purpose} (${attendees} attendees)`,
          });

          if (bookingError) throw bookingError;
        }
      }

      toast({
        title: "Booking Confirmed!",
        description: `${selectedRoom?.name} booked for ${format(selectedDate, "MMM d")} at ${selectedSlots.length} hour(s).`,
      });

      setIsModalOpen(false);
      setSelectedSlots([]);

      // Refresh booked slots
      const { data: slotsData } = await supabase
        .from("booking_slots")
        .select("id, start_time, is_available")
        .eq("meeting_room_id", selectedRoomId)
        .eq("date", dateStr)
        .eq("is_available", false);

      if (slotsData) {
        setBookedSlots(
          slotsData.map((slot) => ({
            hour: parseInt(slot.start_time.split(":")[0], 10),
            bookingId: slot.id,
          }))
        );
      }

      setUsedCredits((prev) => prev + selectedSlots.length);
    } catch (error) {
      console.error("Booking error:", error);
      toast({
        title: "Booking Failed",
        description: error instanceof Error ? error.message : "Unable to complete booking. Please try again.",
        variant: "destructive",
      });
    }
  };

  const disabledDates = (date: Date) => {
    const today = startOfDay(new Date());
    return isBefore(date, today) || date > maxDate;
  };

  if (isLoading) {
    return (
      <MemberLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid gap-6 lg:grid-cols-3">
            <Skeleton className="h-96" />
            <Skeleton className="h-96 lg:col-span-2" />
          </div>
        </div>
      </MemberLayout>
    );
  }

  return (
    <MemberLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Meeting Rooms</h1>
            <p className="text-muted-foreground">
              Book a meeting room for your next client meeting or team session
            </p>
          </div>
          <Badge variant="outline" className="w-fit text-sm">
            <Clock className="mr-1 h-3 w-3" />
            {creditsRemaining} hours remaining this month
          </Badge>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Room & Date Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Room & Date</CardTitle>
              <CardDescription>
                Choose a meeting room and date to see availability
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Room Selector */}
              <div className="space-y-2">
                <Label htmlFor="room">Meeting Room</Label>
                <Select value={selectedRoomId} onValueChange={setSelectedRoomId}>
                  <SelectTrigger id="room" className="bg-background">
                    <SelectValue placeholder="Select a room" />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    {rooms.map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{room.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({room.capacity}p)
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Selected Room Info */}
              {selectedRoom && (
                <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <MapPin className="h-4 w-4 text-primary" />
                    {selectedRoom.name}
                  </div>
                  {selectedRoom.location && (
                    <p className="text-xs text-muted-foreground pl-6">
                      {selectedRoom.location}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground pl-6">
                    <Users className="h-3 w-3" />
                    Up to {selectedRoom.capacity} people
                  </div>
                </div>
              )}

              {/* Date Picker */}
              <div className="space-y-2">
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-background",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? (
                        format(selectedDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-background z-50" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      disabled={disabledDates}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-muted-foreground">
                  Bookings can be made up to 30 days in advance
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Right Column - Time Slots */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Available Time Slots</CardTitle>
                  <CardDescription>
                    {format(selectedDate, "EEEE, MMMM d, yyyy")}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setIsFetchingSlots(true);
                    setTimeout(() => setIsFetchingSlots(false), 500);
                  }}
                  disabled={isFetchingSlots}
                >
                  <RefreshCw
                    className={cn("h-4 w-4", isFetchingSlots && "animate-spin")}
                  />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {isFetchingSlots ? (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-9">
                  {BUSINESS_HOURS.map((hour) => (
                    <Skeleton key={hour} className="h-16 rounded-lg" />
                  ))}
                </div>
              ) : (
                <TimeSlotGrid
                  slots={timeSlots}
                  onSlotClick={handleSlotClick}
                  disabled={!selectedRoomId}
                />
              )}

              {/* Booking Summary & Action */}
              {selectedSlots.length > 0 && (
                <div className="flex flex-col gap-4 rounded-lg border border-primary/20 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium text-foreground">
                      {selectedSlots.length} hour{selectedSlots.length > 1 ? "s" : ""} selected
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedSlots
                        .map((h) => `${h > 12 ? h - 12 : h}${h >= 12 ? "PM" : "AM"}`)
                        .join(", ")}
                    </p>
                  </div>
                  <Button onClick={() => setIsModalOpen(true)}>
                    Continue to Book
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Booking Modal */}
      {selectedRoom && (
        <BookingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleBookingConfirm}
          roomName={selectedRoom.name}
          roomCapacity={selectedRoom.capacity || 4}
          selectedDate={selectedDate}
          selectedSlots={selectedSlots}
          creditsRemaining={creditsRemaining}
          userTier={userTier}
        />
      )}
    </MemberLayout>
  );
}
