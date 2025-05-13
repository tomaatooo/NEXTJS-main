'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { addDoc, collection, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore'
import { db } from '../_components/firebase'
import { useUser } from '@clerk/nextjs' 
import { toast, Toaster } from 'sonner'
import { Eye, Pen, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

const Dashboard = () => {
  const { user, isLoaded } = useUser()
  const [isMember,setMember]=useState()
  const [val, setVal] = useState([])
  const [loading, setLoading] = useState(true)
  const [windowWidth, setWindowWidth] = useState(0)
  const router=useRouter()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWindowWidth(window.innerWidth)
      const handleResize = () => setWindowWidth(window.innerWidth)
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [])

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'User-data', id))
      setVal((prev) => prev.filter((item) => item.id !== id))
      toast.error('File Deleted')
    } catch (error) {
      console.error('Error deleting document: ', error)
    }
  }

  useEffect(() => {
    if (!isLoaded || !user) return

    const getData = async () => {
      try {
        const q = query(
          collection(db, 'User-data'),
          where('email', '==', user.emailAddresses[0].emailAddress)
        )
        
        const querySnapshot = await getDocs(q)
       const data = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }))
        
        setVal(data)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching documents:', error)
      }
    }

    getData()
  }, [isLoaded, user])

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
        setLoading(false)
      } catch (error) {
        console.error('Error fetching documents:', error)
      }
    }

    getData()
  }, [isLoaded, user])

  return (
    <div className="p-4">
      <h1 className="text-black font-bold text-3xl pl-4">
        Welcome back, <span className="text-pink-400">{user?.firstName}</span>
      </h1>

      <h4 className="text-white pl-4 mt-2">
        {!loading && val.length === 0 ? 'Workspace Empty' : 'Your Workspace'}
      </h4>

      <div
        className={`flex flex-wrap gap-4 mt-6 ${
          windowWidth >= 900 ? 'justify-start' : 'justify-center'
        }`}
      >
        {!loading &&
          val.map((value, index) => (
            <div key={index} className="text-center">
              <div className="bg-white rounded-xl shadow-md p-2 w-[190px] h-[240px] mb-1 overflow-hidden">
                <div
                  className="text-xs h-[80%] overflow-hidden px-1"
                  dangerouslySetInnerHTML={{ __html: value.text }}
                />
                <div className="flex justify-center gap-2 mt-2">
                  
                    <button className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-2 py-1 rounded" onClick={()=>{router.push(`/view/${value.id}`)}}>
                      <Eye/>
                    </button>
                  
                  <Link href={`/edit/${value.id}`}>
                    <button className="bg-green-500 hover:bg-green-600 text-white text-sm px-2 py-1 rounded">
                      <Pen/>
                    </button>
                  </Link>

                  {isMember?
                  <button
                    className="bg-red-500 hover:bg-red-600 text-white text-sm px-2 py-1 rounded"
                    onClick={() => handleDelete(value.id)}
                  >
                    <Trash2/>
                  </button>:''}
                </div>
              </div>
              <p className="text-white text-sm mt-1">{value.title}</p>
            </div>
          ))}
      </div>

      <Toaster richColors />
    </div>
  )
}

export default Dashboard
