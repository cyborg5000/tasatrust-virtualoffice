import { useCallback, useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { MemberDetailDrawer } from "@/components/admin/MemberDetailDrawer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { getSubscriptionTierLabel, type SubscriptionTier } from "@/lib/subscriptionPlans";
import { getMemberReviewSignals, isMemberReviewCandidate } from "@/lib/signupAbuse";
import { AlertTriangle, Search, Eye, Users, Filter } from "lucide-react";

interface MemberWithSubscription {
  id: string;
  company_name: string;
  contact_name: string | null;
  email: string;
  phone: string | null;
  created_at: string | null;
  subscription?: {
    tier: string;
    status: string;
    current_period_end: string | null;
    stripe_subscription_id: string | null;
  } | null;
  orders?: Array<{
    id: string;
    amount: number;
    status: string;
    created_at: string | null;
  }>;
}

export default function AdminMembers() {
  const [members, setMembers] = useState<MemberWithSubscription[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<MemberWithSubscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedMember, setSelectedMember] = useState<MemberWithSubscription | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fetchMembers = useCallback(async () => {
    setIsLoading(true);

    const { data: membersData, error } = await supabase
      .from("members")
      .select(`
        *,
        subscriptions (
          tier,
          status,
          current_period_end,
          stripe_subscription_id,
          created_at
        ),
        orders (
          id,
          amount,
          status,
          created_at
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching members:", error);
      setIsLoading(false);
      return;
    }

    const mappedMembers: MemberWithSubscription[] = (membersData || []).map((member) => {
      const subscriptions = [...(member.subscriptions || [])].sort((a, b) => {
        if (a.status === "active" && b.status !== "active") return -1;
        if (a.status !== "active" && b.status === "active") return 1;
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      });

      return {
        ...member,
        orders: member.orders || [],
        subscription: subscriptions[0]
          ? {
              tier: subscriptions[0].tier,
              status: subscriptions[0].status,
              current_period_end: subscriptions[0].current_period_end,
              stripe_subscription_id: subscriptions[0].stripe_subscription_id,
            }
          : null,
      };
    });

    setMembers(mappedMembers);
    setFilteredMembers(mappedMembers);
    setIsLoading(false);
  }, []);

  const getReviewSignalsForMember = useCallback((member: MemberWithSubscription) => {
    return getMemberReviewSignals({
      companyName: member.company_name,
      email: member.email,
      createdAt: member.created_at,
      hasSubscription: Boolean(member.subscription),
      orderCount: member.orders?.length || 0,
    });
  }, []);

  const isReviewCandidate = useCallback(
    (member: MemberWithSubscription) =>
      isMemberReviewCandidate({
        companyName: member.company_name,
        email: member.email,
        createdAt: member.created_at,
        hasSubscription: Boolean(member.subscription),
        orderCount: member.orders?.length || 0,
      }),
    [],
  );

  useEffect(() => {
    void fetchMembers();
  }, [fetchMembers]);

  // Apply filters
  useEffect(() => {
    let filtered = [...members];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.company_name.toLowerCase().includes(query) ||
          m.email.toLowerCase().includes(query) ||
          m.contact_name?.toLowerCase().includes(query)
      );
    }

    // Tier filter
    if (tierFilter !== "all") {
      filtered = filtered.filter((m) => m.subscription?.tier === tierFilter);
    }

    // Status filter
    if (statusFilter !== "all") {
      if (statusFilter === "no_subscription") {
        filtered = filtered.filter((m) => !m.subscription);
      } else if (statusFilter === "needs_review") {
        filtered = filtered.filter((m) => isReviewCandidate(m));
      } else {
        filtered = filtered.filter((m) => m.subscription?.status === statusFilter);
      }
    }

    setFilteredMembers(filtered);
  }, [isReviewCandidate, members, searchQuery, tierFilter, statusFilter]);

  const handleViewDetails = async (member: MemberWithSubscription) => {
    // Fetch orders for this member
    const { data: ordersData } = await supabase
      .from("orders")
      .select("id, amount, status, created_at")
      .eq("member_id", member.id)
      .order("created_at", { ascending: false })
      .limit(5);

    setSelectedMember({
      ...member,
      orders: ordersData || [],
    });
    setIsDrawerOpen(true);
  };

  const handleSubscriptionAssigned = (
    memberId: string,
    subscription: MemberWithSubscription["subscription"]
  ) => {
    setMembers((currentMembers) =>
      currentMembers.map((member) =>
        member.id === memberId
          ? {
              ...member,
              subscription,
            }
          : member
      )
    );

    setSelectedMember((currentMember) =>
      currentMember && currentMember.id === memberId
        ? {
            ...currentMember,
            subscription,
          }
        : currentMember
    );
  };

  const tierColors: Record<string, string> = {
    basic: "bg-secondary text-secondary-foreground",
    essential: "bg-primary/20 text-primary",
    professional: "bg-primary text-primary-foreground",
  };

  const statusColors: Record<string, string> = {
    active: "bg-green-500/20 text-green-700",
    cancelled: "bg-destructive/20 text-destructive",
    past_due: "bg-yellow-500/20 text-yellow-700",
    paused: "bg-muted text-muted-foreground",
  };

  const reviewCandidateCount = members.filter(isReviewCandidate).length;

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-96" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Member Management</h1>
            <p className="text-muted-foreground">
              View and manage all registered members
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="w-fit text-sm">
              <Users className="mr-1 h-3 w-3" />
              {members.length} total members
            </Badge>
            {reviewCandidateCount > 0 && (
              <Badge variant="outline" className="w-fit border-amber-300 bg-amber-50 text-sm text-amber-800">
                <AlertTriangle className="mr-1 h-3 w-3" />
                {reviewCandidateCount} need review
              </Badge>
            )}
          </div>
        </div>

        {reviewCandidateCount > 0 && (
          <Alert className="border-amber-200 bg-amber-50 text-amber-900">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Some no-subscription signups match the April bot-signup pattern. Review them before deleting; paid,
              assigned, and order-bearing members are excluded from this count.
            </AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 md:flex-row">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by company, email, or contact..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Tier Filter */}
              <Select value={tierFilter} onValueChange={setTierFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tiers</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="essential">Essential</SelectItem>
                  <SelectItem value="professional">Premium</SelectItem>
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-44">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="past_due">Past Due</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="no_subscription">No Subscription</SelectItem>
                  <SelectItem value="needs_review">Needs Review</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Members Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No members found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMembers.map((member) => {
                    const reviewSignals = getReviewSignalsForMember(member);
                    const needsReview = reviewSignals.length > 0;

                    return (
                    <TableRow key={member.id} className={needsReview ? "bg-amber-50/40" : undefined}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium">{member.company_name}</p>
                            {needsReview && (
                              <Badge
                                variant="outline"
                                className="border-amber-300 bg-amber-100 text-amber-800"
                                title={reviewSignals.join(", ")}
                              >
                                Review
                              </Badge>
                            )}
                          </div>
                          {member.contact_name && (
                            <p className="text-xs text-muted-foreground">{member.contact_name}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{member.email}</TableCell>
                      <TableCell>
                        {member.subscription ? (
                          <Badge className={tierColors[member.subscription.tier] || ""}>
                            {getSubscriptionTierLabel(member.subscription.tier as SubscriptionTier)}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {member.subscription ? (
                          <Badge className={statusColors[member.subscription.status] || ""}>
                            {member.subscription.status.charAt(0).toUpperCase() +
                              member.subscription.status.slice(1)}
                          </Badge>
                        ) : (
                          <Badge variant="outline">No Sub</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {member.created_at
                          ? format(new Date(member.created_at), "MMM d, yyyy")
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(member)}
                        >
                          <Eye className="mr-1 h-4 w-4" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Member Detail Drawer */}
      <MemberDetailDrawer
        member={selectedMember}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSubscriptionAssigned={handleSubscriptionAssigned}
      />
    </AdminLayout>
  );
}
