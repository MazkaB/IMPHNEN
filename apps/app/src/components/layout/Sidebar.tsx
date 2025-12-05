'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { useSidebarStore } from '@/store/sidebar-store';
import { logout } from '@/lib/firebase/auth-service';
import {
  LayoutDashboard,
  Mic,
  ScanLine,
  BarChart3,
  Sparkles,
  MessageCircle,
  Settings,
  LogOut,
  User,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/voice', label: 'Catat Suara', icon: Mic },
  { href: '/ocr', label: 'Scan Struk', icon: ScanLine },
  { href: '/insights', label: 'Insight AI', icon: BarChart3 },
  { href: '/content', label: 'Auto Konten', icon: Sparkles },
  { href: '/whatsapp', label: 'WhatsApp Bot', icon: MessageCircle },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile } = useAuthStore();
  const { isCollapsed, toggle } = useSidebarStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      // Silent fail
    }
  };

  const displayName = profile?.displayName || '';

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <img src="/logo.png" alt="NUSA AI" className="w-25 h-14 rounded-lg object-cover" />
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label={mobileOpen ? 'Tutup menu' : 'Buka menu'}
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`
        lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200
        transform transition-transform duration-300 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-14 flex items-center justify-between px-4 border-b border-slate-100">
          <img src="/logo.png" alt="NUSA AI" className="w-25 h-14 rounded-lg object-cover" />
          <button onClick={() => setMobileOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Profile */}
        <div className="px-3 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
              {profile?.photoURL ? (
                <img src={profile.photoURL} alt="" className="w-10 h-10 rounded-full" />
              ) : (
                <User className="w-5 h-5 text-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{displayName}</p>
              <p className="text-xs text-slate-400 truncate">{profile?.email || ''}</p>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-3 space-y-1">
            <p className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Menu</p>
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`
                    group flex items-center rounded-xl transition-all duration-200 px-3 py-2.5
                    ${isActive
                      ? 'bg-green-600 text-white shadow-lg shadow-green-600/25'
                      : 'text-slate-600 hover:bg-slate-50'
                    }
                  `}
                >
                  <div className={`flex items-center justify-center rounded-lg transition-colors flex-shrink-0 w-9 h-9 mr-3 ${isActive ? 'bg-white/20' : 'bg-slate-100 group-hover:bg-green-100'}`}>
                    <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-green-600'}`} />
                  </div>
                  <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-slate-700'}`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Mobile Bottom */}
        <div className="p-3 space-y-2 border-t border-slate-100">
          <Link
            href="/settings"
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 rounded-xl transition-colors px-3 py-2.5 ${pathname === '/settings' ? 'bg-slate-100' : 'hover:bg-slate-50'}`}
          >
            <Settings className="w-5 h-5 text-slate-500 flex-shrink-0" />
            <span className="text-sm font-medium text-slate-700">Pengaturan</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors px-3 py-2.5"
          >
            <LogOut className="w-5 h-5 text-red-500 flex-shrink-0" />
            <span className="text-sm font-medium">Keluar</span>
          </button>
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside className={`
        hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 bg-white border-r border-slate-200
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'lg:w-20' : 'lg:w-72'}
      `}>
      {/* Logo & Toggle */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
        <div className={`flex items-center ${isCollapsed ? 'justify-center w-full' : ''}`}>
          <img 
            src="/logo.png" 
            alt="NUSA AI" 
            className={`rounded-lg object-cover flex-shrink-0 ${isCollapsed ? 'w-12 h-12' : 'w-30 h-20'}`} 
          />
        </div>
        <button
          onClick={toggle}
          className={`
            p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600
            ${isCollapsed ? 'absolute -right-3 top-5 bg-white border border-slate-200 shadow-sm' : ''}
          `}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Profile Section */}
      <div className={`px-3 py-4 border-b border-slate-100 ${isCollapsed ? 'flex justify-center' : ''}`}>
        {isCollapsed ? (
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center" title={displayName}>
            {profile?.photoURL ? (
              <img src={profile.photoURL} alt="" className="w-10 h-10 rounded-full" />
            ) : (
              <User className="w-5 h-5 text-white" />
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
              {profile?.photoURL ? (
                <img src={profile.photoURL} alt="" className="w-10 h-10 rounded-full" />
              ) : (
                <User className="w-5 h-5 text-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{displayName}</p>
              <p className="text-xs text-slate-400 truncate">{profile?.email || ''}</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-3 space-y-1">
          {!isCollapsed && (
            <p className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Menu</p>
          )}
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={isCollapsed ? item.label : undefined}
                className={`
                  group flex items-center rounded-xl transition-all duration-200
                  ${isCollapsed ? 'justify-center p-3' : 'px-3 py-2.5'}
                  ${isActive
                    ? 'bg-green-600 text-white shadow-lg shadow-green-600/25'
                    : 'text-slate-600 hover:bg-slate-50'
                  }
                `}
              >
                <div className={`
                  flex items-center justify-center rounded-lg transition-colors flex-shrink-0
                  ${isCollapsed ? '' : 'w-9 h-9 mr-3'}
                  ${isActive ? (isCollapsed ? '' : 'bg-white/20') : (isCollapsed ? '' : 'bg-slate-100 group-hover:bg-green-100')}
                `}>
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-green-600'}`} />
                </div>
                {!isCollapsed && (
                  <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-slate-700'}`}>
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className={`p-3 space-y-2 border-t border-slate-100 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
        <Link
          href="/settings"
          title={isCollapsed ? 'Pengaturan' : undefined}
          className={`
            flex items-center gap-3 rounded-xl transition-colors
            ${isCollapsed ? 'p-3 justify-center' : 'px-3 py-2.5'}
            ${pathname === '/settings' ? 'bg-slate-100' : 'hover:bg-slate-50'}
          `}
        >
          <Settings className="w-5 h-5 text-slate-500 flex-shrink-0" />
          {!isCollapsed && <span className="text-sm font-medium text-slate-700">Pengaturan</span>}
        </Link>

        <button
          onClick={handleLogout}
          title={isCollapsed ? 'Keluar' : undefined}
          className={`
            w-full flex items-center gap-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors
            ${isCollapsed ? 'p-3 justify-center' : 'px-3 py-2.5'}
          `}
        >
          <LogOut className="w-5 h-5 text-red-500 flex-shrink-0" />
          {!isCollapsed && <span className="text-sm font-medium">Keluar</span>}
        </button>
      </div>
    </aside>
    </>
  );
}
