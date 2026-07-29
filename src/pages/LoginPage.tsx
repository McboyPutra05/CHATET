import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Wallet, Loader2, LogIn, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/');
      } else {
        if (!name.trim()) throw new Error('Nama tidak boleh kosong');
        if (password !== confirmPassword) throw new Error('Password tidak cocok');
        
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: { full_name: name }
          }
        });
        if (error) throw error;
        alert('Sukses! Silakan cek email Anda untuk verifikasi pendaftaran.');
        setIsLogin(true);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 -z-10" />
      
      <div className="w-full max-w-md space-y-8 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
            <Wallet className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">X-Saving</h2>
          <p className="mt-2 text-slate-400">Extreme Saving Mode. Track every penny.</p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl">
          <form onSubmit={handleEmailAuth} className="space-y-6">
            {error && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Nama Lengkap</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3.5 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
                    placeholder="Nama Anda"
                    required={!isLogin}
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3.5 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
                  placeholder="anda@email.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3.5 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Ulangi Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3.5 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
                    placeholder="••••••••"
                    required={!isLogin}
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98] disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
              {isLogin ? 'Masuk' : 'Daftar Akun'}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-between gap-4">
            <div className="h-px flex-1 bg-slate-800"></div>
            <span className="text-sm text-slate-500">atau</span>
            <div className="h-px flex-1 bg-slate-800"></div>
          </div>

          <button
            onClick={handleGoogleAuth}
            className="mt-6 w-full h-12 flex items-center justify-center gap-3 bg-white text-slate-900 font-medium rounded-xl transition-all hover:bg-slate-100 active:scale-[0.98]"
          >
            <Globe className="w-5 h-5" />
            Lanjutkan dengan Google
          </button>
        </div>

        <p className="text-center text-sm text-slate-400">
          {isLogin ? 'Belum punya akun? ' : 'Sudah punya akun? '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
          >
            {isLogin ? 'Daftar sekarang' : 'Masuk di sini'}
          </button>
        </p>
      </div>
    </div>
  );
};
