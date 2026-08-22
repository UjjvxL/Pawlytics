import { supabase } from '../supabaseClient';

export const authService = {
  async me() {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) return null;
    
    // Fetch profile to get role
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', session.user.id)
      .single();
      
    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return null;
    }
    
    return {
      id: session.user.id,
      email: session.user.email,
      role: profile.role,
      ...session.user.user_metadata
    };
  },

  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async register(email, password, role = 'user') {
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password 
    });
    if (error) throw error;
    
    // The users table will need to have the role inserted, but auth users trigger might handle it, or we insert it manually.
    // Assuming we can just insert into public.users if RLS allows (wait, only if the user is authenticated, but users table RLS:
    // `Users can read their own profile` but no insert policy for users table?)
    // Ah, Phase 1 users table has no INSERT policy. It only has:
    // CREATE POLICY "Users can read their own profile" ON public.users FOR SELECT USING (auth.uid() = id);
    // CREATE POLICY "Admins can read all profiles" ON public.users FOR SELECT USING (is_admin());
    // Let me check this later.
    
    return data;
  },

  async logout(redirectTo) {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    if (redirectTo) {
      window.location.href = redirectTo;
    }
  },

  async verifyOtp({ email, otpCode }) {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otpCode,
      type: 'signup'
    });
    if (error) throw error;
    return data;
  },

  async resendOtp(email) {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });
    if (error) throw error;
  },
  
  async resetPassword(emailOrParams) {
    // Supports both:
    // 1. resetPassword("email@example.com") — ForgotPassword flow (send reset link)
    // 2. resetPassword({ resetToken, newPassword }) — ResetPassword flow (set new password)
    if (typeof emailOrParams === 'object' && emailOrParams.newPassword) {
      const { error } = await supabase.auth.updateUser({ password: emailOrParams.newPassword });
      if (error) throw error;
      return;
    }
    const email = typeof emailOrParams === 'string' ? emailOrParams : emailOrParams.email;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  },
  
  async updatePassword(password) {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  },

  onAuthStateChange(callback) {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
    return data.subscription;
  }
};
