
import React from 'react';

export const Header: React.FC = () => {
  return (
    <div className="text-center md:text-left my-6">
      <p className="mt-2 text-lg text-gray-300 max-w-3xl mx-auto md:mx-0">
        Instantly convert audio, video, images, and documents into text. This app leverages the power of Gemini to provide fast and accurate transcriptions.
      </p>
    </div>
  );
};
