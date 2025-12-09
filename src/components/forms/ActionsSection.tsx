import { Zap, UserCog, Clock, Users, XCircle, ChevronRight } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import { Button } from "../ui/button";
import { ChevronDown } from "lucide-react";

interface ActionsSectionProps {
  onChangeMOCChampion: () => void;
  onExtendTemporary: () => void;
  onChangeTeam: () => void;
  onCancelMOC: () => void;
}

export const ActionsSection = ({
  onChangeMOCChampion,
  onExtendTemporary,
  onChangeTeam,
  onCancelMOC,
}: ActionsSectionProps) => {
  return (
    <section
      id="section-actions"
      className="space-y-6 scroll-mt-24 mt-12 pt-12 border-t-2 border-dashed border-[#D4D9DE]"
    >
      <Collapsible defaultOpen={true}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-amber-600" />
            <h3 className="text-[17px] font-semibold text-[#1C1C1E]">
              Actions
            </h3>
          </div>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-100">
              <ChevronDown className="w-5 h-5 transition-transform duration-200 data-[state=closed]:rotate-180" />
            </Button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Change MOC Champion */}
            <button
              onClick={onChangeMOCChampion}
              className="group flex items-start gap-4 p-5 bg-gradient-to-br from-amber-50 to-orange-50
                         border-2 border-amber-200 rounded-xl hover:border-amber-400 hover:shadow-lg
                         transition-all duration-200 text-left cursor-pointer"
            >
              <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center
                              shrink-0 group-hover:bg-amber-200 transition-colors">
                <UserCog className="w-6 h-6 text-amber-700" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-[15px] text-[#1C1C1E] mb-1">
                  Change MOC Champion
                </div>
                <div className="text-xs text-[#68737D]">
                  Reassign responsibility to a different champion
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-amber-600 opacity-0 group-hover:opacity-100
                                       transition-opacity shrink-0 mt-2" />
            </button>

            {/* Extend Temporary */}
            <button
              onClick={onExtendTemporary}
              className="group flex items-start gap-4 p-5 bg-gradient-to-br from-blue-50 to-cyan-50
                         border-2 border-blue-200 rounded-xl hover:border-blue-400 hover:shadow-lg
                         transition-all duration-200 text-left cursor-pointer"
            >
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center
                              shrink-0 group-hover:bg-blue-200 transition-colors">
                <Clock className="w-6 h-6 text-blue-700" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-[15px] text-[#1C1C1E] mb-1">
                  Extend Temporary
                </div>
                <div className="text-xs text-[#68737D]">
                  Extend the temporary MOC duration
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-blue-600 opacity-0 group-hover:opacity-100
                                       transition-opacity shrink-0 mt-2" />
            </button>

            {/* Change Team */}
            <button
              onClick={onChangeTeam}
              className="group flex items-start gap-4 p-5 bg-gradient-to-br from-purple-50 to-pink-50
                         border-2 border-purple-200 rounded-xl hover:border-purple-400 hover:shadow-lg
                         transition-all duration-200 text-left cursor-pointer"
            >
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center
                              shrink-0 group-hover:bg-purple-200 transition-colors">
                <Users className="w-6 h-6 text-purple-700" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-[15px] text-[#1C1C1E] mb-1">
                  Change Team
                </div>
                <div className="text-xs text-[#68737D]">
                  Transfer MOC to a different team
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-purple-600 opacity-0 group-hover:opacity-100
                                       transition-opacity shrink-0 mt-2" />
            </button>

            {/* Cancel MOC */}
            <button
              onClick={onCancelMOC}
              className="group flex items-start gap-4 p-5 bg-gradient-to-br from-red-50 to-rose-50
                         border-2 border-red-200 rounded-xl hover:border-red-400 hover:shadow-lg
                         transition-all duration-200 text-left cursor-pointer"
            >
              <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center
                              shrink-0 group-hover:bg-red-200 transition-colors">
                <XCircle className="w-6 h-6 text-red-700" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-[15px] text-[#1C1C1E] mb-1">
                  Cancel MOC
                </div>
                <div className="text-xs text-[#68737D]">
                  Cancel this MOC request
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-red-600 opacity-0 group-hover:opacity-100
                                       transition-opacity shrink-0 mt-2" />
            </button>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </section>
  );
};
