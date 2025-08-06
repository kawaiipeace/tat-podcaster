'use client'

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black-1 text-white px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <img 
            src="/icons/logo.png" 
            alt="TAT Podcast Logo" 
            className="w-24 h-24 mx-auto mb-4"
          />
        </div>
        
        <h1 className="text-24 font-bold mb-4">
          ไม่มีสัญญาณอินเทอร์เน็ต
        </h1>
        
        <p className="text-16 text-gray-1 mb-8">
          กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตของคุณ แล้วลองใหม่อีกครั้ง
        </p>
        
        <div className="space-y-4">
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-[--accent-color] hover:bg-[--accent-color]/80 text-white py-3 px-6 rounded-lg transition-colors"
          >
            ลองใหม่อีกครั้ง
          </button>
          
          <button 
            onClick={() => window.history.back()}
            className="w-full border border-gray-600 text-gray-1 hover:bg-gray-800 py-3 px-6 rounded-lg transition-colors"
          >
            กลับหน้าก่อนหน้า
          </button>
        </div>
        
        <div className="mt-8 p-4 bg-gray-900 rounded-lg">
          <p className="text-14 text-gray-2">
            <strong>💡 เคล็ดลับ:</strong> บางเนื้อหาที่เคยเข้าชมแล้วจะสามารถเข้าดูได้แบบออฟไลน์
          </p>
        </div>
      </div>
    </div>
  )
}
