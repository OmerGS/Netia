'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation'; 

export const Navbar = () => {
    const pathname = usePathname();

    return (
        <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                
                <div className="flex items-center space-x-4">
                    <Link href="/" className="text-2xl font-extrabold text-gray-900 tracking-tight hover:text-blue-600 transition-colors">
                        Netia
                    </Link>
                    <span className="ml-3 text-sm font-light text-gray-500 hidden sm:block">
                        Graph-Powered Flight Analytics
                    </span>
                </div>

                <div className="flex space-x-8">
                    <NavLink href="/" label="Accueil" currentPath={pathname} />
                    <NavLink href="/airports" label="Explorateur" currentPath={pathname} />
                    <NavLink href="/pathfinder" label="Les trajets" currentPath={pathname} />
                    <NavLink href="/airline" label="Compagnie aérienne" currentPath={pathname} /> 
                </div>
            </div>
        </nav>
    );
};


interface NavLinkProps {
    href: string;
    label: string;
    currentPath: string;
}

const NavLink: React.FC<NavLinkProps> = ({ href, label, currentPath }) => {
    const isActive = currentPath === href || (href !== '/' && currentPath.startsWith(href));

    return (
        <Link 
            href={href}
            className={`
                relative text-sm font-semibold pt-1 transition-colors duration-200
                ${isActive 
                    ? 'text-blue-600' 
                    : 'text-gray-700 hover:text-gray-900'
                }
                
                after:content-[''] after:absolute after:w-full after:h-[2px] after:bottom-[-4px] after:left-0 
                ${isActive 
                    ? 'after:bg-blue-600' 
                    : 'after:bg-transparent hover:after:bg-gray-300'
                }
            `}
        >
            {label}
        </Link>
    );
};

export default Navbar;