'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

export default function DiscPage() {
  const [inputValue, setInputValue] = useState('');

  const saveToLocalStorage = () => {
    localStorage.setItem('discText', inputValue);
    toast.success('Disclaimer saved successfully!');
  };

  return (
    <main className="min-h-screen bg-[#e9e9e9] text-white flex flex-col items-center p-6">
      <div className="w-full max-w-4xl flex flex-col items-center justify-center mt-10">
        <div className="bg-white rounded-lg p-8 shadow-lg w-full max-w-2xl">
          <h1 className="text-3xl font-bold text-black mb-6 text-center">Disclaimer Settings</h1>
          
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <label className="text-lg font-semibold text-gray-700">
                Disclaimer Text
              </label>
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter your disclaimer text here..."
                rows={6}
                className="w-full p-4 border-2 border-gray-300 rounded-lg text-black text-base resize-none focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
              />
            </div>
            
            <div className="flex justify-center mt-4">
              <button
                onClick={saveToLocalStorage}
                className="px-8 py-3 bg-blue-600 font-bold text-white hover:bg-blue-700 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md"
              >
                Save Disclaimer
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
