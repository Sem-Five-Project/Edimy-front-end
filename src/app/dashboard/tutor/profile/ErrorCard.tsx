import React from "react";
import { X } from "lucide-react";

interface ErrorCardProps {
  error: string | null;
}

const ErrorCard: React.FC<ErrorCardProps> = ({ error }) => {
  if (!error) return null;
  return (
    <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl p-6 text-red-700 shadow-lg">
      <div className="flex items-center">
        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
          <X size={16} className="text-red-600" />
        </div>
        {error}
      </div>
    </div>
  );
};

export default ErrorCard;
