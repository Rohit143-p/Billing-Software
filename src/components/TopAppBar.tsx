import React, { useState } from 'react';
import { Bell, Check, ExternalLink, X, Settings, LogOut, User, ChevronDown, Database, Smartphone } from 'lucide-react';
import { TabType, NotificationItem, BusinessConfig, UserAccount } from '../types';

interface TopAppBarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  notifications: NotificationItem[];
  onMarkNotificationRead: (id: string) => void;
  onClearAllNotifications: () => void;
  currency: string;
  onCurrencyToggle: () => void;
  config?: BusinessConfig;
  currentUser?: UserAccount | null;
  onLogout?: () => void;
  firebaseConnected?: boolean;
  onOpenMobileInstall?: () => void;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  currentTab,
  onSelectTab,
  notifications,
  onMarkNotificationRead,
  onClearAllNotifications,
  currency,
  onCurrencyToggle,
  config,
  currentUser,
  onLogout,
  firebaseConnected = true,
  onOpenMobileInstall
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const brandShort = config?.brandShort || 'RF';
  const businessName = config?.businessName || 'RevenueFlow';
  const brandColor = config?.brandColor || '#2563eb';

  // Compute initials for current user
  const userInitials = currentUser?.name
    ? currentUser.name
        .split(' ')
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'RF';

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-[1440px] mx-auto flex justify-between items-center px-4 sm:px-8 h-16">
        {/* Brand */}
        <div className="flex items-center gap-3 min-w-0">
          <button 
            onClick={() => onSelectTab('dashboard')}
            className="flex items-center gap-2.5 sm:gap-3 focus:outline-none group text-left cursor-pointer min-w-0"
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center font-mono-tag font-bold text-xs text-white shadow-sm relative transition-opacity group-hover:opacity-90 shrink-0"
              style={{ backgroundColor: brandColor }}
            >
              <span className="w-2 h-2 bg-emerald-400 rounded-full absolute -top-0.5 -right-0.5 ring-2 ring-white" />
              {brandShort}
            </div>
            <div className="flex items-baseline gap-2 min-w-0">
              <span className="font-editorial text-xl sm:text-2xl font-bold tracking-tight text-slate-900 truncate max-w-[160px] sm:max-w-xs md:max-w-md">
                {businessName}
              </span>
              <span className="hidden lg:inline-block text-[10px] tracking-[0.2em] font-semibold text-slate-400 font-mono-tag shrink-0">
                PRO
              </span>
            </div>
          </button>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {[
            { id: 'dashboard' as const, label: 'Dashboard' },
            { id: 'billing' as const, label: 'Billing' },
            { id: 'analytics' as const, label: 'Analytics' },
            { id: 'expenses' as const, label: 'Expenses' },
            { id: 'menu' as const, label: 'Configuration' }
          ].map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 relative">
          {/* Firestore Cloud Sync Badge */}
          <div
            title={firebaseConnected ? "Connected to Google Cloud Firestore (Live Sync)" : "Connecting to Firestore..."}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[11px] font-mono-tag font-semibold"
          >
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span>Firestore</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          {/* Mobile App & APK Button */}
          {onOpenMobileInstall && (
            <button
              onClick={onOpenMobileInstall}
              title="Install Mobile App / Generate APK"
              className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer shadow-xs"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mobile App</span>
            </button>
          )}

          {/* Quick Config Button */}
          <button
            onClick={() => onSelectTab('menu')}
            title="Open Business Configuration"
            className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer border ${
              currentTab === 'menu'
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <Settings className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Config</span>
          </button>

          {/* Quick Currency Toggle Pill */}
          <button
            onClick={onCurrencyToggle}
            title="Switch display currency"
            className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 bg-slate-100/80 hover:bg-slate-200/80 rounded-lg text-slate-700 transition-colors cursor-pointer"
          >
            <span className="text-slate-400 font-normal">CURR:</span>
            <span className="font-bold text-blue-600">{currency}</span>
          </button>

          {/* Notifications Button */}
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
            className="relative w-9 h-9 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors active:scale-95 cursor-pointer shadow-xs"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white" />
            )}
          </button>

          {/* User Profile Avatar / Menu Trigger */}
          <div className="relative">
            <button
              id="topbar-user-menu-btn"
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
              title={currentUser ? `${currentUser.name} (${currentUser.role})` : "Account Menu"}
              className="flex items-center gap-1.5 p-1 pl-1.5 pr-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-all cursor-pointer shadow-xs"
            >
              <div
                className="w-7 h-7 rounded-md text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-xs"
                style={{ backgroundColor: currentUser?.avatarColor || brandColor }}
              >
                {userInitials}
              </div>
              <span className="hidden md:inline-block text-xs font-semibold text-slate-800 max-w-[100px] truncate text-left">
                {currentUser?.name || 'Account'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* User Account Popover */}
            {showUserMenu && (
              <div className="absolute right-0 top-11 w-64 bg-white border border-slate-200 rounded-xl shadow-xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-start gap-2.5 pb-3 border-b border-slate-100">
                  <div
                    className="w-10 h-10 rounded-lg text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs"
                    style={{ backgroundColor: currentUser?.avatarColor || brandColor }}
                  >
                    {userInitials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {currentUser?.name || 'User'}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {currentUser?.email || 'user@company.com'}
                    </p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-mono-tag font-semibold uppercase tracking-wider bg-blue-50 text-blue-700">
                        {currentUser?.role || 'Member'}
                      </span>
                      {currentUser?.businessName && (
                        <span className="text-[10px] text-slate-400 truncate max-w-[110px]">
                          {currentUser.businessName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-2 space-y-1 text-xs">
                  <button
                    onClick={() => {
                      onSelectTab('menu');
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors text-left cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>Business Configuration</span>
                  </button>

                  <button
                    id="btn-user-logout"
                    onClick={() => {
                      setShowUserMenu(false);
                      if (onLogout) onLogout();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer font-medium"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Sign Out / Switch User</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Notification Popover */}
          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                      {unreadCount} NEW
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={onClearAllNotifications}
                      className="text-xs font-medium text-blue-600 hover:underline cursor-pointer"
                    >
                      Clear All
                    </button>
                  )}
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto mt-2">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">No notifications</p>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => onMarkNotificationRead(notif.id)}
                      className={`py-3 px-2.5 rounded-lg cursor-pointer transition-colors flex items-start gap-2.5 ${
                        notif.read ? 'opacity-60 hover:bg-slate-50' : 'bg-blue-50/50 hover:bg-blue-50'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                        notif.type === 'alert' ? 'bg-red-500' : notif.type === 'success' ? 'bg-emerald-500' : 'bg-blue-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <p className="text-xs font-semibold text-slate-900 truncate">{notif.title}</p>
                          <span className="text-[10px] text-slate-400">{notif.time}</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">{notif.description}</p>
                      </div>
                      {!notif.read && (
                        <Check className="w-3.5 h-3.5 text-blue-600 mt-1 flex-shrink-0" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
