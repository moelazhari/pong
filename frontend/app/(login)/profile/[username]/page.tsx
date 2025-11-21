import ProfileComponent from "@/components/profile/ProfileComponent";

const Profile = async ({params}: { params: {username: string } }) => {
  const { username } = await params

  return <ProfileComponent username={username}/>
}
  
export default Profile;