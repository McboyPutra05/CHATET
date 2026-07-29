import { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { User, Upload, Save, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

export const ProfilePage = () => {
  const { user, setUser } = useAuthStore();
  
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.user_metadata?.avatar_url || '');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsUploading(true);
      setMessage('');
      
      const file = e.target.files?.[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      setAvatarUrl(data.publicUrl);
    } catch (error: any) {
      setMessage(`Gagal mengunggah foto: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setMessage('');
      
      const { data, error } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          avatar_url: avatarUrl,
        }
      });

      if (error) throw error;
      
      if (data.user) {
        // We get the current session to update our store properly
        const { data: sessionData } = await supabase.auth.getSession();
        setUser(data.user, sessionData.session);
        setMessage('Profil berhasil diperbarui!');
      }
      
    } catch (error: any) {
      setMessage(`Gagal menyimpan: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto pb-12">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Profil Pengguna</h2>
        <p className="text-slate-400 mt-1">Kelola informasi pribadi dan pengaturan akun Anda.</p>
      </div>

      <Card className="border-white/5 bg-slate-900/50 shadow-xl relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <User className="w-64 h-64 text-emerald-500 transform rotate-12" />
        </div>

        <CardContent className="pt-8 relative z-10">
          <form onSubmit={handleSaveProfile} className="space-y-8">
            
            {/* Avatar Section */}
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-800 bg-slate-950 flex items-center justify-center relative">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-12 h-12 text-slate-500" />
                  )}
                  {isUploading && (
                    <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                    </div>
                  )}
                </div>
                
                {/* Upload Button */}
                <label className="absolute bottom-0 right-0 bg-emerald-500 p-2 rounded-full cursor-pointer hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20 border border-emerald-400/50">
                  <Upload className="w-5 h-5 text-white" />
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleUploadAvatar} 
                    className="hidden" 
                    disabled={isUploading}
                  />
                </label>
              </div>
              
              <div className="text-center md:text-left space-y-1">
                <h3 className="text-xl font-bold text-slate-100">{fullName || 'Pengguna Baru'}</h3>
                <p className="text-slate-400 text-sm">{user?.email}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Nama Lengkap</label>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Masukkan nama lengkap..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all"
                />
              </div>
            </div>

            {message && (
              <div className={cn(
                "p-4 rounded-xl border text-sm font-medium",
                message.includes('Gagal') 
                  ? "bg-rose-500/10 border-rose-500/20 text-rose-400" 
                  : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              )}>
                {message}
              </div>
            )}

            <div className="pt-4 flex justify-end">
              <button 
                type="submit" 
                disabled={isSaving || isUploading}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-6 py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Simpan Profil
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
