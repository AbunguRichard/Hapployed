import React, { useState } from 'react';
import { Upload, Globe, Clock, Download, Save, Camera } from 'lucide-react';
import { toast } from 'sonner';

export default function MyInfoSection({ user, onUnsavedChanges }) {
  const [formData, setFormData] = useState({
    displayName: user?.fullName || '',
    legalName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
    language: 'en',
    timezone: 'America/New_York',
    avatar: user?.avatar || ''
  });

  const [avatarPreview, setAvatarPreview] = useState(formData.avatar);
  const [isVerified, setIsVerified] = useState(true);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    onUnsavedChanges(true);
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
        onUnsavedChanges(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 500));
    toast.success('Profile updated successfully!');
    onUnsavedChanges(false);
  };

  const handleDownloadData = () => {
    toast.success('Data export request submitted. You\'ll receive an email shortly.');
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">My Info</h2>
        <p className="text-muted-foreground">Manage your personal information and profile settings.</p>
      </div>

      {/* Avatar Upload */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-3">Profile Photo</label>
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                formData.displayName.charAt(0).toUpperCase()
              )}
            </div>
            <label className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors">
              <Camera className="w-4 h-4" />
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </label>
          </div>
          <div className="text-sm text-muted-foreground">
            <p>JPG, PNG or GIF. Max size 5MB.</p>
            <p className="text-xs mt-1">Recommended: 400x400px</p>
          </div>
        </div>
      </div>

      {/* Display Name */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">Display Name</label>
        <input
          type="text"
          name="displayName"
          value={formData.displayName}
          onChange={handleChange}
          className="input w-full"
          placeholder="How you'd like to be called"
        />
      </div>

      {/* Legal Name */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">
          Legal Name {isVerified && <span className="text-green-500 text-xs ml-2">✓ Verified</span>}
        </label>
        <input
          type="text"
          name="legalName"
          value={formData.legalName}
          onChange={handleChange}
          disabled={isVerified}
          className="input w-full disabled:bg-muted disabled:cursor-not-allowed"
          placeholder="Full legal name"
        />
        {isVerified && (
          <p className="text-xs text-muted-foreground mt-1">
            Contact support to change your verified legal name
          </p>
        )}
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">Email Address</label>
        <div className="flex gap-2">
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="input flex-1"
            placeholder="email@example.com"
          />
          <button className="btn-secondary">Add Email</button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Primary email for notifications and account recovery
        </p>
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">Phone Number</label>
        <div className="flex gap-2">
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="input flex-1"
            placeholder="+1 (555) 123-4567"
          />
          <button className="btn-secondary">Verify</button>
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">Location</label>
        <div className="relative">
          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="input w-full pl-10"
            placeholder="City, State, Country"
          />
        </div>
      </div>

      {/* Language */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">Preferred Language</label>
        <select
          name="language"
          value={formData.language}
          onChange={handleChange}
          className="input w-full"
        >
          <option value="en">English</option>
          <option value="es">Español</option>
          <option value="fr">Français</option>
          <option value="de">Deutsch</option>
          <option value="ar">العربية</option>
        </select>
      </div>

      {/* Timezone */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">Time Zone</label>
        <div className="relative">
          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <select
            name="timezone"
            value={formData.timezone}
            onChange={handleChange}
            className="input w-full pl-10"
          >
            <option value="America/New_York">Eastern Time (ET)</option>
            <option value="America/Chicago">Central Time (CT)</option>
            <option value="America/Denver">Mountain Time (MT)</option>
            <option value="America/Los_Angeles">Pacific Time (PT)</option>
            <option value="Europe/London">London (GMT)</option>
            <option value="Europe/Paris">Paris (CET)</option>
            <option value="Asia/Tokyo">Tokyo (JST)</option>
          </select>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-6 border-t border-border">
        <button
          onClick={handleDownloadData}
          className="btn-secondary flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Download My Data
        </button>
        <button
          onClick={handleSave}
          className="btn-primary flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>
    </div>
  );
}
