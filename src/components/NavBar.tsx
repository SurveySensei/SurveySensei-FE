import { Link, useLocation } from 'react-router-dom';
import { ConnectButton } from 'thirdweb/react';
import { client, wallets } from '@/config/thirdweb';

export default function NavBar() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  return (
    <header className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-xl font-bold text-gray-900">SurveySensei</Link>
          <nav className="hidden sm:flex items-center gap-4">
            <Link to="/" className={`text-sm ${isActive('/') ? 'text-blue-600 font-semibold' : 'text-gray-700'}`}>Dashboard</Link>
          </nav>
        </div>
        <ConnectButton client={client} wallets={wallets} theme="light" connectModal={{ size: 'wide' }} />
      </div>
    </header>
  );
}
