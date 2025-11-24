import FriendsList from "@/components/friends/FriendsList";
import { Users } from "lucide-react";

interface ProfileFriendsProps {
  userId: number;
  isCurrentUser: boolean;
}

export default function ProfileFriends({ userId, isCurrentUser }: ProfileFriendsProps) {
  return (
    <div className="h-full flex flex-col">
      {/* Gradient Header */}
      <div className="flex-shrink-0 bg-gradient-to-r from-blue/20 to-blue/5 border-b border-white/10">
        <div className="flex items-center gap-3 px-6 py-5">
          <div className="p-2 bg-blue/20 rounded-xl">
            <Users size={24} color="#7ac7c4" strokeWidth={2} />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Friends
          </h2>
        </div>
      </div>

      {/* Friends List */}
      <div className="flex-1 overflow-hidden">
        <FriendsList userId={userId} isCurrentUser={isCurrentUser} />
      </div>
    </div>
  );
}