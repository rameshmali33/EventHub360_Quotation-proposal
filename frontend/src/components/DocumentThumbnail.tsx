

const DocumentThumbnail = ({ page, index, active, onSelect  }: any) => {
  return (
    <li 
      className="flex flex-col items-center cursor-pointer mb-6 select-none"
    >
      <div 
        onClick={() => onSelect(page.id)}
        className={`w-[180px] h-[220px] rounded-[20px] overflow-hidden bg-white mb-3 transition-all duration-200 ${
          active 
            ? 'border-2 border-[#B3262E] shadow-[0_8px_20px_rgba(179,38,46,0.2)] scale-[1.02]' 
            : 'border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300'
        }`}
      >
        {page.type === 'cover' && (
          <div className="w-full h-full bg-gray-900 relative">
            <img 
              src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
              alt="Cover"
              className="w-full h-full object-cover opacity-80"
              draggable={false}
            />
          </div>
        )}
        
        {page.type === 'quotation' && (
          <div className="h-full w-full bg-white p-4">
            <div className="flex items-start justify-between border-b-2 border-gray-800 pb-3">
              <div className="h-3 w-16 rounded-sm bg-red-700" />
              <div className="space-y-1 text-right">
                <div className="ml-auto h-3 w-14 rounded-sm bg-gray-800" />
                <div className="ml-auto h-1.5 w-10 rounded-full bg-gray-200" />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 border-b border-gray-200 pb-4">
              <div className="space-y-1.5"><div className="h-1.5 w-8 rounded-full bg-gray-200" /><div className="h-2 w-16 rounded-full bg-gray-400" /></div>
              <div className="space-y-1.5"><div className="ml-auto h-1.5 w-12 rounded-full bg-gray-200" /><div className="ml-auto h-2 w-14 rounded-full bg-gray-300" /></div>
            </div>
            <div className="mt-4 overflow-hidden border border-gray-200">
              <div className="h-4 bg-gray-800" />
              {[1, 2, 3, 4].map((row) => <div key={row} className="h-7 border-b border-gray-100 px-2 py-2"><div className="h-1.5 rounded-full bg-gray-100" /></div>)}
            </div>
            <div className="ml-auto mt-4 h-12 w-24 border border-gray-200 bg-gray-50" />
          </div>
        )}

        {page.type === 'moodboard' && (
          <div className="w-full h-full p-2 grid grid-cols-2 grid-rows-2 gap-2 bg-white">
            <div className="bg-[#F8E3E3] rounded-lg" />
            <div className="bg-[#E6E3F8] rounded-lg" />
            <div className="bg-[#E8EDE3] rounded-lg" />
            <div className="bg-[#E3F2F8] rounded-lg" />
          </div>
        )}

        {page.type === 'agenda' && (
          <div className="w-full h-full p-4 bg-white flex flex-col gap-3">
            <div className="w-3/4 h-3 bg-gray-200 rounded-full" />
            <div className="w-full h-2 bg-gray-100 rounded-full mt-2" />
            <div className="w-5/6 h-2 bg-gray-100 rounded-full" />
            <div className="w-full h-2 bg-gray-100 rounded-full" />
            <div className="w-2/3 h-2 bg-gray-100 rounded-full" />
          </div>
        )}
      </div>

      <span className={`text-[13px] font-medium transition-colors ${
        active ? 'text-[#B3262E]' : 'text-gray-500'
      }`}>
        {index + 1}. {page.title}
      </span>
    </li>
  );
};

export default DocumentThumbnail;
