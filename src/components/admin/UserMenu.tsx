'use client';

import { useState, useRef, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import LogoutOutlined from '@mui/icons-material/LogoutOutlined';
import ExpandMoreOutlined from '@mui/icons-material/ExpandMoreOutlined';

interface UserMenuProps {
  userName: string;
  userRole: string;
}

export default function UserMenu({ userName, userRole }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: '/signin' });
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors font-medium text-blue-900"
        title="User menu - Click to sign out"
      >
        <div className="w-8 h-8 rounded-full bg-blue-900 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
          {userName.charAt(0).toUpperCase()}
        </div>
        <div className="hidden sm:flex sm:flex-col sm:items-start">
          <div className="text-xs font-semibold text-blue-900">{userRole}</div>
          <div className="text-xs text-blue-700 truncate max-w-[100px]">{userName}</div>
        </div>
        <ExpandMoreOutlined 
          sx={{ 
            fontSize: 20, 
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
            color: '#1e40af'
          }} 
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-2xl border-2 border-blue-200 z-50 overflow-hidden">
          <div className="p-4 border-b-2 border-blue-100 bg-blue-50">
            <div className="text-sm font-semibold text-gray-900">{userName}</div>
            <div className="text-xs text-gray-600 mt-0.5">{userRole}</div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium border-t border-gray-100"
          >
            <LogoutOutlined sx={{ fontSize: 18 }} />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
