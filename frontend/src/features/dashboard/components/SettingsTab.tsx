import React, { useState } from 'react';
import {
  Bell,
  Lock,
  Globe,
  Moon,
  Shield,
  AlertCircle,
  CheckCircle,
  CreditCard,
  Smartphone,
} from 'lucide-react';

const SettingsTab: React.FC = () => {
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    marketing: false,
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    showEmail: true,
    showPhone: false,
  });

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <p className="text-gray-500 mt-1">Manage your account preferences</p>
      </div>

      <div className="space-y-6">
        {/* Notification Settings */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bell size={20} className="text-blue-500" />
            <h3 className="font-semibold text-gray-900">Notification Preferences</h3>
          </div>

          <div className="space-y-3">
            {Object.entries(notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-700 capitalize">{key}</p>
                  <p className="text-xs text-gray-500">
                    Receive {key} notifications
                  </p>
                </div>
                <button
                  onClick={() =>
                    setNotifications((prev) => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))
                  }
                  className={`w-10 h-5 rounded-full transition-colors ${
                    value ? 'bg-blue-500' : 'bg-gray-300'
                  } relative`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${
                      value ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Lock size={20} className="text-blue-500" />
            <h3 className="font-semibold text-gray-900">Privacy Settings</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <div>
                <p className="text-sm font-medium text-gray-700">Profile Visibility</p>
                <p className="text-xs text-gray-500">Who can see your profile</p>
              </div>
              <select
                value={privacy.profileVisibility}
                onChange={(e) =>
                  setPrivacy((prev) => ({ ...prev, profileVisibility: e.target.value }))
                }
                className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="clients">Clients Only</option>
              </select>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <div>
                <p className="text-sm font-medium text-gray-700">Show Email</p>
                <p className="text-xs text-gray-500">Display email on your profile</p>
              </div>
              <button
                onClick={() =>
                  setPrivacy((prev) => ({ ...prev, showEmail: !prev.showEmail }))
                }
                className={`w-10 h-5 rounded-full transition-colors ${
                  privacy.showEmail ? 'bg-blue-500' : 'bg-gray-300'
                } relative`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${
                    privacy.showEmail ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-gray-700">Show Phone</p>
                <p className="text-xs text-gray-500">Display phone number on your profile</p>
              </div>
              <button
                onClick={() =>
                  setPrivacy((prev) => ({ ...prev, showPhone: !prev.showPhone }))
                }
                className={`w-10 h-5 rounded-full transition-colors ${
                  privacy.showPhone ? 'bg-blue-500' : 'bg-gray-300'
                } relative`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${
                    privacy.showPhone ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield size={20} className="text-blue-500" />
            <h3 className="font-semibold text-gray-900">Account Settings</h3>
          </div>

          <div className="space-y-3">
            <button className="w-full flex items-center justify-between py-2 border-b border-gray-50 hover:bg-gray-50 px-2 rounded transition-colors">
              <div className="flex items-center gap-3">
                <Smartphone size={18} className="text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Change Phone Number</p>
                  <p className="text-xs text-gray-500">Update your contact number</p>
                </div>
              </div>
              <span className="text-sm text-blue-500">Update</span>
            </button>

            <button className="w-full flex items-center justify-between py-2 border-b border-gray-50 hover:bg-gray-50 px-2 rounded transition-colors">
              <div className="flex items-center gap-3">
                <Lock size={18} className="text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Change Password</p>
                  <p className="text-xs text-gray-500">Update your password</p>
                </div>
              </div>
              <span className="text-sm text-blue-500">Update</span>
            </button>

            <button className="w-full flex items-center justify-between py-2 border-b border-gray-50 hover:bg-gray-50 px-2 rounded transition-colors">
              <div className="flex items-center gap-3">
                <CreditCard size={18} className="text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Payment Settings</p>
                  <p className="text-xs text-gray-500">Manage your payment methods</p>
                </div>
              </div>
              <span className="text-sm text-blue-500">Manage</span>
            </button>

            <button className="w-full flex items-center justify-between py-2 hover:bg-gray-50 px-2 rounded transition-colors">
              <div className="flex items-center gap-3">
                <Globe size={18} className="text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Language & Region</p>
                  <p className="text-xs text-gray-500">English (Cameroon)</p>
                </div>
              </div>
              <span className="text-sm text-blue-500">Change</span>
            </button>
          </div>
        </div>

        {/* Verification Status */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
          <CheckCircle size={20} className="text-green-500 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-green-900">Verification Status</p>
            <p className="text-sm text-green-700">
              Your account is verified. You have full access to all professional features.
            </p>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle size={20} className="text-red-500 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-900">Danger Zone</p>
            <p className="text-sm text-red-700">
              Deactivating your account will remove your profile and services from the platform.
            </p>
            <button className="mt-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors">
              Deactivate Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;