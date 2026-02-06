import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Globe, CheckCircle, Clock, AlertCircle, Eye } from "lucide-react";
import { format } from "date-fns";
import type { Database } from "@/integrations/supabase/types";

type WebsiteBuild = Database["public"]["Tables"]["website_builds"]["Row"];
type SubscriptionTier = Database["public"]["Enums"]["subscription_tier"];

interface WebsiteBuildCardProps {
  tier: SubscriptionTier | null;
}

const STATUS_CONFIG: Record<string, { label: string; icon: typeof Clock; className: string }> = {
  pending: { label: "Pending Request", icon: Clock, className: "bg-yellow-500/20 text-yellow-700" },
  in_progress: { label: "In Progress", icon: AlertCircle, className: "bg-blue-500/20 text-blue-700" },
  in_review: { label: "In Review", icon: Eye, className: "bg-purple-500/20 text-purple-700" },
  completed: { label: "Live", icon: CheckCircle, className: "bg-green-500/20 text-green-700" },
};

export function WebsiteBuildCard({ tier }: WebsiteBuildCardProps) {
  const { user } = useAuth();
  const [build, setBuild] = useState<WebsiteBuild | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBuild() {
      if (!user) return;

      const { data, error } = await supabase
        .from("website_builds")
        .select("*")
        .eq("member_id", user.id)
        .order("created_at", { ascending: false })
        .maybeSingle();

      if (!error && data) {
        setBuild(data);
      }
      setLoading(false);
    }

    fetchBuild();
  }, [user]);

  // Only show for Professional tier
  if (tier !== "professional") {
    return null;
  }

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </CardContent>
      </Card>
    );
  }

  if (!build) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">My Website</CardTitle>
          <Globe className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <span className="text-2xl font-bold">Not Started</span>
          <p className="mt-1 text-sm text-muted-foreground">
            Contact us to start your website build
          </p>
        </CardContent>
      </Card>
    );
  }

  const status = build.status || "pending";
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const StatusIcon = config.icon;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">My Website</CardTitle>
        <Globe className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-2">
          <Badge className={config.className}>
            <StatusIcon className="mr-1 h-3 w-3" />
            {config.label}
          </Badge>
        </div>
        {build.domain ? (
          <p className="text-sm font-medium">{build.domain}</p>
        ) : (
          <p className="text-sm text-muted-foreground">Domain not assigned yet</p>
        )}
        {build.due_date && status !== "completed" && (
          <p className="mt-2 text-xs text-muted-foreground">
            Expected: {format(new Date(build.due_date), "MMM d, yyyy")}
          </p>
        )}
        {status === "completed" && build.domain && (
          <a
            href={`https://${build.domain}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center text-xs text-primary hover:underline"
          >
            Visit your website →
          </a>
        )}
      </CardContent>
    </Card>
  );
}
