"use client";

import { useState, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useUser } from "@clerk/clerk-react";

const AiWithPres = () => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY;

  if (!apiKey) {
    console.error("API Key is not defined. Check your .env.local file.");
  }

  const {user,isSignedIn}=useUser()

  const genAI = new GoogleGenerativeAI(apiKey);

  const [imageInlineData, setImageInlineData] = useState("");
  const [image, setImage] = useState("");
  const [airesponse, setResponse] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reportText, setReportText] = useState(
    "Extracted data from the report will appear here. Get better recommendations by providing additional patient history and symptoms..."
  );
  const [chatHistory, setChatHistory] = useState([]);
  const [userMessage, setUserMessage] = useState("");

  useEffect(() => {
    if (!openModal) {
      setImage("");
      setResponse("");
      setImageInlineData("");
      setChatHistory([]);
    }
  }, [openModal]);

  useEffect(() => {
    if (openModal && imageInlineData) {
      aiImageRun();
    }
  }, [openModal, imageInlineData]);

  async function aiImageRun() {
    setResponse("");
    setLoading(true);

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    try {
      const result = await model.generateContent([
        {
          text: "You are a pharmacist. Read the prescription and summarize it with stating the medicines along with the direction of use and in case if it's not a prescription display SORRY",
        },
        imageInlineData,
      ]);

      const response = await result.response;
      const text = await response.text();
      console.log("AI Response:", text);
      setResponse(text);
      setReportText(text);
    } catch (error) {
      console.error("Error in AI processing:", error);
      setReportText("SORRY, something went wrong while processing the report.");
    }
    setLoading(false);
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

  const handleSend = async () => {
    if (!userMessage.trim()) return;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const updatedHistory = [...chatHistory, { role: "user", content: userMessage }];
    setChatHistory(updatedHistory);
    setUserMessage("");

    try {
      const result = await model.generateContent([
        {
          text: `You are a medical assistant and a doctor. Here's the prescription summary:\n"${reportText}".\n\nUser question: ${userMessage}`,
        },
      ]);

      const response = await result.response;
      const text = await response.text();

      setChatHistory((prev) => [...prev, { role: "model", content: text }]);
    } catch (error) {
      console.error("Chat error:", error);
      setChatHistory((prev) => [
        ...prev,
        { role: "model", content: "Sorry, I couldn't process your question." },
      ]);
    }
  };

  return (
    <div className="h-[calc(100vh-4.5rem)] p-2 flex flex-col md:flex-row gap-4">
      {/* Left Panel */}
      <div className="w-full md:w-1/3 h-full bg-[hsl(0,13%,81%)] p-4 rounded-lg border border-slate-700 flex flex-col">
        <h2 className="text-xl font-semibold mb-4">Report</h2>

        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-white file:text-black hover:file:bg-gray-100"
        />
        <button className="mt-4 w-full py-2 bg-white text-black font-semibold rounded">
          1. Upload File
        </button>

        <h3 className="mt-6 text-md font-semibold">Report Summary</h3>
        <p className="mt-2 text-black text-sm whitespace-pre-wrap flex-1">{airesponse}</p>
      </div>

      {/* Right Panel with Chat Feature */}
        
      <div className="relative flex-1 h-full bg-[#ffffff] rounded-lg p-4 border border-slate-700 flex flex-col">
        {!airesponse && !loading && (
          <div className="text-sm text-gray-400 mb-2 self-end">No Report Added</div>
        )}
       
        {isSignedIn?"":<div className="absolute inset-0 z-50 backdrop-blur-md bg-white/40 rounded-lg pointer-events-none flex items-center justify-center text-center">
      Sign In to unlock the chat feature
      </div>}

       



        <div className="flex-1 border border-gray-700 rounded bg-[#ffffff] p-4 mb-2 overflow-y-auto">
          {loading ? (
            <p className="text-gray-400 text-sm">Processing image...</p>
          ) : (
            <>
              <p className="text-black whitespace-pre-wrap text-sm mb-4">
                <strong>AiDoc:</strong> Upload the  prescription and ask me any query about it
              </p>
              {chatHistory.map((msg, i) => (
                <div
                  key={i}
                  className={`text-sm mb-3 ${msg.role === "user" ? "text-right" : "text-left"}`}
                >
                  <span className="font-bold">
                    {msg.role === "user" ? "You" : "AiDoc"}:
                  </span>{" "}
                  {msg.content}
                </div>
              ))}
            </>
          )}
        </div>

        {/* Chat Input */}
        <div className="mt-auto flex items-center gap-2 p-2 border border-slate-700 rounded bg-[#ffffff]">
          <input
            type="text"
            placeholder="Type your query here..."
            className="flex-1 bg-transparent outline-none text-sm text-black placeholder:text-gray-500"
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button
            onClick={handleSend}
            className="bg-white text-black font-semibold px-4 py-1 rounded"
          >
            3. Ask↵
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiWithPres;
