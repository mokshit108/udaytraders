const ProfileOverview = ({ user }) => (
    <div className="bg-white border border-solid shadow-md rounded-md p-6 max-w-md mx-auto max-md:mt-20">
      <h2 className="text-2xl font-bold text-center text-sky-900 mb-6 border-b pb-2">Profile Details</h2>
      <div className="space-y-8 text-lg">
        <div className="flex items-center gap-4 font-montserrat font-medium ">
          <span className="text-gray-700">Username:</span>
          <span className="text-gray-800">{user.username}</span>
        </div>
        <div className="flex items-center gap-4 font-montserrat font-medium">
          <span className="text-gray-700">Email:</span>
          <span className="text-gray-800">{user.email}</span>
        </div>
        <div className="flex items-center gap-4 font-montserrat font-medium">
          <span className="text-gray-700">Phone:</span>
          <span className="text-gray-800">{user.phone}</span>
        </div>
      </div>
    </div>
  );
  
  export default ProfileOverview;