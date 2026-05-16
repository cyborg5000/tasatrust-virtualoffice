import { useCallback, useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Search, MoreHorizontal, CheckCircle, XCircle, Clock, RefreshCw, Receipt } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Order = Database["public"]["Tables"]["orders"]["Row"];
type OrderStatus = Database["public"]["Enums"]["order_status"];

interface OrderWithDetails extends Order {
  member?: {
    company_name: string;
    email: string;
  } | null;
  service?: {
    name: string;
  } | null;
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; className: string; icon: typeof Clock }> = {
  pending: { label: "Pending", className: "bg-yellow-500/20 text-yellow-700", icon: Clock },
  processing: { label: "Processing", className: "bg-blue-500/20 text-blue-700", icon: RefreshCw },
  completed: { label: "Completed", className: "bg-green-500/20 text-green-700", icon: CheckCircle },
  cancelled: { label: "Cancelled", className: "bg-destructive/20 text-destructive", icon: XCircle },
  refunded: { label: "Refunded", className: "bg-muted text-muted-foreground", icon: RefreshCw },
};

export default function AdminOrders() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        members (company_name, email),
        services (name)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error);
      toast({ title: "Error", description: "Failed to load orders", variant: "destructive" });
    } else {
      const mapped = (data || []).map((order) => ({
        ...order,
        member: order.members,
        service: order.services,
      }));
      setOrders(mapped);
      setFilteredOrders(mapped);
    }
    setIsLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Apply filters
  useEffect(() => {
    let filtered = [...orders];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o.member?.company_name?.toLowerCase().includes(query) ||
          o.member?.email?.toLowerCase().includes(query) ||
          o.service?.name?.toLowerCase().includes(query) ||
          o.id.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((o) => o.status === statusFilter);
    }

    setFilteredOrders(filtered);
  }, [orders, searchQuery, statusFilter]);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", orderId);

    if (error) {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    } else {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      toast({ title: "Updated", description: `Order marked as ${newStatus}` });
    }
  };

  const totalRevenue = filteredOrders
    .filter((o) => o.status === "completed")
    .reduce((sum, o) => sum + Number(o.amount), 0);

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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Order Management</h1>
            <p className="text-muted-foreground">View and manage all transactions</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-sm">
              <Receipt className="mr-1 size-3" />
              {filteredOrders.length} orders
            </Badge>
            <Badge className="bg-green-500/20 text-green-700 text-sm">
              ${totalRevenue.toLocaleString()} completed
            </Badge>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by company, email, service, or order ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={fetchOrders}>
                <RefreshCw className="mr-2 size-4" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table - Dense layout */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Transactions</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="text-xs">
                    <TableHead className="w-[100px]">Order ID</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                        No orders found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order) => {
                      const statusConfig = STATUS_CONFIG[order.status || "pending"];
                      const orderDateLabel = order.created_at
                        ? format(new Date(order.created_at), "MMM d, yyyy HH:mm")
                        : "—";
                      return (
                        <TableRow key={order.id} className="text-sm">
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {order.id.slice(0, 8)}...
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm">
                                {order.member?.company_name || "Unknown"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {order.member?.email || "—"}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {order.service?.name || "—"}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs capitalize">
                              {order.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            ${Number(order.amount).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge className={`text-xs ${statusConfig.className}`}>
                              {statusConfig.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {orderDateLabel}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="size-8">
                                  <MoreHorizontal className="size-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(order.id, "completed")}
                                  disabled={order.status === "completed"}
                                >
                                  <CheckCircle className="mr-2 size-4 text-green-600" />
                                  Mark Completed
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(order.id, "processing")}
                                  disabled={order.status === "processing"}
                                >
                                  <RefreshCw className="mr-2 size-4 text-blue-600" />
                                  Mark Processing
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(order.id, "cancelled")}
                                  disabled={order.status === "cancelled"}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <XCircle className="mr-2 size-4" />
                                  Mark Cancelled
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(order.id, "refunded")}
                                  disabled={order.status === "refunded"}
                                >
                                  <RefreshCw className="mr-2 size-4" />
                                  Mark Refunded
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
