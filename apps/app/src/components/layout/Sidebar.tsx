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
  Settings,
  LogOut,
  User,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';

import { getOcrUrl, getInsightUrl, getContentUrl } from '@/lib/urls';

// Menu items - Flow SAAS: Record → Analyze → Promote → Improve
const menuItems = [
  { 
    href: '/dashboard', 
    label: 'Dashboard', 
    icon: LayoutDashboard, 
    external: false,
    description: 'Beranda & Flow Utama',
    step: 0,
  },
  { 
    href: '/voice', 
    label: 'Catat Suara', 
    icon: Mic, 
    external: false,
    description: '1. Record - Input suara',
    step: 1,
  },
  { 
    href: getOcrUrl(), 
    label: 'Foto Struk', 
    icon: ScanLine, 
    external: true,
    description: '1. Record - Scan dokumen',
    step: 1,
  },
  { 
    href: getInsightUrl(), 
    label: 'Analisis', 
    icon: BarChart3, 
    external: true,
    description: '2. Analyze - Lihat insight',
    step: 2,
  },
  { 
    href: `${getContentUrl()}/content-creator`, 
    label: 'Buat Konten', 
    icon: Sparkles, 
    external: true,
    description: '3. Promote - Marketing',
    step: 3,
  },
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
      {/* Mobile Header - Hidden, handled by layout */}
      
      {/* Desktop Sidebar Only */}
      <aside className={`
        hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 bg-white border-r border-slate-200
        transition-all duration-300 ease-in-out shadow-sm
        ${isCollapsed ? 'lg:w-20' : 'lg:w-72'}
      `}>
        {/* Logo & Toggle */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 relative">
          <div className={`flex items-center ${isCollapsed ? 'justify-center w-full' : ''}`}>
            {isCollapsed ? (
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-lg">N</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-lg">N</span>
                </div>
                <span className="font-bold text-xl text-gray-900">NUSA AI</span>
              </div>
            )}
          </div>
          <button
            onClick={toggle}
            className={`
              p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600
              ${isCollapsed ? 'absolute -right-3 top-5 bg-white border border-slate-200 shadow-sm z-10' : ''}
            `}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Profile Section */}
        <div className={`px-3 py-4 border-b border-slate-100 ${isCollapsed ? 'flex justify-center' : ''}`}>
          {isCollapsed ? (
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center" title={displayName}>
              {profile?.photoURL ? (
                <img src={profile.photoURL} alt="" className="w-10 h-10 rounded-full" />
              ) : (
                <User className="w-5 h-5 text-white" />
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                {profile?.photoURL ? (
                  <img src={profile.photoURL} alt="" className="w-12 h-12 rounded-full" />
                ) : (
                  <User className="w-6 h-6 text-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">{displayName}</p>
                <p className="text-xs text-slate-400 truncate">{profile?.email || ''}</p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-3 space-y-1">
            {!isCollapsed && (
              <p className="px-3 mb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                Flow Bisnis
              </p>
            )}
            {menuItems.map((item) => {
              const isActive = !item.external && pathname === item.href;
              const LinkComponent = item.external ? 'a' : Link;
              // Add userId to external URLs for cross-domain data access
              const needsUserId = (item.label === 'Foto Struk' || item.label === 'Analisis') && profile?.uid;
              const hrefWithUserId = needsUserId
                ? `${item.href}?userId=${profile.uid}` 
                : item.href;
              const linkProps = item.external 
                ? { href: hrefWithUserId, target: '_blank', rel: 'noopener noreferrer' }
                : { href: item.href };
              return (
                <LinkComponent
                  key={item.href}
                  {...linkProps}
                  title={isCollapsed ? item.label : undefined}
                  className={`
                    group flex items-center rounded-2xl transition-all duration-200
                    ${isCollapsed ? 'justify-center p-3' : 'px-4 py-3'}
                    ${isActive
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/25'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }
                  `}
                >
                  <div className={`
                    flex items-center justify-center rounded-xl transition-colors flex-shrink-0
                    ${isCollapsed ? '' : 'w-10 h-10 mr-3'}
                    ${isActive ? (isCollapsed ? '' : 'bg-white/20') : (isCollapsed ? '' : 'bg-slate-100 group-hover:bg-green-100')}
                  `}>
                    <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-green-600'}`} />
                  </div>
                  {!isCollapsed && (
                    <div className="flex-1">
                      <span className={`text-sm font-semibold block ${isActive ? 'text-white' : 'text-slate-700'}`}>
                        {item.label}
                      </span>
                      <span className={`text-xs ${isActive ? 'text-white/70' : 'text-slate-400'}`}>
                        {item.description}
                      </span>
                    </div>
                  )}
                  {!isCollapsed && item.external && (
                    <span className="text-xs bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full ml-2">
                      ↗
                    </span>
                  )}
                </LinkComponent>
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
              flex items-center gap-3 rounded-2xl transition-colors
              ${isCollapsed ? 'p-3 justify-center' : 'px-4 py-3'}
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
              w-full flex items-center gap-3 rounded-2xl text-red-600 hover:bg-red-50 transition-colors
              ${isCollapsed ? 'p-3 justify-center' : 'px-4 py-3'}
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
