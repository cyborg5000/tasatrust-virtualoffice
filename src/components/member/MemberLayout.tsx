import { ReactNode, useEffect, useState } from "react";
import { MemberSidebar } from "./MemberSidebar";
import { MemberTopBar } from "./MemberTopBar";
import { useAdminMemberView } from "@/hooks/useAdminMemberView";
import { supabase } from "@/integrations/supabase/client";

interface MemberLayoutProps {
  children: ReactNode;
}

export function MemberLayout({ children }: MemberLayoutProps) {
  const { effectiveMemberId, effectiveMemberEmail } = useAdminMemberView();
  const [companyName, setCompanyName] = useState<string>();

  useEffect(() => {
    async function fetchMemberData() {
      setCompanyName(undefined);

      if (!effectiveMemberId) return;

      const { data } = await supabase
        .from("members")
        .select("company_name")
        .eq("id", effectiveMemberId)
        .maybeSingle();

      if (data) {
        setCompanyName(data.company_name);
      }
    }

    void fetchMemberData();
  }, [effectiveMemberId]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-muted/30">
      <MemberSidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <MemberTopBar companyName={companyName} memberEmail={effectiveMemberEmail} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
