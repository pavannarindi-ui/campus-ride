import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function Profile() {

  const [loading,setLoading] = useState(true)
  const [profile,setProfile] = useState(null)

  const [form,setForm] = useState({
    name:"",
    age:"",
    year:"",
    branch:"",
    phone:"",
    address:"",
    photoURL:""
  })

  useEffect(()=>{
    loadProfile()
  },[])

  const generateCustomerId = ()=>{
    return "CR-"+Math.floor(100000+Math.random()*900000)
  }

  const loadProfile = async ()=>{

    const user = auth.currentUser

    if(!user){
      setLoading(false)
      return
    }

    const refDoc = doc(db,"users",user.uid)

    const snap = await getDoc(refDoc)

    if(snap.exists()){

      const data = snap.data()

      setProfile(data)
      setForm(data)

    }

    setLoading(false)
  }

  const handleImageUpload = (e)=>{

    const file = e.target.files[0]

    if(file){

      const reader = new FileReader()

      reader.onloadend = ()=>{
        setForm({...form,photoURL:reader.result})
      }

      reader.readAsDataURL(file)
    }

  }

  const saveProfile = async(e)=>{

    e.preventDefault()

    const user = auth.currentUser

    if(!user){
      alert("Please login first")
      return
    }

    const data = {
      ...form,
      customer_id: profile?.customer_id || generateCustomerId(),
      email:user.email
    }

    await setDoc(doc(db,"users",user.uid),data)

    setProfile(data)

    alert("Profile Saved Successfully 🚀")
  }

  if(loading){

    return(
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        Loading Profile...
      </div>
    )

  }

  /* PROFILE FORM */

  if(!profile){

    return(

      <div className="min-h-screen bg-black flex items-center justify-center px-6 text-white">

        <form
        onSubmit={saveProfile}
        className="w-full max-w-lg bg-gray-900 p-10 rounded-3xl border border-cyan-500/30 shadow-xl">

        <h2 className="text-3xl font-bold text-cyan-400 mb-8 text-center">
        Create Profile
        </h2>

        <div className="space-y-4">

        <input
        placeholder="Full Name"
        value={form.name}
        onChange={(e)=>setForm({...form,name:e.target.value})}
        required
        className="w-full p-3 bg-black border border-cyan-500/40 rounded-lg"
        />

        <input
        placeholder="Age"
        value={form.age}
        onChange={(e)=>setForm({...form,age:e.target.value})}
        required
        className="w-full p-3 bg-black border border-cyan-500/40 rounded-lg"
        />

        <input
        placeholder="Year"
        value={form.year}
        onChange={(e)=>setForm({...form,year:e.target.value})}
        required
        className="w-full p-3 bg-black border border-cyan-500/40 rounded-lg"
        />

        <input
        placeholder="Branch"
        value={form.branch}
        onChange={(e)=>setForm({...form,branch:e.target.value})}
        required
        className="w-full p-3 bg-black border border-cyan-500/40 rounded-lg"
        />

        <input
        placeholder="Phone"
        value={form.phone}
        onChange={(e)=>setForm({...form,phone:e.target.value})}
        required
        className="w-full p-3 bg-black border border-cyan-500/40 rounded-lg"
        />

        <input
        placeholder="Address"
        value={form.address}
        onChange={(e)=>setForm({...form,address:e.target.value})}
        required
        className="w-full p-3 bg-black border border-cyan-500/40 rounded-lg"
        />

        <div>
        <p className="text-sm text-gray-400 mb-2">Upload Profile Photo</p>

        <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        />
        </div>

        <button
        type="submit"
        className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-pink-500 hover:scale-105 transition font-semibold">
        Save Profile
        </button>

        </div>

        </form>

      </div>

    )

  }

  /* PROFILE VIEW */

  return(

    <div className="min-h-screen bg-black flex items-center justify-center px-6 text-white">

      <div className="w-full max-w-2xl bg-gray-900 p-12 rounded-3xl border border-cyan-500/30 shadow-xl">

      <div className="flex flex-col items-center mb-8">

      <img
      src={profile.photoURL || "https://i.pravatar.cc/200"}
      alt="profile"
      className="w-32 h-32 rounded-full border-4 border-cyan-400 object-cover"
      />

      <h2 className="text-2xl font-bold text-cyan-400 mt-4">
      {profile.name}
      </h2>

      <p className="text-gray-400">
      {profile.branch} • {profile.year}
      </p>

      </div>

      <div className="grid grid-cols-2 gap-6 text-sm">

      <div>
      <span className="text-gray-400">Customer ID</span>
      <p>{profile.customer_id}</p>
      </div>

      <div>
      <span className="text-gray-400">Age</span>
      <p>{profile.age}</p>
      </div>

      <div>
      <span className="text-gray-400">Phone</span>
      <p>{profile.phone}</p>
      </div>

      <div>
      <span className="text-gray-400">Branch</span>
      <p>{profile.branch}</p>
      </div>

      <div className="col-span-2">
      <span className="text-gray-400">Address</span>
      <p>{profile.address}</p>
      </div>

      </div>

      </div>

    </div>

  )

}