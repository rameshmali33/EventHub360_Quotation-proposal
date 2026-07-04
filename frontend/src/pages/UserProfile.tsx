import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopHeader from '../components/TopHeader';
import { Settings, Bell, Shield, Clock, LogOut, Check } from 'lucide-react';

import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const UserProfile = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('preferences');

  const [firstName, setFirstName] = useState(() => localStorage.getItem('user_first_name') || 'Ramesh');
  const [lastName, setLastName] = useState(() => localStorage.getItem('user_last_name') || 'Mali');
  const [email, setEmail] = useState(() => localStorage.getItem('user_email') || 'ramesh.mali@eventhub360.com');
  const [avatarUrl, setAvatarUrl] = useState(() => localStorage.getItem('user_avatar_url') || '');

  const [successMessage, setSuccessMessage] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 800 * 1024) {
        showToast('File size exceeds 800KB limit.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeAvatar = () => {
    setAvatarUrl('');
  };

  const handleSaveChanges = () => {
    localStorage.setItem('user_first_name', firstName);
    localStorage.setItem('user_last_name', lastName);
    localStorage.setItem('user_email', email);
    localStorage.setItem('user_avatar_url', avatarUrl);
    window.dispatchEvent(new Event('profile-updated'));

    setSuccessMessage('Profile changes saved successfully!');
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  return (
    <div className="flex min-h-screen bg-[#F8F9FC] font-sans">
      <Sidebar />
      <div className="flex-1 ml-[260px] flex flex-col h-screen overflow-hidden">
        <TopHeader />
        
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-[1000px] mx-auto space-y-6">
            
            <div className="mb-8">
              <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">User Profile</h1>
              <p className="text-[15px] text-gray-500 mt-1">Manage your account settings, preferences, and security.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
              
              <div className="w-[250px] shrink-0 space-y-1">
                {[
                  { id: 'preferences', label: 'My Preferences', icon: Settings },
                  { id: 'notifications', label: 'Notification Settings', icon: Bell },
                  { id: 'security', label: 'Security Settings', icon: Shield },
                  { id: 'history', label: 'Login History', icon: Clock },
                  { id: 'logout', label: 'Logout', icon: LogOut, textClass: 'text-red-600 hover:bg-red-50' }
                ].map((item: any) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center px-4 py-3 rounded-xl text-[14px] font-bold transition-colors ${
                      activeTab === item.id 
                        ? 'bg-red-50 text-red-700' 
                        : item.textClass || 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 mr-3 ${activeTab === item.id ? 'text-red-700' : 'text-gray-400'}`} />
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="flex-1 bg-white rounded-[24px] shadow-sm border border-[#ECECF1] p-8 min-h-[500px]">
                
                {activeTab === 'preferences' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-[18px] font-bold text-gray-900">Profile & Preferences</h3>
                      {successMessage && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-xs font-bold animate-in fade-in slide-in-from-top-2 duration-200 animate-pulse">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          {successMessage}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-6 mb-8">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Profile" className="w-20 h-20 rounded-full object-cover shadow-sm border border-gray-100" />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-red-50 text-red-700 font-bold text-[28px] flex items-center justify-center border border-red-100 shadow-sm shrink-0">
                          {(firstName || 'A')[0].toUpperCase()}{(lastName || 'S')[0].toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <button 
                            onClick={triggerFileInput} 
                            className="px-4 py-2 bg-gray-900 text-white rounded-full font-bold text-[13px] hover:bg-gray-800 transition-colors shadow-sm"
                          >
                            Change Avatar
                          </button>
                          {avatarUrl && (
                            <button 
                              onClick={removeAvatar} 
                              className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-full font-bold text-[13px] hover:bg-gray-50 transition-colors shadow-sm"
                            >
                              Remove Avatar
                            </button>
                          )}
                        </div>
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          onChange={handleAvatarChange} 
                          accept="image/*" 
                          className="hidden" 
                        />
                        <p className="text-[12px] text-gray-500">JPG, GIF or PNG. Max size of 800K</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="text-[13px] font-bold text-gray-700 block mb-2">First Name</label>
                        <input 
                          type="text" 
                          value={firstName} 
                          onChange={e => setFirstName(e.target.value)} 
                          className="w-full px-4 py-2.5 bg-[#F8F9FC] border border-[#ECECF1] rounded-xl text-[14px] focus:outline-none focus:border-red-300 font-medium text-gray-900" 
                        />
                      </div>
                      <div>
                        <label className="text-[13px] font-bold text-gray-700 block mb-2">Last Name</label>
                        <input 
                          type="text" 
                          value={lastName} 
                          onChange={e => setLastName(e.target.value)} 
                          className="w-full px-4 py-2.5 bg-[#F8F9FC] border border-[#ECECF1] rounded-xl text-[14px] focus:outline-none focus:border-red-300 font-medium text-gray-900" 
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[13px] font-bold text-gray-700 block mb-2">Email Address</label>
                        <input 
                          type="email" 
                          value={email} 
                          onChange={e => setEmail(e.target.value)} 
                          className="w-full px-4 py-2.5 bg-[#F8F9FC] border border-[#ECECF1] rounded-xl text-[14px] focus:outline-none focus:border-red-300 font-medium text-gray-900" 
                        />
                      </div>
                    </div>
                    
                    <div className="pt-6 border-t border-[#ECECF1] flex justify-end">
                      <button 
                        onClick={handleSaveChanges} 
                        className="px-6 py-2.5 bg-gradient-to-r from-red-700 to-orange-400 text-white rounded-full font-bold text-[14px] shadow-sm hover:shadow-md transition-all"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'logout' && (
                  <div className="text-center py-10">
                    <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-600 mx-auto mb-4">
                      <LogOut className="w-8 h-8 ml-1" />
                    </div>
                    <h3 className="text-[20px] font-bold text-gray-900 mb-2">Log out of EventHub360?</h3>
                    <p className="text-[14px] text-gray-500 mb-8 max-w-sm mx-auto">You will be securely logged out. Make sure to save any draft quotations before proceeding.</p>
                    <div className="flex gap-3 justify-center">
                      <button onClick={() => setActiveTab('preferences')} className="px-6 py-3 bg-[#F8F9FC] text-gray-700 rounded-full font-bold text-[14px] hover:bg-gray-100 transition-colors">Cancel</button>
                      <button onClick={() => { signOut(); navigate('/login', { replace: true }); }} className="px-6 py-3 bg-red-600 text-white rounded-full font-bold text-[14px] hover:bg-red-700 transition-colors shadow-sm">Yes, Log Out</button>
                    </div>
                  </div>
                )}

                {(activeTab === 'notifications' || activeTab === 'security' || activeTab === 'history') && (
                  <div className="py-10 text-center">
                    <p className="text-gray-500 text-[15px] font-medium">Settings panel for {activeTab} will go here.</p>
                  </div>
                )}

              </div>

            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default UserProfile;
