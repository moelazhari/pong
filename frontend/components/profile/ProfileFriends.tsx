import FriendsList from "@/components/friends/FriendsList";
import { User2 } from "lucide-react";

interface ProfileFriendsProps {
  userId: number;
  isCurrentUser: boolean;
}

export default function ProfileFriends({ userId, isCurrentUser }: ProfileFriendsProps) {
  return (
    <div className="h-full flex flex-col grow rounded-3xl shadow-2xl bg-white bg-opacity-20 backdrop-blur-lg drop-shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 rounded-t-3xl py-4 bg-gradient-to-b from-black/10 to-transparent">
        <div className="h-[56px] w-fit flex justify-center items-center m-auto px-4 border-b-2 border-blue">
          <User2 size={28} color="#7ac7c4" strokeWidth={2} />
          <h2 className="text-[28px] ml-4 font-semibold">Friends</h2>
        </div>
      </div>

      {/* Friends List */}
      <div className="flex-1 overflow-hidden">
        <FriendsList userId={userId} isCurrentUser={isCurrentUser} />
      </div>
    </div>
  );
}