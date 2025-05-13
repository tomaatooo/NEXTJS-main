"use client"

import Link from 'next/link'
import React from 'react'
import { useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import { addDoc, collection,  getDocs, query, where } from 'firebase/firestore'
import {db} from './firebase'

const Hero = () => {
  const { user, isSignedIn } = useUser();

  useEffect(() => {
    if (!isSignedIn || !user) return;

    const validateUser = async () => {
      try {
        const email = user.primaryEmailAddress?.emailAddress;
        if (!email) {
          console.warn("User email not available.");
          return;
        }

        const userRef = collection(db, "User-info");
        const q = query(userRef, where("email", "==", email));

        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          console.log("User exists.");
        } else {
          console.log("User not found.");

          const userAdd=async()=>{
            await addDoc(collection(db, "User-info"), {
              credit: 5,
              email:user.emailAddresses[0].emailAddress,
              fname: user.firstName,
              lname: user.lastName,
              isMembership: false
            })
          }
          userAdd();
          console.log("user Added")

        }
      } catch (err) {
        console.error("Error validating user:",err);
      }
    };

    validateUser();
  }, [ user]);


  return (    
    <section className="bg-gray-50 ">
  <div className="mx-auto max-w-screen-xl px-4 py-32 lg:flex lg:h-screen lg:items-center">
    <div className="mx-auto max-w-xl text-center">
      <h1 className="text-3xl font-extrabold sm:text-5xl">
      Extract Text from Images with the help of <span className='text-primary'>AI</span>
      </h1>
    {/*console.log("databvase",db)*/}
      <p className="mt-4 sm:text-xl/relaxed text-slate-700">
        Our powerful tool allows you to effortlessly extract texts from images in just a few clicks. Say goodbye to manual typing and let our technology do the work for you.


      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link href={'/services'} >
        <div
          className="block w-full rounded-sm bg-primary px-12 py-3 text-sm font-medium text-white shadow-sm hover:bg-purple-600 focus:ring-3 focus:outline-hidden sm:w-auto"
        >
          Get Started
        </div>
        </Link>

        <a
          className="block w-full rounded-sm px-12 py-3 text-sm font-medium border  text-primary shadow-sm hover:text-purple-600 focus:ring-3 focus:outline-hidden sm:w-auto"
          href="#"
        >
          Watch
        </a>
      </div>
    </div>
  </div>
</section>
  )
}

export default Hero