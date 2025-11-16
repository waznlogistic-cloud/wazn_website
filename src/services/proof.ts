import { supabase } from "@/lib/supabase";

export interface ProofOfDelivery {
  id: string;
  order_id: string;
  driver_id: string;
  receiver_name?: string;
  receiver_id_number?: string;
  delivery_code?: string;
  delivery_date?: string;
  proof_image_url?: string;
  signature_url?: string;
  created_at?: string;
}

/**
 * Create proof of delivery
 */
export async function createProofOfDelivery(
  proofData: Omit<ProofOfDelivery, "id" | "created_at">
): Promise<ProofOfDelivery> {
  const { data, error } = await supabase
    .from("proof_of_delivery")
    .insert(proofData)
    .select()
    .single();

  if (error) throw error;
  return data as ProofOfDelivery;
}

/**
 * Get proof of delivery for an order
 */
export async function getProofOfDelivery(orderId: string): Promise<ProofOfDelivery | null> {
  const { data, error } = await supabase
    .from("proof_of_delivery")
    .select("*")
    .eq("order_id", orderId)
    .maybeSingle();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data as ProofOfDelivery | null;
}

/**
 * Get all proofs for a driver
 */
export async function getDriverProofs(driverId: string): Promise<ProofOfDelivery[]> {
  const { data, error } = await supabase
    .from("proof_of_delivery")
    .select("*")
    .eq("driver_id", driverId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []) as ProofOfDelivery[];
}

