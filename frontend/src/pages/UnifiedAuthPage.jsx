import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LOGO_URL = 'https://customer-assets.emergentagent.com/job_visual-evolution/artifacts/l0gczbs1_background_AI-removebg-preview%20%281%29.png';

// Your custom background images
const SLIDES = [
  'https://customer-assets.emergentagent.com/job_hapployed-ux/artifacts/psd7o3o9_Image%201.png',
  'https://customer-assets.emergentagent.com/job_hapployed-ux/artifacts/pdmdyzn6_image%202.png',
  'https://customer-assets.emergentagent.com/job_hapployed-ux/artifacts/efua2yxh_image%203.png',
  'https://customer-assets.emergentagent.com/job_hapployed-ux/artifacts/66726t96_image%204.png',
  'https://customer-assets.emergentagent.com/job_hapployed-ux/artifacts/mlr3wjfz_Image%205.png'
];

export default function UnifiedAuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [mode, setMode] = useState('signup'); // 'signup' or 'login'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Detect mode from URL
  useEffect(() => {
    if (location.pathname.includes('login')) {
      setMode('login');
    } else {
      setMode('signup');
    }
  }, [location.pathname]);

  // Slideshow effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Particle animation
  useEffect(() => {
    const canvas = document.getElementById('fx');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let w, h, particles = [];
    
    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }
    
    window.addEventListener('resize', resize);
    resize();
    
    function spawn(n) {
      for (let i = 0; i < n; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.15,
          r: Math.random() * 1.4 + 0.6,
          a: Math.random() * 0.6 + 0.2
        });
      }
    }
    
    spawn(140);
    
    function step() {
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(160, 215, 255, ${p.a})`;
        ctx.fill();
      }
      requestAnimationFrame(step);
    }
    
    step();
    
    return () => {
      window.removeEventListener('resize', resize);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    
    try {
      if (mode === 'login') {
        await login(email, password);
        navigate('/dashboard');
      } else {
        // Sign up flow
        navigate('/auth/signup', { state: { email, password } });
      }
    } catch (err) {
      setError(mode === 'login' ? 'Invalid email or password' : 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
    navigate(newMode === 'login' ? '/auth/login' : '/auth/signup');
  };

  return (
    <div style={{ height: '100vh', overflow: 'hidden', background: '#0b1020' }}>
      {/* Background Slideshow */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden' }}>
        {SLIDES.map((slide, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              inset: '-4%',
              backgroundImage: `url(${slide})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'contrast(1.05) brightness(0.98) saturate(1.08)',
              opacity: i === currentSlide ? 1 : 0,
              transform: i === currentSlide ? 'scale(1)' : 'scale(1.06)',
              transition: 'opacity 800ms ease, transform 12s ease'
            }}
          />
        ))}
        <canvas id="fx" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
      </div>

      {/* Centered Auth Card */}
      <div style={{ position: 'relative', height: '100vh', display: 'grid', placeItems: 'center', padding: '20px' }}>
        <div style={{
          width: 'min(520px, 92vw)',
          background: 'rgba(223, 204, 180, 0.95)',
          border: '1px solid rgba(120, 90, 60, 0.25)',
          borderRadius: '20px',
          padding: '28px',
          boxShadow: '0 12px 36px rgba(0,0,0,.28)'
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'center' }}>
            <img src={LOGO_URL} alt="Hapployed" style={{ width: '28px', height: '28px' }} />
            <strong style={{ fontSize: '18px', color: '#111827' }}>Hapployed</strong>
          </div>

          <h1 style={{ textAlign: 'center', margin: '6px 0 2px', fontSize: '28px', color: '#111827' }}>
            {mode === 'signup' ? 'Create your account' : 'Welcome back'}
          </h1>
          <p style={{ textAlign: 'center', color: '#475569', margin: '0 0 18px', fontSize: '14px' }}>
            {mode === 'signup' ? 'Join thousands of happy workers' : 'Log in to continue'}
          </p>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '14px' }}>
            <button
              onClick={() => switchMode('signup')}
              style={{
                border: mode === 'signup' ? 'none' : '1px solid rgba(0,0,0,.12)',
                background: mode === 'signup' ? 'linear-gradient(135deg, #8b5cf6, #06b6d4 70%)' : '#fff',
                padding: '8px 14px',
                borderRadius: '999px',
                cursor: 'pointer',
                fontWeight: '600',
                color: mode === 'signup' ? '#fff' : '#0f172a'
              }}
            >
              Sign up
            </button>
            <button
              onClick={() => switchMode('login')}
              style={{
                border: mode === 'login' ? 'none' : '1px solid rgba(0,0,0,.12)',
                background: mode === 'login' ? 'linear-gradient(135deg, #8b5cf6, #06b6d4 70%)' : '#fff',
                padding: '8px 14px',
                borderRadius: '999px',
                cursor: 'pointer',
                fontWeight: '600',
                color: mode === 'login' ? '#fff' : '#0f172a'
              }}
            >
              Log in
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{ padding: '12px', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px', marginBottom: '12px', color: '#991b1b', fontSize: '14px' }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', color: '#374151', display: 'block', marginBottom: '6px' }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid rgba(0,0,0,.12)', background: '#fff', color: '#0f172a' }}
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', color: '#374151', display: 'block', marginBottom: '6px' }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid rgba(0,0,0,.12)', background: '#fff', color: '#0f172a' }}
              />
            </div>

            {mode === 'signup' && (
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '12px', color: '#374151', display: 'block', marginBottom: '6px' }}>Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  required
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid rgba(0,0,0,.12)', background: '#fff', color: '#0f172a' }}
                />
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
              <button type="button" style={{ background: 'transparent', border: '0', color: '#7c3aed', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>
                Forgot password?
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '12px 18px',
                  borderRadius: '12px',
                  border: '0',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  background: 'linear-gradient(135deg, #8b5cf6, #06b6d4 70%)',
                  color: '#fff',
                  fontWeight: '700',
                  opacity: loading ? 0.6 : 1
                }}
              >
                {loading ? 'Please wait...' : (mode === 'signup' ? 'Sign up' : 'Log in')}
              </button>
            </div>

            <div style={{ textAlign: 'center', marginTop: '14px', fontSize: '14px', color: '#111827' }}>
              {mode === 'signup' ? (
                <>
                  Already have an account?{' '}
                  <a href="#" onClick={(e) => { e.preventDefault(); switchMode('login'); }} style={{ color: '#7c3aed', textDecoration: 'none', fontWeight: '600' }}>
                    Log in
                  </a>
                </>
              ) : (
                <>
                  New to Hapployed?{' '}
                  <a href="#" onClick={(e) => { e.preventDefault(); switchMode('signup'); }} style={{ color: '#7c3aed', textDecoration: 'none', fontWeight: '600' }}>
                    Create an account
                  </a>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
