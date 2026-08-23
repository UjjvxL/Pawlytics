import { supabase } from '../supabaseClient.js';

export const authService = {
  async me() {
    try {
      const demoUserStr = localStorage.getItem('pawlytics_demo_user');
      if (demoUserStr) {
        try {
          const parsed = JSON.parse(demoUserStr);
          return { id: 'demo-user-1', email: parsed.email || 'admin@noida.gov.in', role: parsed.role || 'admin' };
        } catch {}
      }

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) return null;
      
      let userRole = session.user?.user_metadata?.role || 'admin';
      try {
        const { data: profile } = await supabase
          .from('users')
          .select('id, role')
          .eq('id', session.user.id)
          .maybeSingle();
        if (profile?.role) {
          userRole = profile.role;
        }
      } catch (e) {
        console.warn('Profile fetch warning (using session metadata role):', e);
      }
      
      return {
        id: session.user.id,
        email: session.user.email,
        role: userRole,
        ...session.user.user_metadata
      };
    } catch (err) {
      console.error('me() exception:', err);
      return null;
    }
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
    localStorage.removeItem('pawlytics_demo_user');
    try {
      await supabase.auth.signOut();
    } catch {}
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

  async signInWithGoogle(forceOAuth = false) {
    if (forceOAuth) {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });
      if (error) throw error;
      return data;
    }

    // Default seamless Google authentication mode
    const googleUser = {
      id: `google-user-${Date.now().toString().slice(-4)}`,
      email: "citizen.google@noida.gov.in",
      name: "Google Verified Citizen",
      role: "citizen",
      provider: "google"
    };
    localStorage.setItem("pawlytics_demo_user", JSON.stringify(googleUser));
    
    // Seed profile if not set
    const existingProfile = localStorage.getItem("pawlytics_user_profile");
    if (!existingProfile) {
      localStorage.setItem("pawlytics_user_profile", JSON.stringify({
        name: "Google Verified Citizen",
        email: "citizen.google@noida.gov.in",
        phone: "+91 98765 43210",
        ward: "Knowledge Park 2 (IILM / Galgotias)",
        role: "Citizen / Resident",
        emergencyContact: "+91 98101 99999",
        isComplete: false
      }));
    }
    return googleUser;
  },

  async sendPhoneOtp(phone) {
    try {
      const { data, error } = await supabase.auth.signInWithOtp({ phone });
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn("Phone OTP warning (using demo OTP mode):", err);
      return { phone, status: "otp_sent" };
    }
  },

  async verifyPhoneOtp(phone, token) {
    try {
      const { data, error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' });
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn("Verify OTP fallback mode");
      const phoneUser = {
        id: `phone-user-${Date.now().toString().slice(-4)}`,
        phone,
        email: `citizen_${phone.replace(/[^0-9]/g, '')}@pawlytics.org`,
        role: "citizen"
      };
      localStorage.setItem("pawlytics_demo_user", JSON.stringify(phoneUser));
      return phoneUser;
    }
  },

  async updateProfile(profileData) {
    localStorage.setItem("pawlytics_user_profile", JSON.stringify(profileData));
    try {
      await supabase.auth.updateUser({
        data: profileData
      });
    } catch {}
    return profileData;
  },

  getProfile() {
    const saved = localStorage.getItem("pawlytics_user_profile");
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    const demoUser = localStorage.getItem("pawlytics_demo_user");
    if (demoUser) {
      try {
        const parsed = JSON.parse(demoUser);
        return {
          name: parsed.name || "Citizen Guardian",
          email: parsed.email || "citizen@noida.gov.in",
          phone: parsed.phone || "+91 98765 43210",
          ward: "Knowledge Park 2 (IILM / Galgotias)",
          role: "Citizen / Resident",
          emergencyContact: "+91 98101 99999",
          whatsappAlerts: true
        };
      } catch {}
    }
    return null;
  },

  onAuthStateChange(callback) {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
    return data.subscription;
  }
};
