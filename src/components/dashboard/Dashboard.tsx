import React from "react";
import { RequestsTable } from "./RequestsTable";
import { MyMOCTable } from "./MyMOCTable";
import { LocationId, locations } from "./LocationSelector";
import { 
  LayoutDashboard, 
  Clock, 
  Activity, 
  CheckCircle2,
  Loader2
} from "lucide-react";

const locationImages: Record<LocationId, string> = {
  rayong: "https://images.unsplash.com/photo-1592385456792-dfef3ae5fa87?auto=format&fit=crop&w=1600&q=80",
  khanom: "https://images.unsplash.com/photo-1693021761106-bbd4524c1ffc?auto=format&fit=crop&w=1600&q=80",
  eastern: "https://images.unsplash.com/photo-1600221891660-7bc38ce938ce?auto=format&fit=crop&w=1600&q=80"
};

interface DashboardProps {
  onCreateRequest: () => void;
  onViewRequest: (mocNo: string, title: string, step?: number) => void;
  currentLocation?: LocationId;
  isSwitchingLocation?: boolean;
}

export const Dashboard = ({
  onCreateRequest,
  onViewRequest,
  currentLocation = "rayong",
  isSwitchingLocation = false
}: DashboardProps) => {
  
  return (
    <div className="w-full animate-in fade-in duration-500 pb-12 relative min-h-screen">
      
      {/* Loading Overlay */}
      {isSwitchingLocation && (
        <div className="fixed inset-0 z-[100] bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300">
          <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4 border border-gray-100 max-w-sm w-full mx-4">
             <div className="relative">
               <div className="w-12 h-12 rounded-full border-4 border-blue-100 border-t-[#006699] animate-spin" />
               <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-2 h-2 bg-[#006699] rounded-full" />
               </div>
             </div>
             <div className="text-center space-y-1">
               <h3 className="text-lg font-bold text-[#1d3654]">Updating Location</h3>
               <p className="text-sm text-gray-500">Synchronizing dashboard data...</p>
             </div>
          </div>
        </div>
      )}

      {/* 1. Hero Banner - Full Width */}
      <div className="relative w-[calc(100%+3rem)] md:w-[calc(100%+4rem)] -mx-6 md:-mx-8 mb-8 h-48 md:h-64 overflow-hidden shadow-xl group transition-all duration-500">
        <div className="absolute inset-0 bg-[#1d3654]">
          <img 
            key={currentLocation} // Triggers animation on change
            src={locationImages[currentLocation]}
            alt="Industrial Plant" 
            className="w-full h-full object-cover transition-opacity duration-700 animate-in fade-in zoom-in-105 duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#002040] via-[#003366]/90 to-[#006699]/40 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
        </div>
        
        <div className="relative h-full flex flex-col justify-center px-6 md:px-10 lg:px-12 text-white z-10">
          <h1 className="text-3xl md:text-5xl font-bold mb-2 tracking-tight animate-in slide-in-from-left duration-500 delay-100">
            PTT GSP eMoC
          </h1>
          <p className="text-blue-100/90 text-lg md:text-xl font-medium max-w-xl animate-in slide-in-from-left duration-500 delay-200">
            Electronic Management of Change System
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {/* 3. TO DO LIST Section */}
        <section>
          <RequestsTable 
            onCreateRequest={onCreateRequest} 
            onViewRequest={onViewRequest}
          />
        </section>

        {/* 4. Related MOC Section */}
        <section>
          <MyMOCTable 
            onViewRequest={onViewRequest}
          />
        </section>
      </div>
    </div>
  );
};
