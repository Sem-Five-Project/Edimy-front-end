import React from "react";
import { BookOpen, Clock, Award, FileText, TrendingUp } from "lucide-react";

interface StatsCardProps {
  stats: {
    label: string;
    value: number;
    icon: any;
    color: string;
  }[];
}

const StatsCard: React.FC<StatsCardProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200 hover:-translate-y-1"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  {stat.label}
                </p>
                <p className="text-3xl font-bold text-gray-800 mt-1">
                  {stat.value}
                </p>
              </div>
              <div
                className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}
              >
                <Icon className="text-white" size={24} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-green-600">
              <TrendingUp size={14} className="mr-1" />
              <span className="text-sm font-medium">+12% this week</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCard;
