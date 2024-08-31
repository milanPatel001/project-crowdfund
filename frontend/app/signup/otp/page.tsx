"use client"

import { setToastParam } from "@/utils";
import LockClosedIcon from "@heroicons/react/24/outline/LockClosedIcon";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useRouter, useSearchParams } from "next/navigation";

export default function OTP() {
    const router = useRouter();
    const query = useSearchParams();

    const [otp, setOtp] = useState<string>("")

    const handleSubmission = async (e : FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if(otp==""){
          toast.error("OTP required!!", setToastParam(1000, "top-center"));
          return
        }
  
        const form = { otp, email: query.get("email") };

        try{
          const res = await fetch(process.env.NEXT_PUBLIC_SERVER_URL + "/verifyOtp", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              //Accept: "application/json",
            },
            body: JSON.stringify(form),
            cache: "no-store",
          });
    
          //const result : SignUpResponse = await res.json();
    
          if (res.ok) {
            toast.success("Account Created", setToastParam(1000, "top-center"));
            router.replace("/login");
          } else if(res.status==400){
            toast.error("You entered wrong OTP!!!", setToastParam(2000, "top-center"));
          }else{
            toast.warn("Problem with server. Try again after few mintues!!", setToastParam(2000, "top-center"));
          }
        }catch(ex){
          toast.warn("Problem with server. Try again after few mintues!!", setToastParam(2000, "top-center"));
        }
    };

    useEffect(()=>{
        if(!query.get("email") || query.get("email") == "") router.replace("/login")
    },[])

    if(!query.get("email") || query.get("email") == "") return <div></div>

    return  (
    <div className="w-screen h-screen lg:bg-gray-100">
    <div className="border"></div>
    <div className="lg:w-1/3 mt-20 mx-auto rounded-xl lg:shadow-xl p-10 bg-white">
      
      
      <div className="flex gap-2 items-center justify-center mt-10">
        <LockClosedIcon className="w-6 h-6" />
        <p className="text-3xl font-serif">OTP Verification</p>
      </div>
      <p className=" text-center text-sm text-gray-800 mt-2">Enter The OTP sent on your email</p>
      <form onSubmit={handleSubmission} className="flex flex-col gap-4 mt-6">
        <div className="flex gap-2 mx-auto">
        
          <div className="relative">
          
            <input
              name="otp"
              type="text"
              value={otp}
              id="floating_outlined"
              className="block border border-gray-300 px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              placeholder=" "
              onChange={(e) => setOtp(e.currentTarget.value)}
            />
            <label
              htmlFor="floating_outlined"
              className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
            >
              OTP
            </label>
          </div>

        </div>

        <button
          className="p-3 px-6 bg-yellow-300 rounded-xl w-1/3 mx-auto mt-4 font-medium hover:bg-yellow-200"
          type="submit"
        >
          Verify
        </button>
      </form>
      <div className="flex items-center">
            <div
                className="p-3 px-6 rounded-xl mx-auto mt-8 font-medium"
              >
                Didn't receive an OTP? <span onClick={()=>router.push("/login")} className=" text-blue-500 hover:cursor-pointer hover:text-blue-800">Resend</span>
            </div>
        </div>
    </div>
  </div>
)

}