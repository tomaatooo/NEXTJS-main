'use client';

import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { db } from '../../_components/firebase';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Button } from '@/components/ui/button';
import Header from '@/app/_components/Header';

const View = () => {
  const printRef = useRef(null);
  const { id } = useParams()

  const [val, setVal] = useState([]);
  const [loading, setLoading] = useState(true);
console.log(id)
  useEffect(() => {
    const getData = async () => {
      if (!id) return;

      try {
        const docRef = doc(db, 'User-data', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = { ...docSnap.data(), id: docSnap.id };
          setVal([data]);
          console.log('Fetched Document:', data);
        } else {
          console.log('No document found with the specified ID');
        }
      } catch (error) {
        console.error('Error fetching document:', error);
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, [id]);

  const handleDownloadPdf = async () => {
    const element = printRef.current;
    if (!element) return;

    const canvas = await html2canvas(element, { scale: 2 });
    const data = canvas.toDataURL('image/jpeg', 0.7);

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: 'a4',
    });

    const imgProps = pdf.getImageProperties(data);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(data, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${val[0]?.title || 'document'}.pdf`);
  };

  if (loading) return null;

  return (
    <>
    <Header/>
    <div className="flex flex-col items-center py-6">
      <div className="w-full max-w-3xl px-6">
        <div className="flex justify-between items-center mb-4">
          <p className="text-black text-2xl font-semibold">{val[0]?.title}</p>
          <Button onClick={handleDownloadPdf} className="bg-green-600 hover:bg-green-700 text-white">
            Save PDF
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-xl overflow-hidden w-full h-[1100px] mb-12">
          <div ref={printRef} className="p-8 text-gray-800 text-base leading-relaxed overflow-y-auto max-h-full">
            <div dangerouslySetInnerHTML={{ __html: val[0]?.text }} />
          </div>
        </div>
      </div>
    </div>
    </>
    
  );
};

export default View;
