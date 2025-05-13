"use client"

import { useState, useEffect } from "react";
import { getBase64 } from './helper/imageHelper';
import Popup from './Modal'
import { GoogleGenerativeAI } from "@google/generative-ai";
import Image from "next/image";



const AiWithImage = () => {

  const apiKey= process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY;

if (!apiKey) {
  console.error("API Key is not defined. Check your .env.local file.");
}

const genAI = new GoogleGenerativeAI(apiKey);

const [imageInlineData, setImageInlineData] = useState("");
const [image, setImage] = useState("");
const [airesponse, setResponse] = useState("");
const [openModal,setOpenModal]=useState(false)
const [loading,setLoading]=useState(false)


useEffect(() => {
  if (!openModal) {
    setImage("");           
    setResponse("");         
    setImageInlineData("");  
  }
}, [openModal]); 



async function aiImageRun() {
  setResponse(""); 

  setLoading(true)

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    const result = await model.generateContent([
      { text: "Extract the English text from the image, otherwise return 'OOPS, NO TEXT DETECTED'." },
      imageInlineData, 
    ]);

    const response = await result.response;
    const text = await response.text(); 
    console.log("AI Response:", text);
    setResponse(text);
    
  } catch (error) {
    console.error("Error in AI processing:", error);
  }
  setLoading(false)
}

const handleImageChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  try {
    const base64Image = await getBase64(file);
    setImage(base64Image);

    const imageInlineData = await fileToGenerativePart(file);
    setImageInlineData(imageInlineData);
    setOpenModal(true);
  } catch (error) {
    console.error("Error handling image:", error);
  }
};

function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

async function fileToGenerativePart(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result.split(",")[1]; 
      resolve({
        inlineData: {
          data: base64String,
          mimeType: file.type, 
        },
      });
    };
    reader.readAsDataURL(file);
  });
}


  return (

    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      
      <div className="relative">
        <input
          type="file"
          accept="image/png,image/jpg,image/jpeg"
          id="upload"
          className="hidden"
          onChange={handleImageChange}
        />
        <label
          htmlFor="upload"
          className=" items-center text-center bg-primary text-white px-16 py-10 rounded-lg my-9 hover:bg-blue-600 transition"
        >
        Upload Image
        </label>
      </div>
      
      {image&&<Popup loading={loading} image={image} toggle={setOpenModal} extract={aiImageRun}  view={openModal} aiResponse={airesponse} />}
    </div>
  );
};

export default AiWithImage;
