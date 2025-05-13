'use client'

import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Layout, Shield } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import UploadImg from './UploadImg'
import { useState,useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { useUser } from '@clerk/clerk-react'
import { db } from '../../_components/firebase'


const SideBar = () => {
  const router = useRouter()
  const pathname = usePathname()
  const [val,setVal]=useState([])
  const {user,isLoaded}=useUser()
  const [isMember,setMember]=useState()
  

  useEffect(() => {
    const getData = async () => {
        try {
          const q = query(
            collection(db, "User-data"),
            where("email", "==", user.emailAddresses[0].emailAddress)
          );
      
          const querySnapshot = await getDocs(q);
          const data = querySnapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
          }));

          const newData = [...(val || []), ...data];
          setVal(newData);

          console.log(newData.length);
      
          return data;
        } catch (error) {
          console.error("Error fetching documents:", error);
        }
      }
      
    getData();
  },[user])


  useEffect(() => {
      if (!isLoaded || !user) return
  
      const getData = async () => {
        try {
          const q = query(
            collection(db, 'User-info'),
            where('email', '==', user.emailAddresses[0].emailAddress)
          )
          
          const querySnapshot = await getDocs(q)
         const data = querySnapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
          }))
          setMember(data[0].isMembership)
         
        } catch (error) {
          console.error('Error fetching documents:', error)
        }
      }
  
      getData()
    }, [isLoaded, user])


  const backgroundColor = pathname === "/dashboard" ? "#e1e6eb" : ""
  const backgroundColor2 = pathname === "/dashboard/pricing" ? "#e1e6eb" : ""

  return (
    <div className='shadow-md h-screen p-3'>
      <Link href='/'>
        <Image src='/logo.svg' alt='logo' height={70} width={180} />
      </Link>

      <div className='mt-10'>
        <UploadImg>
          <Button className='w-full' onClick={()=>router.push('/services/docreader')}>+ New</Button>
        </UploadImg>
      </div>

      <div
        className='flex gap-2 items-center p-3 mt-5 hover:bg-slate-200 rounded-lg cursor-pointer'
        style={{ backgroundColor }}
        onClick={() => router.push('/dashboard')}
      >
        <Layout />
        <h2>Workspace</h2>
      </div>

      <div
        className='flex gap-2 items-center p-3 mt-1 hover:bg-slate-200 rounded-lg cursor-pointer'
        style={{ backgroundColor: backgroundColor2 }}
        onClick={() => router.push('/dashboard/pricing')}
      >
        <Shield />
        <h2>Upgrade</h2>
      </div>

      <div className="absolute bottom-24 w-[80%]">


{isMember?
  <Progress
    value={100} 
    className="w-full h-2 mb-1 bg-slate-300"
  />:<Progress value={(val.length > 5 ? 5 : val.length) * 20}  className="w-full h-2 mb-1 bg-slate-300"/>}

  {isMember?'':
  <p className="text-xs font-bold">
    {val.length > 5 ? '5' : val.length} out of 5 Uploaded
  </p>
}
  {isMember?<p className="text-[10px]">Premium Member</p>:<p className="text-[10px]">Get Premium</p>}
  
</div>

     
    </div>
  )
}

export default SideBar
