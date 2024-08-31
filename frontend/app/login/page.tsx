"use client";

import LockClosedIcon from "@heroicons/react/24/outline/LockClosedIcon";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { setToastParam } from "@/utils";
import { TokenResponse } from "@/backend";
import { useSocket } from "@/components/SocketProvider";

export default function Login() {
  const router = useRouter();
  const auth = useSocket();
  const query = useSearchParams();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  useEffect(() => {
    if (auth?.isAuthenticated) {
      router.replace("/");
    }else{
      if(query.get("id")){
        const session = query.get("session")
        auth?.setTempId(session)
        googleRedirect(query.get("id"), query.get("email"), session)
      }
    }
  }, []);

  const googleRedirect = async (id : any, email: any, sessionId: any) => {
    const res = await fetch(process.env.NEXT_PUBLIC_SERVER_URL + "/auth/redirect",{
      method: "POST",
      body: JSON.stringify({id: Number(id), email, sessionId}),
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      cache:"no-store"
    });

    if (res.ok) {
      router.replace("/");
    }else{
      toast.error("Problem with redirect!!", setToastParam(4000, "top-center"));
    }
  }

  
  const handleSubmission = async (e : FormEvent<HTMLFormElement>)  => {
      e.preventDefault();

      if(email=="" || password==""){
        toast.error("Input Fields can't be empty!!", setToastParam(2000, "top-center"));
        return
      }

      const form = { email, password };

      try{
        const res = await fetch(process.env.NEXT_PUBLIC_SERVER_URL + "/login", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            //Accept: "application/json",
          },
          body: JSON.stringify(form),
          cache: "no-store",
        });
  
  
        if (res.ok) {
            //sendCookie()
            router.replace("/");
        }else if(res.status==400){
          toast.error("Invalid Email or Password!!", setToastParam(4000, "top-center"));
        }else {
          toast.warn("Problem with server. Try again after few mintues!!", setToastParam(3000, "top-center"));
        }
      }catch(ex){
          toast.warn("Problem with server. Try again after few mintues!!", setToastParam(3000, "top-center"));
      }
    
    
  };

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_SERVER_URL}/auth/google`;
  };


  return (
    <div className="w-screen h-screen lg:bg-gray-100">
      <div className="border"></div>
      <div className="xl:w-1/3 md:w-3/5 mx-auto rounded-xl lg:shadow-xl p-10 bg-white lg:mt-12">
        <div className="mt-3 flex items-center gap-3">
          <img
            width={100}
            height={100}
            src="https://api.dicebear.com/6.x/big-smile/svg?seed=rainbow"
            alt="avt"
            loading="lazy"
          />
          <p className="text-5xl font-serif">Welcome to FundX</p>
        </div>

        <div className="flex gap-2 items-center mt-8">
          <LockClosedIcon className="w-6 h-6" />
          <p className="text-3xl font-serif">Sign In</p>
        </div>

        <p className="text-sm text-gray-400 mt-2">
          Please enter your login details.
        </p>
        <form onSubmit={handleSubmission} className="flex flex-col gap-4 mt-6">
          <div className="relative">
            <input
              name="email"
              type="text"
              value={email}
              id="floating_outlined"
              className="block border border-gray-300 px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              placeholder=" "
              onChange={(e) => setEmail(e.currentTarget.value)}
            />
            <label
              htmlFor="floating_outlined"
              className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
            >
              Email
            </label>
          </div>

          <div className="relative">
            <input
              name="password"
              type="text"
              value={password}
              id="floating_outlined2"
              className="block border border-gray-300 px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              placeholder=" "
              onChange={(e) => setPassword(e.currentTarget.value)}
            />
            <label
              htmlFor="floating_outlined2"
              className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1 peer-focus: rounded-xl"
            >
              Password
            </label>
          </div>

          <button
            className="p-3 px-6 bg-yellow-300 rounded-xl w-1/3 mx-auto mt-4 font-medium hover:bg-yellow-200"
            type="submit"
          >
            Sign In
          </button> 
        </form>
        <div className="flex flex-row gap-2 justify-center items-center mt-4">
          <div className="basis-2/5 border border-gray-300"></div>
          <div className="text-sm">or</div>
          <div className="basis-2/5 border border-gray-300"></div>
        </div>
        <div className="flex items-center gap-4">
            <div
                className="flex items-center p-3 px-6 rounded-xl mx-auto mt-2 font-medium"
                
              >
                Sign In Using :
                <div className="hover:cursor-pointer" onClick={handleGoogleLogin}>
                  <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="40" height="40" viewBox="0 0 48 48">
                    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                  </svg>
                </div>
                
            </div>
        </div>
        <div className="flex items-center">
            <div
                className="p-3 px-6 rounded-xl mx-auto mt-4 font-medium"
              >
                Don't have an account? <span onClick={()=>router.push("/signup")} className=" text-blue-500 hover:cursor-pointer hover:text-blue-800">Sign Up</span>
            </div>
        </div>
      </div>
    </div>
  );
}
