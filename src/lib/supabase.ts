import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Auth helper functions
export const signInWithOAuth = async (provider: 'google' | 'microsoft') => {
  try {
    console.log(`Starting ${provider} OAuth with URL: ${supabaseUrl}`)
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    })
    
    console.log('OAuth response:', { data, error })
    
    if (error) {
      console.error('OAuth Error Details:', {
        message: error.message,
        status: error.status,
        details: error
      })
      throw error
    }
    
    return { data, error: null }
  } catch (err) {
    console.error('OAuth Exception Details:', err)
    return { data: null, error: err }
  }
}

export const signInWithEmail = async (email: string, password: string) => {
  try {
    console.log('Attempting email sign in for:', email)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) {
      console.error('Email sign in error:', error)
    } else {
      console.log('Email sign in successful:', data.user?.email)
    }
    
    return { data, error }
  } catch (err) {
    console.error('Email sign in exception:', err)
    return { data: null, error: err }
  }
}

export const signUpWithEmail = async (email: string, password: string, metadata?: any) => {
  try {
    console.log('Attempting email sign up for:', email)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: `${window.location.origin}/dashboard`
      }
    })
    
    if (error) {
      console.error('Email sign up error:', error)
    } else {
      console.log('Email sign up successful:', data.user?.email)
    }
    
    return { data, error }
  } catch (err) {
    console.error('Email sign up exception:', err)
    return { data: null, error: err }
  }
}

export const signOut = async () => {
  try {
    console.log('Signing out...')
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Sign out error:', error)
    } else {
      console.log('Sign out successful')
    }
    return { error }
  } catch (err) {
    console.error('Sign out exception:', err)
    return { error: err }
  }
}

export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) {
      console.error('Get current user error:', error)
    }
    return { user, error }
  } catch (err) {
    console.error('Get current user exception:', err)
    return { user: null, error: err }
  }
}

export const resetPassword = async (email: string) => {
  try {
    console.log('Sending password reset email to:', email)
    // Use production URL if available, otherwise fall back to current origin
    const redirectUrl = import.meta.env.PROD 
      ? 'https://your-production-domain.com/reset-password'
      : `${window.location.origin}/reset-password`
    
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl
    })
    
    if (error) {
      console.error('Password reset error:', error)
    } else {
      console.log('Password reset email sent successfully')
    }
    
    return { data, error }
  } catch (err) {
    console.error('Password reset exception:', err)
    return { data: null, error: err }
  }
}