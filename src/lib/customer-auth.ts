import { supabase } from "@/integrations/supabase/client";

export type CustomerAuthResult = {
  error: string | null;
};

export async function signInCustomer(email: string, password: string): Promise<CustomerAuthResult> {
  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  return { error: error?.message ?? null };
}

export async function signUpCustomer(email: string, password: string): Promise<CustomerAuthResult> {
  const { error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
  });

  return { error: error?.message ?? null };
}

export async function sendPasswordReset(email: string): Promise<CustomerAuthResult> {
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: `${window.location.origin}/account`,
  });

  return { error: error?.message ?? null };
}

export async function signOutCustomer(): Promise<CustomerAuthResult> {
  const { error } = await supabase.auth.signOut();
  return { error: error?.message ?? null };
}

export async function getCustomerSession() {
  const { data, error } = await supabase.auth.getSession();

  return {
    session: data.session,
    error: error?.message ?? null,
  };
}
