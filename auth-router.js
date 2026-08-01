/*
  ELCraft authentication router
  Rename this file to: auth-router.js

  Add this to protected parent pages:

  <script type="module">
    import { routeAuthenticatedParent } from "./auth-router.js";
    routeAuthenticatedParent();
  </script>
*/

import {
  createClient
} from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

import {
  SUPABASE_URL,
  SUPABASE_ANON_KEY
} from "./supabase-settings.js";

export const supabase =
  createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    }
  );

const ROUTES = {
  login:
    "index.html",

  onboarding:
    "accept-invite.html",

  ownerDashboard:
    "parent-dashboard.html",

  invitedParentDashboard:
    "parent-dashboard.html"
};

function samePage(fileName) {
  return window.location.pathname
    .toLowerCase()
    .endsWith(
      `/${fileName.toLowerCase()}`
    );
}

export async function getCurrentUser() {
  const {
    data,
    error
  } =
    await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  return data.user;
}

export async function getParentProfile(
  userId
) {
  const {
    data,
    error
  } =
    await supabase
      .from(
        "parent_profiles"
      )
      .select(
        `
          id,
          user_id,
          display_name,
          relationship,
          onboarding_complete,
          is_family_owner,
          created_at,
          updated_at
        `
      )
      .eq(
        "user_id",
        userId
      )
      .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function getFamilyMembership(
  userId
) {
  const {
    data,
    error
  } =
    await supabase
      .from(
        "family_memberships"
      )
      .select(
        `
          id,
          family_id,
          user_id,
          role,
          status,
          joined_at
        `
      )
      .eq(
        "user_id",
        userId
      )
      .eq(
        "status",
        "active"
      )
      .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function routeAuthenticatedParent({
  redirect = true
} = {}) {
  try {
    const user =
      await getCurrentUser();

    if (!user) {
      if (
        redirect &&
        !samePage(
          ROUTES.login
        )
      ) {
        window.location.replace(
          ROUTES.login
        );
      }

      return {
        user: null,
        profile: null,
        membership: null,
        destination:
          ROUTES.login
      };
    }

    const [
      profile,
      membership
    ] =
      await Promise.all([
        getParentProfile(
          user.id
        ),

        getFamilyMembership(
          user.id
        )
      ]);

    const passwordIsSet =
      user.user_metadata
        ?.password_set ===
      true;

    const needsOnboarding =
      !passwordIsSet ||
      !profile ||
      profile.onboarding_complete !==
        true ||
      !membership;

    if (
      needsOnboarding
    ) {
      if (
        redirect &&
        !samePage(
          ROUTES.onboarding
        )
      ) {
        window.location.replace(
          ROUTES.onboarding
        );
      }

      return {
        user,
        profile,
        membership,
        destination:
          ROUTES.onboarding
      };
    }

    const destination =
      profile.is_family_owner
        ? ROUTES.ownerDashboard
        : ROUTES.invitedParentDashboard;

    if (
      redirect &&
      (
        samePage(
          ROUTES.login
        ) ||
        samePage(
          ROUTES.onboarding
        )
      )
    ) {
      window.location.replace(
        destination
      );
    }

    return {
      user,
      profile,
      membership,
      destination
    };

  } catch (error) {
    console.error(
      "ELCraft auth routing error:",
      error
    );

    if (
      redirect &&
      !samePage(
        ROUTES.login
      )
    ) {
      const url =
        new URL(
          ROUTES.login,
          window.location.href
        );

      url.searchParams.set(
        "auth_error",
        "routing_failed"
      );

      window.location.replace(
        url.toString()
      );
    }

    return {
      user: null,
      profile: null,
      membership: null,
      destination:
        ROUTES.login,
      error
    };
  }
}

export async function signOutParent() {
  const {
    error
  } =
    await supabase.auth.signOut();

  if (error) {
    throw error;
  }

  window.location.replace(
    ROUTES.login
  );
}
