import { supabase } from "@/lib/supabase";

export interface Profile {
  id: string;
  role: string;
  full_name?: string;
  phone?: string;
  email?: string;
  id_number?: string;
  date_of_birth?: string;
  nationality?: string;
  address?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Get current user's profile
 */
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // Not found
    throw error;
  }
  return data as Profile;
}

/**
 * Update user profile
 */
export async function updateProfile(
  userId: string,
  updates: Partial<Profile>
): Promise<Profile> {
  const { data, error } = await supabase
    .from("profiles")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;
  return data as Profile;
}

/**
 * Get all profiles (Admin only)
 */
export async function getAllProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []) as Profile[];
}

