"use client"

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Code, List, ListOrdered,
  Undo2, Redo2, Heading1, Heading2, Heading3, Quote
} from 'lucide-react'
import { doc, getDoc, updateDoc, collection, addDoc } from 'firebase/firestore'
import { db } from '../../_components/firebase'
import { useUser } from '@clerk/nextjs'
import { toast, Toaster } from 'sonner'

const MenuBar = ({ editor }) => {
  if (!editor) return null

  const Button = ({ onClick, icon: Icon, title }) => (
    <button
      onClick={onClick}
      className="bg-white text-black p-2 rounded hover:bg-slate-400 transition"
      title={title}
    >
      <Icon size={18} />
    </button>
  )

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <Button onClick={() => editor.chain().focus().toggleBold().run()} icon={Bold} title="Bold" />
      <Button onClick={() => editor.chain().focus().toggleItalic().run()} icon={Italic} title="Italic" />
      <Button onClick={() => editor.chain().focus().toggleUnderline().run()} icon={UnderlineIcon} title="Underline" />
      <Button onClick={() => editor.chain().focus().toggleStrike().run()} icon={Strikethrough} title="Strike" />
      <Button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} icon={Heading1} title="H1" />
      <Button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} icon={Heading2} title="H2" />
      <Button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} icon={Heading3} title="H3" />
      <Button onClick={() => editor.chain().focus().toggleBulletList().run()} icon={List} title="Bullet List" />
      <Button onClick={() => editor.chain().focus().toggleOrderedList().run()} icon={ListOrdered} title="Ordered List" />
      <Button onClick={() => editor.chain().focus().toggleCodeBlock().run()} icon={Code} title="Code Block" />
      <Button onClick={() => editor.chain().focus().toggleBlockquote().run()} icon={Quote} title="Blockquote" />
      <Button onClick={() => editor.chain().focus().undo().run()} icon={Undo2} title="Undo" />
      <Button onClick={() => editor.chain().focus().redo().run()} icon={Redo2} title="Redo" />
    </div>
  )
}

export default function EditorPage() {
  const { user } = useUser()
  const router = useRouter()
  const { id } = useParams()
  const [title, setTitle] = useState('Untitled')
  const [initialContent, setInitialContent] = useState('<p>Loading...</p>')
  const [isEdit, setIsEdit] = useState(false)
  const [docOwner, setDocOwner] = useState(null)

  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: initialContent,
  })

  useEffect(() => {
    const fetchDoc = async () => {
      if (!id) return
      try {
        const docRef = doc(db, 'User-data', id)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          const data = docSnap.data()
          setTitle(data.title)
          setInitialContent(data.text)
          setIsEdit(true)
          setDocOwner(data.email)
          editor?.commands.setContent(data.text)
        } else {
          toast.error('Document not found.')
        }
      } catch (err) {
        console.error('Error loading document:', err)
      }
    }
    fetchDoc()
  }, [id, editor])

  const handleSaveOrUpdate = async () => {
    if (!editor || !user) return

    const html = editor.getHTML()

    if (isEdit) {
      if (user.primaryEmailAddress.emailAddress !== docOwner) {
        alert('You do not have permission to update this document.')
        return
      }
      try {
        await updateDoc(doc(db, 'User-data', id), {
          text: html,
          title,
        })
        toast.success('Updated successfully!')
        setTimeout(() => router.push('/dashboard'), 2000)
      } catch (error) {
        console.error('Update failed:', error)
      }
    } else {
      try {
        await addDoc(collection(db, 'User-data'), {
          fname: user.firstName,
          lname: user.lastName,
          email: user.primaryEmailAddress.emailAddress,
          title: title || 'Untitled',
          text: html,
          private: true,
        })
        toast.success('Saved successfully!')
        setTimeout(() => router.push('/dashboard'), 2000)
      } catch (error) {
        console.error('Save failed:', error)
      }
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 text-black">
      <Toaster richColors />
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2 items-center">
          <p
            contentEditable
            id="doctitle"
            suppressContentEditableWarning={true}
            className="text-2xl font-semibold outline-none text-black"
            onBlur={(e) => setTitle(e.target.innerText)}
          >
            {title}
          </p>
          <i className="fa-solid fa-pen-to-square text-black" />
        </div>
        <button
          onClick={handleSaveOrUpdate}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          {isEdit ? 'Update' : 'Save'}
        </button>
      </div>

      <MenuBar editor={editor} />
      <div className="border border-gray-300 rounded-md min-h-[300px] p-4 bg-white text-black">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
