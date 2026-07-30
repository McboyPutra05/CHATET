import { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import { Upload, Loader2, Edit2, Check, X } from 'lucide-react';
import { cn } from '../lib/utils';

export const ProfilePage = () => {
  const { user, setUser } = useAuthStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Form states based on user_metadata
  const meta = user?.user_metadata || {};
  const [formData, setFormData] = useState({
    firstName: meta.first_name || meta.full_name?.split(' ')[0] || '',
    lastName: meta.last_name || meta.full_name?.split(' ').slice(1).join(' ') || '',
    phone: meta.phone || '',
    bio: meta.bio || '',
    country: meta.country || '',
    city: meta.city || '',
    postalCode: meta.postal_code || '',
    taxId: meta.tax_id || ''
  });

  const handleUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsUploading(true);
      setMessage({ text: '', type: '' });
      
      const file = e.target.files?.[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      // Update auth user metadata immediately with new avatar
      const { data: updatedUser, error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: data.publicUrl }
      });
      
      if (updateError) throw updateError;
      
      if (updatedUser.user) {
        const { data: sessionData } = await supabase.auth.getSession();
        setUser(updatedUser.user, sessionData.session);
      }

    } catch (error: any) {
      setMessage({ text: `Gagal mengunggah foto: ${error.message}`, type: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      setMessage({ text: '', type: '' });
      
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      
      const { data, error } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          bio: formData.bio,
          country: formData.country,
          city: formData.city,
          postal_code: formData.postalCode,
          tax_id: formData.taxId,
        }
      });

      if (error) throw error;
      
      if (data.user) {
        const { data: sessionData } = await supabase.auth.getSession();
        setUser(data.user, sessionData.session);
        setMessage({ text: 'Profil berhasil diperbarui!', type: 'success' });
        setIsEditing(false);
      }
      
    } catch (error: any) {
      setMessage({ text: `Gagal menyimpan: ${error.message}`, type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const InputField = ({ label, value, field }: { label: string, value: string, field: keyof typeof formData }) => (
    <div className="space-y-1">
      <p className="text-sm font-medium text-slate-400">{label}</p>
      {isEditing ? (
        <input 
          type="text" 
          value={formData[field]}
          onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
        />
      ) : (
        <p className="text-slate-100 font-medium py-2">{value || '-'}</p>
      )}
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 animate-in fade-in duration-500">
      
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold tracking-tight">My Profile</h2>
        {message.text && (
          <div className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium animate-in slide-in-from-top-2",
            message.type === 'error' ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
          )}>
            {message.text}
          </div>
        )}
      </div>

      {/* Header Card */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left w-full">
          <div className="relative group shrink-0">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-slate-800 bg-slate-950 flex items-center justify-center relative">
              {meta.avatar_url ? (
                <img src={meta.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-3xl">
                  {meta.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase()}
                </div>
              )}
              {isUploading && (
                <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
                </div>
              )}
            </div>
            <label className="absolute bottom-0 right-0 bg-emerald-500 p-2 rounded-full cursor-pointer hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20 border border-emerald-400/50">
              <Upload className="w-4 h-4 text-white" />
              <input type="file" accept="image/*" onChange={handleUploadAvatar} className="hidden" disabled={isUploading} />
            </label>
          </div>
          
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-white">{meta.full_name || 'Pengguna Baru'}</h3>
            <p className="text-slate-400">{meta.bio || 'Member'}</p>
            <p className="text-slate-500 text-sm mt-1">{meta.city ? `${meta.city}, ${meta.country}` : 'Lokasi belum diatur'}</p>
          </div>
          
          <div className="shrink-0">
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl transition-colors border border-slate-700"
              >
                <Edit2 className="w-4 h-4" />
                <span>Edit</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-xl transition-colors border border-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
                <button 
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Save</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Personal Information Card */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl">
        <h3 className="text-lg font-bold text-white mb-6">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <InputField label="First Name" value={formData.firstName} field="firstName" />
          <InputField label="Last Name" value={formData.lastName} field="lastName" />
          
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-400">Email address</p>
            <p className="text-slate-100 font-medium py-2">{user?.email}</p>
          </div>
          
          <InputField label="Phone" value={formData.phone} field="phone" />
          
          <div className="md:col-span-2">
            <InputField label="Bio" value={formData.bio} field="bio" />
          </div>
        </div>
      </div>

      {/* Address Card */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl">
        <h3 className="text-lg font-bold text-white mb-6">Address</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <InputField label="Country" value={formData.country} field="country" />
          <InputField label="City/State" value={formData.city} field="city" />
          <InputField label="Postal Code" value={formData.postalCode} field="postalCode" />
          <InputField label="TAX ID" value={formData.taxId} field="taxId" />
        </div>
      </div>

    </div>
  );
};
