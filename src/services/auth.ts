import { supabase } from "@/lib/supabase";
import type { RoleKey } from "@/contexts/authContext";

export interface LoginCredentials {
  phone?: string;
  email?: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  phone?: string;
  role: RoleKey;
  metadata?: {
    full_name?: string;
    id_number?: string;
    date_of_birth?: string;
    nationality?: string;
    address?: string;
    company_name?: string;
    commercial_registration?: string;
    tax_number?: string;
    activity_type?: string;
  };
}

/**
 * Login with email or phone
 */
export async function login(credentials: LoginCredentials) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: credentials.email || credentials.phone || "",
    password: credentials.password,
  });

  if (error) throw error;
  return data;
}

/**
 * Register a new user
 */
export async function register(data: RegisterData) {
  console.log("Registering user with email:", data.email);
  
  const { data: authData, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    phone: data.phone,
    options: {
      data: {
        role: data.role,
        full_name: data.metadata?.full_name,
        ...data.metadata,
      },
      emailRedirectTo: `${window.location.origin}/login`,
    },
  });

  console.log("Supabase signup response:", { authData, error });

  if (error) {
    console.error("Supabase signup error:", error);
    throw error;
  }

  // Create profile in profiles table (only if user was created)
  if (authData.user) {
    try {
      const profileData: any = {
        id: authData.user.id,
        role: data.role,
        email: data.email,
        phone: data.phone,
        full_name: data.metadata?.full_name,
        id_number: data.metadata?.id_number,
        date_of_birth: data.metadata?.date_of_birth,
        nationality: data.metadata?.nationality,
        address: data.metadata?.address,
      };

      // Add employer-specific fields if role is employer
      if (data.role === "employer") {
        profileData.commercial_registration = data.metadata?.commercial_registration;
        profileData.tax_number = data.metadata?.tax_number;
      }

      const { error: profileError } = await supabase.from("profiles").insert(profileData);

      if (profileError) {
        console.error("Error creating profile:", profileError);
        // If profile already exists, try to update it
        if (profileError.code !== "23505") {
          throw profileError;
        }
      }

      // If provider, create provider record
      if (data.role === "provider" && data.metadata?.company_name) {
        const { error: providerError } = await supabase.from("providers").insert({
          id: authData.user.id,
          company_name: data.metadata.company_name,
          commercial_registration: data.metadata.commercial_registration,
          tax_number: data.metadata.tax_number,
          activity_type: data.metadata.activity_type,
        }).select().single();

        if (providerError) {
          console.error("Error creating provider:", providerError);
          // If provider already exists, try to update it
          if (providerError.code !== "23505") {
            throw providerError;
          }
        }
      }
    } catch (dbError: any) {
      console.error("Database error during registration:", dbError);
      // Don't throw - user is created, profile can be fixed later
    }
  }

  return authData;
}

/**
 * Logout current user
 */
export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Get current session
 */
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (error) throw error;
}

/**
 * Update user password
 */
export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  if (error) throw error;
}

