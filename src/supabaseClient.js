import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const serviceRole = import.meta.env.VITE_SUPABASE_SERVICE_ROLE;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const supabaseAdmin = createClient(
  supabaseUrl,
  serviceRole
);

export async function deleteUser(userId) {
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

  if (error) throw error;
}

export async function createUser(email, password) {
    const {data, error} = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error) throw error;
    return data.user.id;
};

export async function changePassword(uuid, newPassword) {
  const {error} = await supabaseAdmin.auth.admin.updateUserById(uuid, {
    password: newPassword,
  });
  if (error) throw error;
};