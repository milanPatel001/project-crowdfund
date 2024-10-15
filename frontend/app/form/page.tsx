"use client";

import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { setToastParam } from "@/utils";
import { useSocket } from "@/components/SocketProvider";
import Navbar from "@/components/Navbar";
import { FundData, FundsData } from "@/backend";


export default function Form() {
  const router = useRouter();
  const auth = useSocket();

  const [goal, setGoal] = useState<number>(1000);
  const [title, setTitle] = useState<string>("");
  const [story, setStory] = useState<string>("");
  const [beneficiary, setBen] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [state, setState] = useState<string>("");
  const [country, setCountry] = useState<string>("");
  const [zip, setZip] = useState<string>("");
  const [name, setName] = useState<string>("");

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log(file.size)
      setSelectedImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmission = async (event: FormEvent) => {
      event.preventDefault();

      if(country=="" || state=="" || city=="" || zip=="" || story==""||title==""||name==""){
        toast.error("Input Fields can't be empty!!", setToastParam(2000, "top-center"));
        return
      }

      if(goal <= 100){
        toast.error("Donation goal gotta be atleast $100!!", setToastParam(2000, "top-center"));
        return
      }

      if(!selectedImage){
        toast.error("Select an image to upload!!", setToastParam(2000, "top-center"));
        return
      }

      const place = city+", "+state;

      const form = new FormData();
      form.append('name', name)
      form.append('story', story)
      form.append('title', title)
      form.append('beneficiary', (beneficiary=="") ? name : beneficiary)
      form.append('goal', goal.toString())
      form.append('place', place)
      form.append('img', selectedImage);


      try {
        const res = await fetch(process.env.NEXT_PUBLIC_SERVER_URL+'/createCrowdFund', {
          method: "POST",
          credentials: "include",
          // headers: {
          //   "Content-Type": "multipart/form-data",
          //   //Accept: "application/json",
          // },
          body: form,
          cache: "no-store",
        });
  
        if (!res.ok) {
          if(res.status==403){
            auth?.logout()
            return
          }
          
          toast.error("Bad request", setToastParam(2000, "top-center"));
          return
        }

        
        toast.success("Crowdfund successfully created!!", setToastParam(2000, "top-center"));

        const url = await res.text();

        // update global funds data
        let fundsData : FundsData = [...auth?.fundsData!]
        const fund : FundData = {
            id: fundsData.length + 1000,
            name: name,
            story: story,
            beneficiary_name: beneficiary,
            place: place,
            title: title,
            goal: goal,
            total_donation: 0,
            donation_num: 0,
            created_at: new Date().toISOString().slice(0, 10),
            img: url,
            comments:[],
            recentdonators:[]
        }

        fundsData.push(fund)
        auth?.fundIdMap.current.set(auth?.fundsData.length+1000, auth?.fundsData.length)
        auth?.setData(fundsData)
        

        router.replace("/")
  
      } catch (error) {
        toast.warn("There's some problem uploading the data!!!", setToastParam(2000, "top-center"));
      }
  }

  useEffect(() => {
    if (!auth?.isAuthenticated) {
      router.replace("/login");
    }
  }, []);


  return (
    <div className="w-full h-full lg:bg-gray-50">
      <Navbar />
      <div className="xl:w-3/5 md:w-3/5 mx-auto rounded-xl">
        <div className="mt-3 flex items-center gap-3 justify-center mx-auto rounded-xl p-4">
          <img
            width={100}
            height={100}
            src="https://api.dicebear.com/6.x/big-smile/svg?seed=rainbow"
            alt="avt"
            loading="lazy"
          />
          <p className="text-5xl font-serif">Create a CrowdFund</p>
        </div>

    
        <form onSubmit={handleSubmission} className="flex flex-col gap-4 mt-6">
          
          {/* Basic Info */}
          <div className="flex flex-col rounded-xl p-8 shadow-xl bg-white items-center">
                {/* Upper Side */}
                <div className="flex flex-col text-center">
                  <div>
                    <p className="font-serif font-medium text-xl">
                      Enter the name that you would like to display on crowdfund page as your name
                    </p>
                  </div>
                </div>

                {/* Lower Side */}
                <div className="flex flex-col gap-4 mt-6">
                  <div className="relative">
                    <input
                      name="name"
                      type="text"
                      value={name}
                      id="floating_outlined"
                      className="block border border-gray-300 px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                      placeholder=" "
                      onChange={(e) => setName(e.currentTarget.value)}
                    />
                    <label
                      htmlFor="floating_outlined"
                      className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
                    >
                      Name
                    </label>
                  </div>
                </div>
                
                <div className="flex flex-col text-center mt-6">
                  <div>
                    <p className="font-serif font-medium text-xl">
                       If the donation is for somebody else, then enter the beneficiary name, otherwise leave it empty.

                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-4 mt-6">
                  <div className="relative">
                    <input
                      name="beneficiary"
                      type="text"
                      value={beneficiary}
                      id="floating_outlined"
                      className="block border border-gray-300 px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                      placeholder=" "
                      onChange={(e) => setBen(e.currentTarget.value)}
                    />
                    <label
                      htmlFor="floating_outlined"
                      className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
                    >
                      Beneficiary
                    </label>
                  </div>
                </div>

          </div>


          {/* Goal */}
          <div className="flex flex-col gap-4 rounded-xl shadow-xl p-8 bg-white items-center">
                {/* Upper Side */}
                <div className="flex flex-col">
                    <div className="">
                      <p className="font-serif font-medium text-xl">Set your fundraising Goal (in USD)</p>
                    </div>
                </div>

                {/* Lower Side */}
                <div className="flex flex-col gap-4">
                  <div className="relative">
                    <input
                      name="goal"
                      type="text"
                      value={goal}
                      id="floating_outlined"
                      className="block border border-gray-300 px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                      placeholder=" "
                      onChange={(e) => setGoal(Number(e.currentTarget.value))}
                    />
                    <label
                      htmlFor="floating_outlined"
                      className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
                    >
                      Your Starting Goal
                    </label>
                  </div>

               
                  
                </div>
          </div>
         
         
         
          {/* Place */}
          <div className="flex flex-col rounded-xl p-8 shadow-xl bg-white items-center justify-center">
                {/* Upper Side */}
                <div className="flex flex-col text-center">
                  <div>
                    <p className="font-serif font-medium text-xl">
                      Where will the funds go?
                    </p>
                  </div>
                </div>

                {/* Lower Side */}
                <div className="flex flex-col gap-4 mt-6">

                  <div className="flex flex-row gap-4">
                    <div className="relative">
                      <input
                        name="city"
                        type="text"
                        value={city}
                        id="floating_outlined"
                        className="block border border-gray-300 px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                        placeholder=" "
                        onChange={(e) => setCity(e.currentTarget.value)}
                      />
                      <label
                        htmlFor="floating_outlined"
                        className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
                      >
                       City
                      </label>
                    </div>

                  <div className="relative">
                    
                    <input
                      name="state"
                      type="text"
                      value={state}
                      id="floating_outlined"
                      className="block border border-gray-300 px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                      placeholder=" "
                      onChange={(e) => setState(e.currentTarget.value)}
                    />
                    <label
                      htmlFor="floating_outlined"
                      className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
                    >
                      State
                    </label>
                  </div>
                  </div>
                 
                  <div className="flex flex-row gap-4">
                    <div className="relative">
                      
                      <input
                        name="state"
                        type="text"
                        value={country}
                        id="floating_outlined"
                        className="block border border-gray-300 px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                        placeholder=" "
                        onChange={(e) => setCountry(e.currentTarget.value)}
                      />
                      <label
                        htmlFor="floating_outlined"
                        className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
                      >
                        Country
                      </label>
                    </div>
                
                    <div className="relative">
                      <input
                        name="zip"
                        type="text"
                        value={zip}
                        id="floating_outlined"
                        className="block border border-gray-300 px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                        placeholder=" "
                        onChange={(e) => setZip(e.currentTarget.value)}
                      />
                      <label
                        htmlFor="floating_outlined"
                        className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
                      >
                        Zipcode
                      </label>
                    </div>
                  </div>
                  
                  
                </div>
          </div>

          {/* Title and Story */}
          <div className="flex flex-col rounded-xl p-8 shadow-xl bg-white items-center justify-center">
                {/* Upper Side */}
                <div className="flex flex-col text-center">
                  <div>
                    <p className="font-serif font-medium text-xl">
                      Enter the title and story behind raising the crowdfund that you would like to display on crowdfund page
                    </p>
                  </div>
                </div>

                {/* Lower Side */}
                <div className="flex flex-col gap-4 mt-6 w-full">
                  <div className="relative">
                    <input
                      name="title"
                      type="text"
                      value={title}
                      id="floating_outlined"
                      className="block border border-gray-300 px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                      placeholder=" "
                      onChange={(e) => setTitle(e.currentTarget.value)}
                    />
                    <label
                      htmlFor="floating_outlined"
                      className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
                    >
                      Title
                    </label>
                  </div>
                  {/* text area */}
                  <div>
                  <textarea id="story" rows={8} 
                    className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:outline-none"
                    placeholder="Write your story here..."
                    value={story}
                    onChange={(e) => setStory(e.currentTarget.value)}
                  ></textarea>
                  </div>
                  
                </div>
          </div>

          {/* Image upload */}
          <div className="flex flex-col rounded-xl p-8 shadow-xl bg-white items-center justify-center">
                {/* Upper Side */}
                <div className="flex flex-col text-center">
                  <div>
                    <p className="font-serif font-medium text-xl">
                      Upload a large image to be displayed on the crowdfund page.
                    </p>
                  </div>
                </div>

                {/* Lower Side */}
                <div className="flex flex-col gap-4 mt-6 w-full justify-center items-center">
                  <input type="file" accept="image/*" onChange={handleImageChange} />
                  {preview && <img src={preview} alt="Image preview" style={{ objectFit: "contain", width: '200px', height: '200px', }} />}
                  {/* <button className="p-3 px-6 bg-red-500 rounded-xl text-white w-1/3 mx-auto mt-4 font-medium hover:bg-blue-200">Upload</button> */}
                </div>
          </div>

          <button
              className="p-3 px-6 bg-blue-700 rounded-xl text-white w-1/3 mx-auto mt-4 mb-8 font-medium hover:bg-blue-200"
              type="submit"
            >
              Submit
          </button> 
          
        </form>       
      </div>
    </div>
  );
}
