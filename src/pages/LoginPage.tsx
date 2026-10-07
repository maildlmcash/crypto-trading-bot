import { useEffect, useState } from 'react';
import './LoginPage.css';

interface LoginProps {
  onLoginSuccess: (token: string, user: any) => void;
}

function LoginPage({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('admin@cryptolab.io');
  const [password, setPassword] = useState('Admin@123456');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRegister, setIsRegister] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const res = await fetch(`http://localhost:3001${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!data.ok) {
        setError(data.error || 'Authentication failed');
        setLoading(false);
        return;
      }

      if (isRegister) {
        setError(null);
        setIsRegister(false);
        setPassword('');
        alert('Registration successful! Please login.');
      } else {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onLoginSuccess(data.token, data.user);
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="brand-mark-large">C</div>
          <h1>Crypto Signal Lab</h1>
          <p>Paper Trading Platform</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <h2>{isRegister ? 'Create Account' : 'Login'}</h2>

          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@cryptolab.io" required />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>

          {error && <div className="error-message">❌ {error}</div>}

          <button type="submit" disabled={loading} className="submit-button">
            {loading ? 'Processing...' : isRegister ? 'Register' : 'Login'}
          </button>
        </form>

        <div className="login-toggle">
          <span>{isRegister ? 'Already have an account?' : 'Need an account?'}</span>
          <button type="button" onClick={() => setIsRegister(!isRegister)} className="toggle-button">
            {isRegister ? 'Login here' : 'Register here'}
          </button>
        </div>

        <div className="demo-credentials">
          <p>Demo Credentials:</p>
          <small>Admin: admin@cryptolab.io / Admin@123456</small>
          <small>Trader: trader@cryptolab.io / Trader@12345</small>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
