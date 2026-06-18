"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  type EmployerRole, type RoleDraft, type RoleStage, newRoleId,
} from "@/lib/employer-roles";
import {
  type CompanyProfile, EMPTY_PROFILE, isWorkEmail,
} from "@/lib/employer-company";
import type { ConnectionStatus } from "@/lib/employer-candidates";

const ROLES_KEY = "tenun-employer-roles";
const ACTIVE_KEY = "tenun-employer-active-role";
const PROFILE_KEY = "tenun-employer-profile";

// Simulated candidate side: a request sits "pending", then auto-resolves.
const DECLINE_IDS = new Set(["kavin-raj"]);
const RESOLVE_MS = 2600;

interface WorkspaceValue {
  roles: EmployerRole[];
  activeRoleId: string | null;
  activeRole: EmployerRole | null;
  addRole: (draft: RoleDraft) => EmployerRole;
  updateRole: (id: string, patch: Partial<EmployerRole>) => void;
  deleteRole: (id: string) => void;
  setStage: (id: string, stage: RoleStage) => void;
  setActiveRoleId: (id: string | null) => void;
  // Connections (the request-to-connect handshake), shared across panes.
  connections: Record<string, ConnectionStatus>;
  requestConnect: (candidateId: string) => void;
  // Company profile + verification.
  profile: CompanyProfile;
  saveProfile: (patch: Partial<CompanyProfile>) => void;
  loaded: boolean;
}

const WorkspaceContext = createContext<WorkspaceValue | null>(null);

export function EmployerWorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [roles, setRoles] = useState<EmployerRole[]>([]);
  const [activeRoleId, setActiveRoleId] = useState<string | null>(null);
  const [connections, setConnections] = useState<Record<string, ConnectionStatus>>({});
  const [profile, setProfile] = useState<CompanyProfile>(EMPTY_PROFILE);
  const [loaded, setLoaded] = useState(false);

  // Hydrate from localStorage once. (Connections stay in-memory: a "pending"
  // request needs a live timer to resolve, so persisting it would strand it.)
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(ROLES_KEY);
      const parsed: EmployerRole[] = raw ? JSON.parse(raw) : [];
      setRoles(Array.isArray(parsed) ? parsed : []);
      const savedActive = window.localStorage.getItem(ACTIVE_KEY);
      if (savedActive) setActiveRoleId(savedActive);
      const savedProfile = window.localStorage.getItem(PROFILE_KEY);
      if (savedProfile) setProfile({ ...EMPTY_PROFILE, ...JSON.parse(savedProfile) });
    } catch {
      /* corrupt storage — start clean */
    }
    setLoaded(true);
  }, []);

  // Persist roles whenever they change (after initial load).
  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(ROLES_KEY, JSON.stringify(roles));
    } catch {
      /* ignore quota errors */
    }
  }, [roles, loaded]);

  useEffect(() => {
    if (!loaded) return;
    try {
      if (activeRoleId) window.localStorage.setItem(ACTIVE_KEY, activeRoleId);
      else window.localStorage.removeItem(ACTIVE_KEY);
    } catch {
      /* ignore */
    }
  }, [activeRoleId, loaded]);

  const addRole = useCallback((draft: RoleDraft): EmployerRole => {
    const role: EmployerRole = {
      ...draft,
      id: newRoleId(),
      stage: draft.stage ?? "Posted",
      createdAt: new Date().toISOString(),
    };
    setRoles((prev) => [role, ...prev]);
    setActiveRoleId(role.id); // a freshly posted role becomes active
    return role;
  }, []);

  const updateRole = useCallback((id: string, patch: Partial<EmployerRole>) => {
    setRoles((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }, []);

  const deleteRole = useCallback((id: string) => {
    setRoles((prev) => prev.filter((r) => r.id !== id));
    setActiveRoleId((cur) => (cur === id ? null : cur));
  }, []);

  const setStage = useCallback((id: string, stage: RoleStage) => {
    setRoles((prev) => prev.map((r) => (r.id === id ? { ...r, stage } : r)));
  }, []);

  // Persist profile.
  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch {
      /* ignore */
    }
  }, [profile, loaded]);

  const requestConnect = useCallback((candidateId: string) => {
    setConnections((prev) => {
      if (prev[candidateId] && prev[candidateId] !== "none") return prev;
      return { ...prev, [candidateId]: "pending" };
    });
    window.setTimeout(() => {
      setConnections((prev) => ({
        ...prev,
        [candidateId]: DECLINE_IDS.has(candidateId) ? "declined" : "accepted",
      }));
    }, RESOLVE_MS);
  }, []);

  const saveProfile = useCallback((patch: Partial<CompanyProfile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...patch };
      // Instant domain verification when the work email is a company domain.
      next.domainVerified = isWorkEmail(next.workEmail);
      // Kick off the async SSM check when a number is provided and not yet verified.
      if (next.ssmNumber.trim() && next.ssmStatus !== "verified") {
        next.ssmStatus = "pending";
        window.setTimeout(() => {
          setProfile((p) => (p.ssmNumber.trim() ? { ...p, ssmStatus: "verified" } : p));
        }, 2800);
      } else if (!next.ssmNumber.trim()) {
        next.ssmStatus = "unverified";
      }
      return next;
    });
  }, []);

  const value = useMemo<WorkspaceValue>(() => {
    const activeRole = roles.find((r) => r.id === activeRoleId) ?? null;
    return {
      roles, activeRoleId, activeRole,
      addRole, updateRole, deleteRole, setStage, setActiveRoleId,
      connections, requestConnect,
      profile, saveProfile,
      loaded,
    };
  }, [roles, activeRoleId, addRole, updateRole, deleteRole, setStage, connections, requestConnect, profile, saveProfile, loaded]);

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useEmployerWorkspace(): WorkspaceValue {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useEmployerWorkspace must be used within EmployerWorkspaceProvider");
  return ctx;
}
