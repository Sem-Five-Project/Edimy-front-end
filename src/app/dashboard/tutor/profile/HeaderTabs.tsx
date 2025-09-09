import React from "react";
import { Plus } from "lucide-react";

interface HeaderTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const HeaderTabs: React.FC<HeaderTabsProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="flex items-center space-x-3">
      <div className="flex bg-white rounded-xl shadow-md p-1">
        {["schedule", "classes", "analytics"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium capitalize ${
              activeTab === tab
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-600 hover:text-blue-600"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
};

export default HeaderTabs;
