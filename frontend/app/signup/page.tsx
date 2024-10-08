"use client";

import { SignUpResponse } from "@/backend";
import { setToastParam } from "@/utils";
import LockClosedIcon from "@heroicons/react/24/outline/LockClosedIcon";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function SignUp() {
  const router = useRouter();

  const [fname, setFname] = useState<string>("");
  const [lname, setLname] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleSubmission = async (e : FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      let errors = [];

      if (fname=="") errors.push("First Name");
      if (email=="") errors.push("Email");
      if (password=="") errors.push("Password");
  
      if (errors.length > 0) {
        toast.error(errors.join(", ")+"  required!!", setToastParam(2000, "top-center"));
        return
      }

      const form = { lname, fname, email, password };

      try{
        const res = await fetch(process.env.NEXT_PUBLIC_SERVER_URL + "/generateOtp", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(form),
          cache: "no-store",
        });
  
        //const result : SignUpResponse = await res.json();
  
        if (res.ok) {
          router.push(`/signup/otp?email=${email}`);
        } else if(res.status==400 || res.status==404){
          toast.error("Email already exists!!", setToastParam(2000, "top-center"));
        }else{
          toast.warn("Problem with server. Try again after few mintues!!", setToastParam(2000, "top-center"));
        }
      }catch(ex){
        toast.warn("Problem with server. Try again after few mintues!!", setToastParam(2000, "top-center"));
      }
    
  };

  return (
    <div className="w-screen h-screen lg:bg-gray-100">
      <div className="border"></div>
      <div className="lg:w-1/3 md:w-3/5 mx-auto rounded-xl lg:shadow-xl p-10 bg-white lg:mt-12">
        <div className="mt-3 flex items-center gap-3">
          <img
            width={100}
            height={100}
            src="https://api.dicebear.com/6.x/big-smile/svg?seed=happy"
            alt="avt"
            loading="lazy"
          />
          <p className="text-5xl font-serif">Welcome to FundX</p>
        </div>

        <div className="flex gap-2 items-center mt-10">
          <LockClosedIcon className="w-6 h-6" />
          <p className="text-3xl font-serif">Sign Up</p>
        </div>

        <p className="text-sm text-gray-400 mt-2">Please enter your details.</p>
        <form onSubmit={handleSubmission} className="flex flex-col gap-4 mt-6">
          <div className="flex gap-2 mx-auto">
            <div className="relative">
              <input
                name="fname"
                type="text"
                value={fname}
                id="floating_outlined"
                className="block border border-gray-300 px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                placeholder=" "
                onChange={(e) => setFname(e.currentTarget.value)}
              />
              <label
                htmlFor="floating_outlined"
                className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
              >
                First Name
              </label>
            </div>

            <div className="relative">
              <input
                name="lname"
                type="text"
                value={lname}
                id="floating_outlined"
                className="block border border-gray-300 px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                placeholder=" "
                onChange={(e) => setLname(e.currentTarget.value)}
              />
              <label
                htmlFor="floating_outlined"
                className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
              >
                Last Name
              </label>
            </div>
          </div>

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
            Sign Up
          </button>
        </form>
        <div className="flex items-center">
            <div
                className="p-3 px-6 rounded-xl mx-auto mt-4 font-medium"
              >
                Have an account? <span onClick={()=>router.push("/login")} className=" text-blue-500 hover:cursor-pointer hover:text-blue-800">Log In</span>
            </div>
        </div>
      </div>
    </div>
  );
}
