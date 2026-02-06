import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { WebsiteBuildCard } from "@/components/admin/WebsiteBuildCard";
import { WebsiteBuildDetailDialog } from "@/components/admin/WebsiteBuildDetailDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Globe } from "lucide-react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { Database } from "@/integrations/supabase/types";

type WebsiteBuild = Database["public"]["Tables"]["website_builds"]["Row"];

interface WebsiteBuildWithMember extends WebsiteBuild {
  member?: {
    company_name: string;
    email: string;
  } | null;
}

const COLUMNS = [
  { id: "pending", title: "Pending Request", color: "bg-yellow-500" },
  { id: "in_progress", title: "In Progress", color: "bg-blue-500" },
  { id: "in_review", title: "In Review", color: "bg-purple-500" },
  { id: "completed", title: "Completed/Live", color: "bg-green-500" },
];

export default function AdminWebsiteBuilds() {
  const { toast } = useToast();
  const [builds, setBuilds] = useState<WebsiteBuildWithMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBuild, setSelectedBuild] = useState<WebsiteBuildWithMember | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const fetchBuilds = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("website_builds")
      .select(`*, members (company_name, email)`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching website builds:", error);
      toast({ title: "Error", description: "Failed to load website builds", variant: "destructive" });
    } else {
      const mapped = (data || []).map((build) => ({
        ...build,
        member: build.members,
      }));
      setBuilds(mapped);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchBuilds();
  }, []);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const buildId = active.id as string;
    const newStatus = over.id as string;

    // Check if dropping on a column
    if (!COLUMNS.find((col) => col.id === newStatus)) return;

    const build = builds.find((b) => b.id === buildId);
    if (!build || build.status === newStatus) return;

    // Optimistic update
    setBuilds((prev) =>
      prev.map((b) => (b.id === buildId ? { ...b, status: newStatus } : b))
    );

    const { error } = await supabase
      .from("website_builds")
      .update({ status: newStatus })
      .eq("id", buildId);

    if (error) {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
      fetchBuilds(); // Revert on error
    } else {
      toast({ title: "Updated", description: `Build moved to ${COLUMNS.find((c) => c.id === newStatus)?.title}` });
    }
  };

  const handleSave = async (id: string, updates: Partial<WebsiteBuild>) => {
    const { error } = await supabase
      .from("website_builds")
      .update(updates)
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: "Failed to save changes", variant: "destructive" });
      throw error;
    }

    setBuilds((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
    );
    toast({ title: "Saved", description: "Build updated successfully" });
  };

  const openDetail = (build: WebsiteBuildWithMember) => {
    setSelectedBuild(build);
    setIsDetailOpen(true);
  };

  const getBuildsByStatus = (status: string) =>
    builds.filter((b) => (b.status || "pending") === status);

  const activeBuild = activeId ? builds.find((b) => b.id === activeId) : null;

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Website Build Tracker</h1>
            <p className="text-muted-foreground">
              Manage website build requests for Professional tier members
            </p>
          </div>
          <Badge variant="outline" className="text-sm">
            <Globe className="mr-1 h-3 w-3" />
            {builds.length} total builds
          </Badge>
        </div>

        {/* Kanban Board */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid gap-4 md:grid-cols-4">
            {COLUMNS.map((column) => {
              const columnBuilds = getBuildsByStatus(column.id);
              return (
                <Card key={column.id} className="flex flex-col">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${column.color}`} />
                        {column.title}
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {columnBuilds.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent
                    id={column.id}
                    className="flex-1 space-y-3 min-h-[200px] bg-muted/20 rounded-b-lg p-3"
                  >
                    <SortableContext
                      items={columnBuilds.map((b) => b.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {columnBuilds.length === 0 ? (
                        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                          No builds
                        </div>
                      ) : (
                        columnBuilds.map((build) => (
                          <WebsiteBuildCard
                            key={build.id}
                            build={build}
                            onClick={() => openDetail(build)}
                          />
                        ))
                      )}
                    </SortableContext>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <DragOverlay>
            {activeBuild ? (
              <Card className="shadow-lg opacity-90">
                <CardContent className="p-3">
                  <p className="text-sm font-medium">
                    {activeBuild.member?.company_name || "Unknown"}
                  </p>
                  {activeBuild.domain && (
                    <p className="text-xs text-muted-foreground">{activeBuild.domain}</p>
                  )}
                </CardContent>
              </Card>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      <WebsiteBuildDetailDialog
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        build={selectedBuild}
        onSave={handleSave}
      />
    </AdminLayout>
  );
}
