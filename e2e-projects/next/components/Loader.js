import React from 'react'

function Loader() {
  return (
  <div className="bg-white min-h-screen px-4 py-16 sm:px-6 sm:py-24 md:grid md:place-items-center lg:px-8">
    <div className="max-w-max mx-auto">
        <main className="sm:flex">
        <p className="text-4xl font-extrabold text-indigo-600 sm:text-5xl">Loading ...</p>
        <div className="sm:ml-6">
            <div className="sm:border-l sm:border-gray-200 sm:pl-6">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">Please wait</h1>
            <p className="mt-1 text-base text-gray-500">while your page is being generated.</p>
            </div>
        </div>
        </main>
    </div>
  </div>
  )
}

export default Loader