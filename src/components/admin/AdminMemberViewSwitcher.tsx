import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Check, ChevronsUpDown, Eye, Loader2, Shield, UserRound, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { AdminViewMember, useAdminMemberView } from "@/hooks/useAdminMemberView";

export function AdminMemberViewSwitcher() {
  const location = useLocation();
  const {
    isAdmin,
    loading: adminViewLoading,
    selectedMember,
    selectedMemberId,
    isViewingAsMember,
    viewAsMember,
    returnToAdminView,
  } = useAdminMemberView();
  const [open, setOpen] = useState(false);
  const [members, setMembers] = useState<AdminViewMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  useEffect(() => {
    if (!open || !isAdmin || members.length > 0) return;

    let cancelled = false;

    async function loadMembers() {
      setLoadingMembers(true);

      const { data, error } = await supabase
        .from("members")
        .select("id, company_name, contact_name, email")
        .order("company_name", { ascending: true })
        .limit(300);

      if (cancelled) return;

      if (error) {
        console.error("Error loading members for admin view switcher:", error);
        setMembers([]);
      } else {
        setMembers(data || []);
      }

      setLoadingMembers(false);
    }

    void loadMembers();

    return () => {
      cancelled = true;
    };
  }, [isAdmin, members.length, open]);

  const returnPath = useMemo(() => {
    if (!location.pathname.startsWith("/admin")) return undefined;
    return `${location.pathname}${location.search}${location.hash}`;
  }, [location.hash, location.pathname, location.search]);

  if (!isAdmin || adminViewLoading) {
    return null;
  }

  const triggerLabel = isViewingAsMember
    ? selectedMember?.company_name || "Selected member"
    : "View as member";

  return (
    <div className="fixed bottom-20 left-4 z-50 flex max-w-[calc(100vw-2rem)] flex-wrap items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={isViewingAsMember ? "secondary" : "default"}
            size="sm"
            className={cn(
              "h-10 max-w-[22rem] justify-between gap-2 shadow-lg",
              isViewingAsMember && "border border-primary/30 bg-secondary text-secondary-foreground hover:bg-secondary/90",
            )}
          >
            {isViewingAsMember ? <Eye className="h-4 w-4 flex-shrink-0" /> : <UserRound className="h-4 w-4 flex-shrink-0" />}
            <span className="truncate">{isViewingAsMember ? `Viewing ${triggerLabel}` : triggerLabel}</span>
            <ChevronsUpDown className="h-3.5 w-3.5 flex-shrink-0 opacity-70" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" side="top" className="w-96 max-w-[calc(100vw-2rem)] p-0">
          <Command>
            <CommandInput placeholder="Search members..." />
            <CommandList>
              {loadingMembers ? (
                <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading members...
                </div>
              ) : (
                <>
                  <CommandEmpty>No members found.</CommandEmpty>
                  <CommandGroup heading="Members">
                    {members.map((member) => (
                      <CommandItem
                        key={member.id}
                        value={`${member.company_name} ${member.contact_name || ""} ${member.email}`}
                        onSelect={() => {
                          viewAsMember(member, { returnPath });
                          setOpen(false);
                        }}
                        className="gap-3"
                      >
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <UserRound className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{member.company_name}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {member.contact_name ? `${member.contact_name} · ` : ""}
                            {member.email}
                          </p>
                        </div>
                        <Check
                          className={cn(
                            "h-4 w-4 flex-shrink-0",
                            selectedMemberId === member.id ? "opacity-100" : "opacity-0",
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {isViewingAsMember && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-10 gap-2 bg-background/95 shadow-lg backdrop-blur"
          onClick={returnToAdminView}
        >
          <Shield className="h-4 w-4" />
          <span className="hidden sm:inline">Return admin</span>
          <X className="h-3.5 w-3.5 sm:hidden" />
        </Button>
      )}
    </div>
  );
}
