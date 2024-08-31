"use client";

import Main from "@/components/Main";
import Navbar from "@/components/Navbar";
import { useSocket } from "@/components/SocketProvider";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export default function Home() {
  const s = useSocket();
  const router = useRouter();
  const hasRun = useRef<boolean>(false);

  
  useEffect(() => {
    console.log("Inside Page: " + s?.isAuthenticated);
    if (!s?.isAuthenticated && !hasRun.current) {
      hasRun.current = true
      s?.sendCookie().then(completed=> {
        if(!completed){
            router.replace("/login")
        }

        hasRun.current = false
      })
    }
  }, []);

  if (!s?.isAuthenticated) return <div></div>;
  return (
    <div className="flex flex-col">
      <Navbar />
      <Main />
    </div>
  );
}

//Home.tsx (Server Component)
// import ClientHome from '@/components/ClientHome';
// import { cookies } from 'next/headers';
// import { redirect } from 'next/navigation';

// async function verifyToken() {
//   const cookieStore = cookies();
//   const res = await fetch(process.env.NEXT_PUBLIC_SERVER_URL + "/verifyToken", {
//     method: "POST",
//     headers: {
//       Cookie: cookieStore.toString(),
//     },
//     credentials:"include"
//   });

//   if (!res.ok) {
//     redirect('/login');
//   }

//   return res.text();
// }

// export default async function Home() {
//   const id = await verifyToken();
  
//   return <ClientHome initialId={id} />;
// }

