/*
  ELCraft authentication router
  File name: auth-router.js

  This router uses the existing:
    - supabase-client.js
    - family_members table
    - parent-dashboard.html
    - accept-invite.html
*/

import {
  supabase
} from "./supabase-client.js";

export const AUTH_ROUTES = {
  login: "auth.html",
  inviteSetup: "accept-invite.html",
  dashboard: "parent-dashboard.html",
  resetPassword: "reset-password.html"
};

export async function getSignedInUser() {
  const {
    data,
    error
  } =
    await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  return data.user || null;
}

export async function getActiveMemberships(
  userId
) {
  const {
    data,
    error
  } =
    await supabase
      .from("family_members")
      .select(
        "id, family_id, user_id, member_role, relationship, status, display_name, email"
      )
      .eq("user_id", userId)
      .eq("status", "active");

  if (error) {
    throw error;
  }

  return data || [];
}

export function chooseMembership(
  memberships
) {
  return (
    memberships.find(
      membership =>
        membership.member_role === "owner"
    ) ||
    memberships[0] ||
    null
  );
}

export function passwordSetupRequired(
  user,
  membership
) {
  if (!user || !membership) {
    return false;
  }

  /*
    Existing family owners may predate the password_set metadata.
    Invited adults must have the marker before entering ELCraft.
  */
  if (
    membership.member_role ===
    "owner"
  ) {
    return false;
  }

  return (
    user.user_metadata
      ?.password_set !==
    true
  );
}

export async function resolveAuthenticatedRoute() {
  const user =
    await getSignedInUser();

  if (!user) {
    return {
      user: null,
      memberships: [],
      membership: null,
      destination:
        AUTH_ROUTES.login
    };
  }

  const memberships =
    await getActiveMemberships(
      user.id
    );

  const membership =
    chooseMembership(
      memberships
    );

  if (!membership) {
    return {
      user,
      memberships,
      membership: null,
      destination:
        AUTH_ROUTES.dashboard
    };
  }

  if (
    passwordSetupRequired(
      user,
      membership
    )
  ) {
    return {
      user,
      memberships,
      membership,
      destination:
        AUTH_ROUTES.inviteSetup
    };
  }

  return {
    user,
    memberships,
    membership,
    destination:
      AUTH_ROUTES.dashboard
  };
}

export async function routeSignedInUser({
  replace = true
} = {}) {
  const result =
    await resolveAuthenticatedRoute();

  const method =
    replace
      ? "replace"
      : "assign";

  window.location[method](
    result.destination
  );

  return result;
}

export async function requireParentAccess() {
  const result =
    await resolveAuthenticatedRoute();

  const page =
    window.location.pathname
      .split("/")
      .pop()
      .toLowerCase();

  if (!result.user) {
    window.location.replace(
      AUTH_ROUTES.login
    );

    return null;
  }

  if (
    result.destination ===
      AUTH_ROUTES.inviteSetup &&
    page !==
      AUTH_ROUTES.inviteSetup
  ) {
    window.location.replace(
      `${AUTH_ROUTES.inviteSetup}?required=1`
    );

    return null;
  }

  return result;
}

export async function signOutParent() {
  const {
    error
  } =
    await supabase.auth.signOut();

  if (error) {
    throw error;
  }

  [
    "elcraft_selected_child_id",
    "elcraft_child_name",
    "elcraft_child_avatar"
  ].forEach(key => {
    localStorage.removeItem(key);
  });

  window.location.replace(
    AUTH_ROUTES.login
  );
}
