'use client'
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
const DashboardPage = () => {
  const { data: session, status } = useSession();
  console.log(session)
  const userRole = session?.user?.role; // Accessing the role from the session
  //const userRole = 'admin'; 
  const router = useRouter();
  if (!session) {
    router.push('/login'); 
    return null; 
  }
// Perform a role check
if (userRole !== 'admin') {
  // Redirect to another page if the user is not an admin
  router.push('/'); // Redirect to the home page or another page
  return null; // Or show a message indicating unauthorized access
}


  return (
   <>
   <h1>Dashboard</h1>
   <p>Hi {session?.user?.email}</p>
   {userRole && (
     <p>Your role is: {userRole}</p>
   )}
   </>
  )
}

export default DashboardPage;
