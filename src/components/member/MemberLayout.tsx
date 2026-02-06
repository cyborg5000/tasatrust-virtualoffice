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
    <div className="flex min-h-screen w-full">
      <MemberSidebar />
      <div className="flex flex-1 flex-col">
        <MemberTopBar companyName={companyName} />
        <main className="flex-1 overflow-auto bg-muted/30 p-6">{children}</main>
      </div>
    </div>
  );
}
