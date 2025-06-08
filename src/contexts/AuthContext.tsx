import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Error getting initial session:', error)
        } else {
          console.log('Initial session:', session?.user?.email || 'No session')
          setSession(session)
          setUser(session?.user ?? null)
        }
      } catch (error) {
        console.error('Exception getting initial session:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email || 'No user')
      
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)

      // Handle successful OAuth login
      if (event === 'SIGNED_IN' && session) {
        console.log('User signed in successfully, redirecting to dashboard')
        // The redirect will be handled by the component that's listening to auth state
      }

      // Handle sign out
      if (event === 'SIGNED_OUT') {
        console.log('User signed out')
        setUser(null)
        setSession(null)
      }
    })

    return () => {
      console.log('Cleaning up auth subscription')
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    try {
      console.log('Signing out user...')
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Sign out error:', error)
        throw error
      }
      console.log('Sign out successful')
      // Clear local state immediately
      setUser(null)
      setSession(null)
    } catch (error) {
      console.error('Failed to sign out:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    session,
    loading,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}