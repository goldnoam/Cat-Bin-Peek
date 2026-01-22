
import React, { useEffect, useState } from 'react';

const AdPlaceholder: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    try {
      (window as any).adsbygoogle = (window as any).adsbygoogle || [];
      (window as any).adsbygoogle.push({});
    } catch (e) {
      console.error('AdSense error:', e);
    }
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full h-24 bg-gray-800 border-2 border-dashed border-gray-600 flex items-center justify-center rounded-lg my-4 overflow-hidden relative">
      {loading && (
        <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="flex gap-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce delay-75"></div>
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce delay-150"></div>
          </div>
        </div>
      )}
      <div className="absolute top-2 right-2 text-[8px] text-gray-500 font-bold uppercase tracking-widest">Sponsored</div>
      <ins className="adsbygoogle"
           style={{ display: 'block', width: '100%', height: '90px' }}
           data-ad-client="ca-pub-0274741291001288"
           data-ad-slot="default"
           data-ad-format="auto"
           data-full-width-responsive="true"></ins>
      {!loading && (
        <div className="text-gray-600 text-[10px] italic">Loading Ads from ca-pub-0274741291001288...</div>
      )}
    </div>
  );
};

export default AdPlaceholder;
