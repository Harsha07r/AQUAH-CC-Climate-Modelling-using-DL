import Navbar from '../components/Navbar'
import SideBar from '../components/SideBar'

function HomePage(){
    return(
        <div className="flex h-screen bg-gray-50">
            <SideBar />
            <div className="flex-1 flex flex-col">
                <Navbar />
                <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
                    {/* Low Internet Mode Banner */}
                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs md:text-sm px-3 md:px-4 py-2 rounded-lg mb-4 md:mb-6 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Low Internet Mode Active
                    </div>

                    {/* Greeting Section */}
                    <div className="mb-6 md:mb-8">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Good Morning, Krish!</h1>
                        <p className="text-sm md:text-base text-gray-500">How can I help your farm today?</p>
                    </div>

                    {/* Info Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
                        <div className="bg-white rounded-xl p-3 md:p-4 border border-gray-100 flex items-center gap-2 md:gap-3">
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <svg className="w-4 h-4 md:w-5 md:h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Location</p>
                                <p className="text-xs md:text-sm font-medium text-gray-800">Jhelum Basin - Sector 4</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-3 md:p-4 border border-gray-100 flex items-center gap-2 md:gap-3">
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <svg className="w-4 h-4 md:w-5 md:h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Season</p>
                                <p className="text-xs md:text-sm font-medium text-gray-800">Kharif</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-3 md:p-4 border border-gray-100 flex items-center gap-2 md:gap-3">
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <svg className="w-4 h-4 md:w-5 md:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Soil Moisture</p>
                                <p className="text-xs md:text-sm font-medium text-gray-800">Optimal Today</p>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
                        {/* Water Status Card */}
                        <div className="bg-white rounded-xl p-4 md:p-5 lg:p-6 border border-gray-100">
                            <div className="flex justify-between items-start mb-3 md:mb-4">
                                <div>
                                    <h3 className="text-sm md:text-base lg:text-lg font-semibold text-gray-900">Water Status</h3>
                                    <p className="text-xs md:text-sm text-gray-500">Reservoir Levels</p>
                                </div>
                                <span className="bg-emerald-100 text-emerald-700 text-xs font-medium px-2 py-1 rounded-full">SAFE</span>
                            </div>
                            <div className="mb-3 md:mb-4">
                                <p className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">82%</p>
                                <p className="text-xs md:text-sm text-gray-500">Capacity</p>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mb-2 md:mb-3">
                                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '82%' }}></div>
                            </div>
                            <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-emerald-600">
                                <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                                Rising 1.2% from yesterday
                            </div>
                        </div>

                        {/* Water Flow Card */}
                        <div className="bg-white rounded-xl p-4 md:p-5 lg:p-6 border border-gray-100">
                            <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                                <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <svg className="w-4 h-4 md:w-5 md:h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <h3 className="text-sm md:text-base lg:text-lg font-semibold text-gray-900">Water Flow</h3>
                            </div>
                            <p className="text-xs md:text-sm text-gray-500 mb-3 md:mb-4">Check how much water is coming through the canal network.</p>
                            <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 md:py-2.5 px-3 md:px-4 rounded-lg text-xs md:text-sm transition-colors w-full">
                                Check Water Flow →
                            </button>
                        </div>

                        {/* Best Crops Card */}
                        <div className="bg-white rounded-xl p-4 md:p-5 lg:p-6 border border-gray-100">
                            <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                                <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <svg className="w-4 h-4 md:w-5 md:h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>
                                <h3 className="text-sm md:text-base lg:text-lg font-semibold text-gray-900">Best Crops</h3>
                            </div>
                            <p className="text-xs md:text-sm text-gray-500 mb-3 md:mb-4">See what crops you should plant based on soil analysis.</p>
                            <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 md:py-2.5 px-3 md:px-4 rounded-lg text-xs md:text-sm transition-colors w-full">
                                View Crop Suggestions →
                            </button>
                        </div>
                    </div>

                    {/* Speak to AQUAH Section */}
                    <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-4 md:p-6 text-white">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-semibold text-sm md:text-base">Speak to AQUAH</p>
                                    <p className="text-xs md:text-sm text-green-100">Ask anything using voice commands</p>
                                </div>
                            </div>
                            <button className="bg-white text-green-700 font-semibold py-2 px-4 md:px-6 rounded-lg text-xs md:text-sm hover:bg-green-50 transition-colors w-full sm:w-auto">
                                Start Talking
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}

export default HomePage