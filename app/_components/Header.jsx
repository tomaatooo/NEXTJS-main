"use client"

import React, { useEffect } from 'react'
import Image from "next/image";
import { Button } from '@/components/ui/button';
import { SignInButton, UserButton, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import db from './firebase'
import { addDoc, collection, doc, getDocs, query, where } from 'firebase/firestore'



const Header = () => {

    const {user}=useUser()
    const signedIn=user


  return (
    <div className='flex items-center justify-between p-3 border shadow-sm'>
        <div>
            <Link href={'/'}>
            <Image src={'/logo.svg'} alt='logo' height={70} width={180}/>
            </Link>
        </div>
        <div className='flex gap-5 items-center'>
            {signedIn?
            <Link href='/dashboard' >
            <Button variant='outline' className='shadow-md border'>Dashboard</Button></Link>:
            <SignInButton>
            <Button>Sign In</Button>
            </SignInButton>
            }
            <UserButton/>
        </div>
    </div>
  )
}

export default Header