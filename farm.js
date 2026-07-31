import { supabase } from "./supabase-client.js";

const CHILD_ID_KEY = "elcraft_selected_child_id";

export function getSelectedChildId() {
  return localStorage.getItem(CHILD_ID_KEY);
}

export async function prepareFarm(
  childId = getSelectedChildId()
) {
  if (!childId) {
    throw new Error("No child profile is selected.");
  }

  const { error } = await supabase.rpc(
    "elcraft_prepare_farm",
    {
      p_child_id: childId
    }
  );

  if (error) {
    throw error;
  }
}

export async function loadFarm(
  childId = getSelectedChildId()
) {
  if (!childId) {
    return {
      crops: [],
      plots: [],
      error: new Error("No child profile is selected.")
    };
  }

  await prepareFarm(childId);

  const { error: refreshError } = await supabase.rpc(
    "elcraft_refresh_farm",
    {
      p_child_id: childId
    }
  );

  if (refreshError) {
    return {
      crops: [],
      plots: [],
      error: refreshError
    };
  }

  const [cropsResult, plotsResult] = await Promise.all([
    supabase
      .from("farm_crops")
      .select("*")
      .eq("active", true)
      .order("sort_order", { ascending: true }),

    supabase
      .from("child_farm_plots")
      .select(`
        id,
        child_id,
        plot_number,
        status,
        planted_at,
        ready_at,
        watered_at,
        harvested_at,
        crop:farm_crops (
          id,
          crop_key,
          crop_name,
          crop_icon,
          harvest_item_key,
          harvest_item_name,
          harvest_item_icon,
          growth_minutes,
          harvest_quantity,
          xp_reward,
          coin_reward
        )
      `)
      .eq("child_id", childId)
      .order("plot_number", { ascending: true })
  ]);

  return {
    crops: cropsResult.data || [],
    plots: plotsResult.data || [],
    error: cropsResult.error || plotsResult.error
  };
}

export async function plantCrop({
  childId = getSelectedChildId(),
  plotId,
  cropId
}) {
  const { data, error } = await supabase.rpc(
    "elcraft_plant_crop",
    {
      p_child_id: childId,
      p_plot_id: plotId,
      p_crop_id: cropId
    }
  );

  if (error) {
    throw error;
  }

  return data;
}

export async function waterCrop({
  childId = getSelectedChildId(),
  plotId
}) {
  const { data, error } = await supabase.rpc(
    "elcraft_water_crop",
    {
      p_child_id: childId,
      p_plot_id: plotId
    }
  );

  if (error) {
    throw error;
  }

  return data;
}

export async function harvestCrop({
  childId = getSelectedChildId(),
  plotId
}) {
  const { data, error } = await supabase.rpc(
    "elcraft_harvest_crop",
    {
      p_child_id: childId,
      p_plot_id: plotId
    }
  );

  if (error) {
    throw error;
  }

  return Array.isArray(data)
    ? data[0]
    : data;
}
