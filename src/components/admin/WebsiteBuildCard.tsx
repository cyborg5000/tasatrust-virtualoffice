import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Calendar, User, GripVertical, ExternalLink } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type WebsiteBuild = Database["public"]["Tables"]["website_builds"]["Row"];

interface WebsiteBuildWithMember extends WebsiteBuild {
  member?: {
    company_name: string;
    email: string;
  } | null;
}

interface WebsiteBuildCardProps {
  build: WebsiteBuildWithMember;
  onClick: () => void;
}

export function WebsiteBuildCard({ build, onClick }: WebsiteBuildCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: build.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isOverdue = build.due_date && new Date(build.due_date) < new Date();

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="cursor-pointer transition-shadow hover:shadow-md"
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 p-3 pb-2">
        <div className="flex items-center gap-2">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <div className="min-w-0 flex-1" onClick={onClick}>
            <p className="text-sm font-medium leading-none truncate">
              {build.member?.company_name || "Unknown Member"}
            </p>
            {build.domain && (
              <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                <ExternalLink className="h-3 w-3" />
                {build.domain}
              </p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0" onClick={onClick}>
        {build.requirements && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
            {build.requirements}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {build.assigned_to && (
            <Badge variant="outline" className="text-xs">
              <User className="mr-1 h-3 w-3" />
              {build.assigned_to}
            </Badge>
          )}
          {build.due_date && (
            <Badge
              variant={isOverdue ? "destructive" : "secondary"}
              className="text-xs"
            >
              <Calendar className="mr-1 h-3 w-3" />
              {format(new Date(build.due_date), "MMM d")}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
