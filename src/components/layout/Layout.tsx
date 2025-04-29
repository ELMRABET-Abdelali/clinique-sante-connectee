
import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, X } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { isAuthenticated } = useAuth();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <div className="flex flex-1">
        {/* Desktop sidebar */}
        <aside className="hidden md:block w-64 flex-shrink-0">
          <Sidebar />
        </aside>
        
        {/* Mobile sidebar overlay */}
        {isMobileSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}
        
        {/* Mobile sidebar */}
        <aside 
          className={`fixed top-0 left-0 bottom-0 z-20 w-64 transform transition-transform duration-300 ease-in-out md:hidden ${
            isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <Sidebar />
        </aside>
        
        <main className="flex-1 p-6">
          {/* Mobile menu button */}
          <button 
            className="block md:hidden mb-4 p-2 rounded-md hover:bg-gray-100"
            onClick={toggleMobileSidebar}
            aria-label="Toggle sidebar"
          >
            {isMobileSidebarOpen ? (
              <X className="h-6 w-6 text-gray-600" />
            ) : (
              <Menu className="h-6 w-6 text-gray-600" />
            )}
          </button>
          
          {children}
        </main>
      </div>
    </div>
  );
}
