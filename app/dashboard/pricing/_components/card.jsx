"use client";

import React, { useState } from "react";
import { toast,Toaster } from "sonner";
import { useUser } from "@clerk/nextjs";
import { collection, query, where, getDocs, updateDoc } from "firebase/firestore";

import { db } from "../../../_components/firebase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCcVisa,
  faCcMastercard,
  faCcAmex,
} from "@fortawesome/free-brands-svg-icons";
import { useRouter } from "next/navigation";

export default function PaymentForm() {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("30");
  const [cardType, setCardType] = useState("");

  const { user } = useUser();
  const router=useRouter()

  const validateCardNumber = (number) => /^\d{16}$/.test(number.replace(/-/g, ""));
  const validateExpiry = (exp) => /^(0[1-9]|1[0-2])\/\d{2}$/.test(exp);
  const validateCVV = (cvv) => /^\d{3,4}$/.test(cvv);
  const validateName = (name) => /^[a-zA-Z\s]{3,}$/.test(name.trim());
  const validateAmount = (amt) => !isNaN(amt) && Number(amt) > 0;

  const formatCardNumber = (value) => {
    let digits = value.replace(/\D/g, "").slice(0, 16);
    let formatted = digits.match(/.{1,4}/g)?.join("-") || digits;

    if (digits.startsWith("3")) setCardType("amex");
    else if (digits.startsWith("4")) setCardType("visa");
    else if (digits.startsWith("5")) setCardType("mastercard");
    else setCardType("");

    return formatted;
  };

  const formatExpiry = (value) => {
    let digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) {
      return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    return digits;
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  const cleanedCard = cardNumber.replace(/-/g, "").trim();
  const cleanedName = name.trim();
  const cleanedExpiry = expiry.trim();
  const cleanedCVV = cvv.trim();

  if (!validateName(cleanedName)) return toast.error("Enter a valid name.");
  if (!validateCardNumber(cleanedCard)) return toast.error("Card number must be 16 digits.");
  if (!validateExpiry(cleanedExpiry)) return toast.error("Expiry must be in MM/YY.");
  if (!validateCVV(cleanedCVV)) return toast.error("CVV must be 3 or 4 digits.");
  if (!validateAmount(amount)) return toast.error("Enter a valid amount.");

  const isTestCard =
    (cleanedCard === "3333333333333333" || cleanedCard === "4444444444444444") &&
    cleanedExpiry === "01/30" &&
    cleanedCVV === "2000";

  if (isTestCard && user) {
    const email = user?.primaryEmailAddress?.emailAddress;

    if (!email) {
      toast.error("User email not found.");
      return;
    }

    try {
      const userInfoRef = collection(db, "User-info");
      const q = query(userInfoRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast.error("No user record found in database.");
      } else {
        const userDoc = querySnapshot.docs[0];
        await updateDoc(userDoc.ref, { isMembership: true });
        toast.success("Membership activated successfully!");
        setTimeout(() => {
      router.push('/dashboard/pricing')
    }, 1000)
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to activate membership.");
    }
  }

  toast.success("Payment processed successfully!");
  console.log({ cleanedCard, cleanedExpiry, cleanedCVV, cleanedName, amount });

  setCardNumber("");
  setExpiry("");
  setCvv("");
  setName("");
  setAmount("30");
  setCardType("");
};

  const renderCardIcon = () => {
    switch (cardType) {
      case "visa":
        return <FontAwesomeIcon icon={faCcVisa} className="text-blue-600 text-2xl" />;
      case "mastercard":
        return <FontAwesomeIcon icon={faCcMastercard} className="text-red-600 text-2xl" />;
      case "amex":
        return <FontAwesomeIcon icon={faCcAmex} className="text-indigo-600 text-2xl" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-fit flex items-center justify-center bg-gray-100 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md space-y-6"
      >
        <h2 className="text-2xl font-bold text-center">Debit Card Payment</h2>

        <input
          type="text"
          placeholder="Cardholder Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <div className="relative">
          <input
            type="text"
            placeholder="Card Number"
            maxLength={19}
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            className="w-full border p-2 rounded pr-10"
          />
          <div className="absolute right-3 top-2.5">
            {renderCardIcon()}
          </div>
        </div>

        <div className="flex space-x-4">
          <input
            type="text"
            placeholder="MM/YY"
            maxLength={5}
            value={expiry}
            onChange={(e) => setExpiry(formatExpiry(e.target.value))}
            className="w-1/2 border p-2 rounded"
          />
          <input
            type="password"
            placeholder="CVV"
            maxLength={4}
            value={cvv}
            onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
            className="w-1/2 border p-2 rounded"
          />
        </div>

        <input
          type="number"
          placeholder="Amount (₹)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Pay Now
        </button>
      </form>
      <Toaster richColors/>
    </div>
  );
}
