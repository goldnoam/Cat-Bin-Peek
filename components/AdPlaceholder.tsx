
import React from 'react';

const AdPlaceholder: React.FC = () => {
  return (
    <div className="w-full h-24 bg-gray-800 border-2 border-dashed border-gray-600 flex items-center justify-center rounded-lg my-4 overflow-hidden">
      <span className="text-gray-500 text-xs uppercase tracking-widest font-bold">
        Google AdSense Placeholder
      </span>
      {/* 
        Actual AdSense Code:
        <ins className="adsbygoogle"
             style={{ display: 'block' }}
             data-ad-client="ca-pub-YOUR_CLIENT_ID"
             data-ad-slot="YOUR_AD_SLOT"
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
        <script>
             (adsbygoogle = window.adsbygoogle || []).push({});
        </script>
      */}
    </div>
  );
};

export default AdPlaceholder;
