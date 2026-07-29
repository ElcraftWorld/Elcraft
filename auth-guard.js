import { supabase } from './supabase-client.js';

async function protectELCraft() {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Session check failed:', error);
      window.location.replace('auth.html');
      return;
    }

    if (!data.session) {
      window.location.replace('auth.html');
      return;
    }

    document.documentElement.classList.add('elcraft-authenticated');

  } catch (error) {
    console.error('Authentication error:', error);
    window.location.replace('auth.html');
  }
}

protectELCraft();
