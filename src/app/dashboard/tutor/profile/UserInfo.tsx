import React from "react";
import { User, Mail, Tag, Star, Users } from "lucide-react";

interface UserInfoProps {
  user: any;
}

const UserInfo: React.FC<UserInfoProps> = ({ user }) => {
  return user ? (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
      <div className="flex items-center space-x-6">
        {user.profileImage ? (
          <img
            src={user.profileImage}
            alt="Profile"
            className="w-20 h-20 rounded-2xl border-4 border-white/20 shadow-lg"
          />
        ) : (
          <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center border-4 border-white/20">
            <User className="text-white" size={32} />
          </div>
        )}
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-2">Welcome back, {user.username}!</h2>
          <div className="flex items-center space-x-6 text-blue-100">
            <div className="flex items-center">
              <Mail size={16} className="mr-2" />
              {user.email}
            </div>
            <div className="flex items-center">
              <Tag size={16} className="mr-2" />
              {user.role}
            </div>
          </div>
          <div className="flex items-center space-x-4 mt-3">
            <div className="flex items-center bg-white/20 rounded-lg px-3 py-1">
              <Star className="text-yellow-300 mr-1" size={16} />
              <span className="text-sm font-medium">4.9 Rating</span>
            </div>
            <div className="flex items-center bg-white/20 rounded-lg px-3 py-1">
              <Users className="mr-1" size={16} />
              <span className="text-sm font-medium">124 Students</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className="text-center py-12 text-blue-600 bg-blue-50 rounded-2xl">
      <User size={48} className="mx-auto mb-4 text-blue-400" />
      <p className="text-lg font-medium">Please log in to view your profile</p>
    </div>
  );
};

export default UserInfo;
