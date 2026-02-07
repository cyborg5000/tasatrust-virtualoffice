import { ReactNode, useEffect, useState } from "react";
import { MemberSidebar } from "./MemberSidebar";
import { MemberTopBar } from "./MemberTopBar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface MemberLayoutProps {
  children: ReactNode;
}

export function MemberLayout({ children }: MemberLayoutProps) {
  const { user } = useAuth();
  const [companyName, setCompanyName] = useState<string>();

  useEffect(() => {
    async function fetchMemberData() {
      if (!user) return;

      const { data } = await supabase
        .from("members")
        .select("company_name")
        .eq("id", user.id)
        .maybeSingle();

      if (data) {
        setCompanyName(data.company_name);
      }
    }

    fetchMemberData();
  }, [user]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-muted/30">
      <MemberSidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <MemberTopBar companyName={companyName} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
