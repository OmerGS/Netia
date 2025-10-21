'use client'; 

import React from 'react';
import Link from 'next/link';
import { Globe, Plane, Link as LinkIcon, BarChart3, ChevronRight } from 'lucide-react'; 

export default function HomePage() {
  return (
    <div 
      className="flex flex-col items-center justify-start min-h-[calc(100vh-64px)] py-16 px-6"
      style={{
        background: '#F9FAFB', 
      }}
    >
      <div className="text-center mb-16 max-w-4xl">
        
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-3">NETIA : NETwork Intelligence & Analytics</p>
        
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 tracking-tight leading-snug">
          Tous savoir concernant les réseaux aériens
        </h1>
        <h2 className="text-base text-gray-600 max-w-3xl mx-auto font-normal">
          Analyse avancée des réseaux de transport aérien via Neo4J
        </h2>
      </div>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl w-full pt-10">
        
        <FeatureCard 
          href="/airports" 
          title="Exploration des Hubs" 
          description="Visualisation des aéroports via une carte interractives.." 
          Icon={Globe}
        />
        
        <FeatureCard 
          href="/pathfinder" 
          title="Optimisation des Chemins" 
          description="Trouver le meilleur itinéraire selon vos besoins." 
          Icon={Plane}
        />
        
        <FeatureCard 
          href="/airline" 
          title="Compagnie aérienne" 
          description="Toutes les compagnies aériennes" 
          Icon={LinkIcon}
        />
        
        <FeatureCard 
          href="/analytics" 
          title="Algorithme" 
          description="Différents algorithmes pour analyser les réseaux." 
          Icon={BarChart3}
        />
        
      </div>

      <Link 
        href="/airports" 
        className="mt-12 inline-flex items-center justify-center bg-blue-600 text-white px-6 py-2.5 rounded-lg text-base font-semibold hover:bg-blue-700 transition-colors shadow-md"
      >
        Démarrer l'Explorateur 
        <ChevronRight className="w-5 h-5 ml-1" />
      </Link>
    </div>
  );
}

interface FeatureCardProps {
  href: string;
  title: string;
  description: string;
  Icon: React.ElementType; 
}

const FeatureCard: React.FC<FeatureCardProps> = ({ href, title, description, Icon }) => {
  return (
    <Link 
      href={href} 
      className="block p-5 rounded-lg transition-colors duration-200 group 
        bg-white hover:bg-blue-50/50 
        border border-gray-200 hover:border-blue-300"
    >
      <div className="flex flex-col items-start mb-3">
        <div className="mb-2 p-2 rounded-md bg-blue-50 group-hover:bg-blue-100/70 transition-colors">
            <Icon className="w-5 h-5 text-blue-600" />
        </div>
        
        <h2 className="text-lg font-semibold text-gray-800 group-hover:text-blue-700 transition-colors mt-1">
          {title}
        </h2>
      </div>
      <p className="text-gray-600 text-sm leading-normal">
        {description}
      </p>
      
      <div className="flex justify-end pt-2">
        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-transform duration-300 transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
};