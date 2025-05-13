import React from 'react'
import Header from '../_components/Header'
import ServiceCard from './_components/ServiceCard'

const Services = () => {
  return (
    <div>
    <Header/>
    <div className='text-center mt-20 mb-10'>
      <h2 className=' text-5xl font-extrabold '>Our Services</h2>
      <h2 className='text-sm text-gray-500 my-5'>By leveraging the power of Artificial Intelligence, we make digitization task easier and faster</h2>
    </div>
    <div className='grid grid-col-3  md:grid-cols-2 sm:grid-cols-1 gap-10 mb-10'>
    <ServiceCard img={'/docreader.jpg'} title={'Docreader'} desc={'Having a hard time reading or copying from images? Use the tool and the work will be done in seconds.'} link={'/services/docreader'}/>
    <ServiceCard img={'/preader.jpg'} title={'PresReader'} desc={'Want to order your medicines but cannot read what the doctor wrote? We got it covered.'} link={'/services/presreader'}/>
  
      </div>    
    
    </div>
  )
}

export default Services