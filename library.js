import { supabase } from "./supabase-client.js";

const CHILD_ID_KEY = "elcraft_selected_child_id";

export function getSelectedChildId() {
  return localStorage.getItem(CHILD_ID_KEY);
}

export async function assignLibraryBooks(
  childId = getSelectedChildId()
) {
  if (!childId) {
    throw new Error("No child profile is selected.");
  }

  const { error } = await supabase.rpc(
    "elcraft_assign_library_books",
    {
      p_child_id: childId
    }
  );

  if (error) {
    throw error;
  }
}

export async function loadLibrary(
  childId = getSelectedChildId()
) {
  if (!childId) {
    return {
      data: [],
      error: new Error("No child profile is selected.")
    };
  }

  await assignLibraryBooks(childId);

  const { data, error } = await supabase
    .from("child_library_books")
    .select(`
      id,
      child_id,
      status,
      minutes_read,
      started_at,
      completed_at,
      last_read_at,
      book:library_books (
        id,
        book_key,
        title,
        author,
        description,
        cover_emoji,
        category,
        reading_level,
        minutes_goal,
        xp_reward,
        coin_reward,
        sort_order
      )
    `)
    .eq("child_id", childId)
    .order("created_at", { ascending: true });

  return {
    data: data || [],
    error
  };
}

export async function logReading({
  childId = getSelectedChildId(),
  bookId,
  minutes
}) {
  if (!childId) {
    throw new Error("No child profile is selected.");
  }

  const { data, error } = await supabase.rpc(
    "elcraft_log_reading",
    {
      p_child_id: childId,
      p_book_id: bookId,
      p_minutes: minutes
    }
  );

  if (error) {
    throw error;
  }

  return data;
}
