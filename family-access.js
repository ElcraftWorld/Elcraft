import { supabase } from "./supabase-client.js";

export async function listAccessibleChildren() {
  const { data, error } = await supabase.rpc("list_accessible_children");
  if (error) throw error;
  return data || [];
}

export async function canAccessChild(childId) {
  if (!childId) return false;
  const children = await listAccessibleChildren();
  return children.some(child => child.id === childId);
}

export async function currentAccountRole() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return "guest";

  const { data: ownedFamily } = await supabase
    .from("family_accounts")
    .select("id")
    .eq("owner_id", session.user.id)
    .maybeSingle();

  if (ownedFamily) return "owner";

  const { data: member } = await supabase
    .from("family_members")
    .select("id")
    .eq("user_id", session.user.id)
    .eq("status", "active")
    .maybeSingle();

  return member ? "family" : "parent";
}
