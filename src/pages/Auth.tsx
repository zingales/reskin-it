import React, { useState } from 'react'
import { Login } from '../components/Login'
import { Register } from '../components/Register'

export const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f7fafc', 
      padding: '2rem 0' 
    }}>
      <div style={{ 
        maxWidth: '640px', 
        margin: '0 auto', 
        padding: '0 1rem' 
      }}>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '2rem',
          alignItems: 'center'
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ 
              fontSize: '2.5rem', 
              fontWeight: '800',
              background: 'linear-gradient(to right, #667eea, #764ba2)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '1rem'
            }}>
              ReskinIt
            </h1>
            <p style={{ color: '#718096', fontSize: '1.125rem' }}>
              {isLogin ? 'Welcome back to your account' : 'Join our community'}
            </p>
          </div>

          {/* Auth Form */}
          {isLogin ? (
            <Login onSwitchToRegister={() => setIsLogin(false)} />
          ) : (
            <Register onSwitchToLogin={() => setIsLogin(true)} />
          )}
        </div>
      </div>
    </div>
  )
}
