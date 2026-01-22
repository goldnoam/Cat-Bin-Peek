
import React, { useEffect } from 'react';

const AdPlaceholder: React.FC = () => {
  useEffect(() => {
    try {
      (window as any).adsbygoogle = (window as any).adsbygoogle || [];
      (window as any).adsbygoogle.push({});
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, []);

  return (
    <div className="w-full h-24 bg-gray-800 border-2 border-dashed border-gray-600 flex items-center justify-center rounded-lg my-4 overflow-hidden">
      <ins className="adsbygoogle"
           style={{ display: 'block', width: '100%', height: '90px' }}
           data-ad-client="ca-pub-0274741291001288"
           data-ad-slot="default"
           data-ad-format="auto"
           data-full-width-responsive="true"></ins>
    </div>
  );
};

export default AdPlaceholder;
