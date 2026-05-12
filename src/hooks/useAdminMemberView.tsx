/* eslint-disable react-refresh/only-export-components */
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { supabase } from "@/integrations/supabase/client";

export interface AdminViewMember {
  id: string;
  company_name: string;
  contact_name: string | null;
  email: string;
}

interface AdminMemberViewContextValue {
  userId: string | undefined;
  userEmail: string | undefined;
  effectiveMemberId: string | undefined;
  effectiveMemberEmail: string | undefined;
  isAdmin: boolean;
  loading: boolean;
  selectedMember: AdminViewMember | null;
  selectedMemberId: string | null;
  isViewingAsMember: boolean;
  viewAsMember: (member: AdminViewMember, options?: { returnPath?: string; memberPath?: string }) => void;
  returnToAdminView: () => void;
  clearMemberView: () => void;
}

const SELECTED_MEMBER_STORAGE_KEY = "tasatrust.adminViewAsMemberId";
const RETURN_PATH_STORAGE_KEY = "tasatrust.adminViewAsReturnPath";

const AdminMemberViewContext = createContext<AdminMemberViewContextValue | undefined>(undefined);

function getStoredValue(key: string) {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(key);
}

function setStoredValue(key: string, value: string | null) {
  if (typeof window === "undefined") return;

  if (value) {
    window.localStorage.setItem(key, value);
  } else {
    window.localStorage.removeItem(key);
  }
}

export function AdminMemberViewProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { user, isAdmin, loading: adminLoading } = useAdminAuth();
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(() =>
    getStoredValue(SELECTED_MEMBER_STORAGE_KEY),
  );
  const [returnPath, setReturnPath] = useState<string | null>(() => getStoredValue(RETURN_PATH_STORAGE_KEY));
  const [selectedMember, setSelectedMember] = useState<AdminViewMember | null>(null);
  const [memberLoading, setMemberLoading] = useState(false);

  const clearMemberView = useCallback(() => {
    setSelectedMemberId(null);
    setSelectedMember(null);
    setReturnPath(null);
    setStoredValue(SELECTED_MEMBER_STORAGE_KEY, null);
    setStoredValue(RETURN_PATH_STORAGE_KEY, null);
  }, []);

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      clearMemberView();
    }
  }, [adminLoading, clearMemberView, isAdmin]);

  useEffect(() => {
    if (!isAdmin || !selectedMemberId) {
      setSelectedMember(null);
      setMemberLoading(false);
      return;
    }

    let cancelled = false;

    async function loadSelectedMember() {
      setMemberLoading(true);

      const { data, error } = await supabase
        .from("members")
        .select("id, company_name, contact_name, email")
        .eq("id", selectedMemberId)
        .maybeSingle();

      if (cancelled) return;

      if (error || !data) {
        console.error("Error loading selected member for admin view:", error);
        clearMemberView();
      } else {
        setSelectedMember(data);
      }

      setMemberLoading(false);
    }

    void loadSelectedMember();

    return () => {
      cancelled = true;
    };
  }, [clearMemberView, isAdmin, selectedMemberId]);

  const viewAsMember = useCallback(
    (member: AdminViewMember, options?: { returnPath?: string; memberPath?: string }) => {
      const safeReturnPath = options?.returnPath?.startsWith("/admin")
        ? options.returnPath
        : returnPath?.startsWith("/admin")
          ? returnPath
          : "/admin";

      setSelectedMemberId(member.id);
      setSelectedMember(member);
      setReturnPath(safeReturnPath);
      setStoredValue(SELECTED_MEMBER_STORAGE_KEY, member.id);
      setStoredValue(RETURN_PATH_STORAGE_KEY, safeReturnPath);
      navigate(options?.memberPath || "/member");
    },
    [navigate, returnPath],
  );

  const returnToAdminView = useCallback(() => {
    const destination = returnPath?.startsWith("/admin") ? returnPath : "/admin";
    clearMemberView();
    navigate(destination);
  }, [clearMemberView, navigate, returnPath]);

  const value = useMemo<AdminMemberViewContextValue>(() => {
    const isViewingAsMember = Boolean(isAdmin && selectedMemberId);

    return {
      userId: user?.id,
      userEmail: user?.email,
      effectiveMemberId: isViewingAsMember ? selectedMemberId || undefined : user?.id,
      effectiveMemberEmail: isViewingAsMember ? selectedMember?.email : user?.email,
      isAdmin,
      loading: adminLoading || memberLoading,
      selectedMember,
      selectedMemberId,
      isViewingAsMember,
      viewAsMember,
      returnToAdminView,
      clearMemberView,
    };
  }, [
    adminLoading,
    clearMemberView,
    isAdmin,
    memberLoading,
    returnToAdminView,
    selectedMember,
    selectedMemberId,
    user?.email,
    user?.id,
    viewAsMember,
  ]);

  return <AdminMemberViewContext.Provider value={value}>{children}</AdminMemberViewContext.Provider>;
}

export function useAdminMemberView() {
  const context = useContext(AdminMemberViewContext);

  if (!context) {
    throw new Error("useAdminMemberView must be used within AdminMemberViewProvider");
  }

  return context;
}
