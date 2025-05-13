import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const ServiceCard = ({img,title,desc,link}) => {
  return (        
<article className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md mx-20 ">
  <Image
    alt="banner"
    src={img}
    height={100}
    width={100}
    className="h-56 w-full object-cover"
  />

  <div className="p-4 sm:p-6">
    <a >
      <h3 className="text-lg font-medium text-gray-900">
        {title}
      </h3>
    </a>

    <p className="mt-2 line-clamp-3 text-sm/relaxed text-gray-500">
      {desc}
    </p>

    <Link href={link} className="group mt-4 inline-flex items-center gap-1 text-sm font-medium text-blue-600">
      Try Out

      <span aria-hidden="true" className="block transition-all group-hover:ms-0.5 rtl:rotate-180">
        &rarr;
      </span>
    </Link>
  </div>
</article>
  )
}

export default ServiceCard