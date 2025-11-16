import { supabase } from "@/lib/supabase";

export interface ProviderDriver {
  id: string;
  provider_id: string;
  name: string;
  phone?: string;
  id_number?: string;
  license_number?: string;
  license_expiry?: string;
  vehicle_type?: string;
  vehicle_plate?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Get all drivers for a provider
 */
export async function getProviderDrivers(providerId: string): Promise<ProviderDriver[]> {
  const { data, error } = await supabase
    .from("provider_drivers")
    .select("*")
    .eq("provider_id", providerId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []) as ProviderDriver[];
}

/**
 * Create a new provider driver
 */
export async function createProviderDriver(
  providerId: string,
  driverData: Omit<ProviderDriver, "id" | "provider_id" | "created_at" | "updated_at">
): Promise<ProviderDriver> {
  const { data, error } = await supabase
    .from("provider_drivers")
    .insert({
      provider_id: providerId,
      ...driverData,
    })
    .select()
    .single();

  if (error) throw error;
  return data as ProviderDriver;
}

/**
 * Update a provider driver
 */
export async function updateProviderDriver(
  driverId: string,
  updates: Partial<ProviderDriver>
): Promise<ProviderDriver> {
  const { data, error } = await supabase
    .from("provider_drivers")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", driverId)
    .select()
    .single();

  if (error) throw error;
  return data as ProviderDriver;
}

/**
 * Delete a provider driver
 */
export async function deleteProviderDriver(driverId: string): Promise<void> {
  const { error } = await supabase.from("provider_drivers").delete().eq("id", driverId);
  if (error) throw error;
}

