"use client"

import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
  
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { toast,Toaster } from "sonner";
import {db} from '../../../_components/firebase'
import { collection, addDoc, query, where, getDocs, updateDoc, doc } from 'firebase/firestore'
import { useRouter } from "next/navigation";

export default function App({image,view,toggle,aiRun,aiResponse,extract,loading}) {
  const [isOpen, setIsOpen] = useState(view); 
  
  const router=useRouter()
  const {user,isSignedIn}=useUser()

  const saveToDb = async () => {
  try {
    const userEmail = user.emailAddresses[0].emailAddress
    const q = query(collection(db, 'User-info'), where('email', '==', userEmail))
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      toast.error('User info not found.')
      return
    }

    const userDoc = querySnapshot.docs[0]
    const userRef = doc(db, 'User-info', userDoc.id)
    const currentCredit = userDoc.data().credit || 0
    const isMembership = userDoc.data().isMembership

  
    if (currentCredit <= 0 && !isMembership) {
      toast.error('No credits left. Please upgrade your plan.')
      setTimeout(() => {
      router.push('/dashboard/pricing')
    }, 2000)
      
      return
    }

    // Save document
    await addDoc(collection(db, "User-data"), {
      fname: user.firstName,
      lname: user.lastName,
      email: userEmail,
      title: "Untitled",
      text: aiResponse,
      private: true
    })

    // Reduce credit by 1 only if not a member
    if (!isMembership) {
      await updateDoc(userRef, {
        credit: currentCredit - 1
      })
    }

    toast.success('Saved Successfully')
    setTimeout(() => {
      router.push('/dashboard')
    }, 2000)

  } catch (error) {
    console.error('Save error:', error)
    toast.error('Something went wrong while saving.')
  }
}


  const onOpenChange = (open) => setIsOpen(open);
  return (
    <div className="flex flex-col gap-2">


<Dialog open={view} onOpenChange={toggle}>
      <DialogContent className="w-full max-w-lg p-6 flex flex-col items-center text-center max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Preview</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4">
          <Image src={image} alt="Preview Image" height={200} width={200} className="rounded-lg shadow-md" />
          <DialogDescription className="text-gray-600 max-h-40 overflow-y-auto px-2">
            {loading ? 'Loading...' : aiResponse}
          </DialogDescription>
          {aiResponse==''?<Button className="mt-2" onClick={extract} disabled={loading}>Extract</Button>:isSignedIn?<div className="w-full flex justify-center gap-4 p-4">
  
  <Button onClick={saveToDb}>Save</Button>
</div>:'Sign In to explore additional features'}
          
        </div>
      </DialogContent>
    </Dialog>

    <Toaster richColors/>
    </div>
  );
}

