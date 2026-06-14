import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Paperclip, Camera, Mic, Send, Activity, Leaf } from 'lucide-react';
import { translations } from '../translations';
import HydrologyDashboard from './HydrologyDashboard';
import { API_BASE_URL } from '../config';

export default function ChatInterface({ user, currentLanguage, setCurrentLanguage }) {
  // --- 1. STATE MANAGEMENT ---
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([
    {
      role: 'model',
      content: translations[currentLanguage]?.welcomeMessage || translations['en-IN'].welcomeMessage,
    },
  ]);
  const [isListening, setIsListening] = useState(false);

  // Translation function
  const t = (key) => translations[currentLanguage]?.[key] || translations['en-IN'][key];

  const chatFeedRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize speech recognition once on mount
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join('');
      setInputText(transcript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, []);

  // Update speech recognition language whenever the user switches language.
  // Kashmiri (ks-IN) and Urdu (ur-IN) have no direct browser engine support;
  // ur-PK is the closest BCP-47 tag Chrome accepts for Nastaliq-script input.
  useEffect(() => {
    if (!recognitionRef.current) return;
    const speechLangMap = {
      'en-IN': 'en-IN',
      'hi-IN': 'hi-IN',
      'ur-IN': 'ur-PK',
      'ks-IN': 'ur-PK',
    };
    recognitionRef.current.lang = speechLangMap[currentLanguage] ?? currentLanguage;
  }, [currentLanguage]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Sorry, your browser doesn't support voice dictation.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setInputText('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  useEffect(() => {
    if (!user) return;

    const storageKey = `aquah_sessionId_${user.uid}`;
    const savedSession = localStorage.getItem(storageKey);

    if (savedSession) {
      setSessionId(savedSession);
      fetch(`${API_BASE_URL}/api/chat/${savedSession}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.messages && data.messages.length > 0) {
            setMessages(data.messages);
          }
        })
        .catch((err) => console.error('Could not load history:', err));
    }
  }, [user]);

  useEffect(() => {
    if (chatFeedRef.current) {
      chatFeedRef.current.scrollTop = chatFeedRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = { role: 'user', content: inputText };
    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    let systemLanguage = 'English';
    if (currentLanguage === 'hi-IN') {
      systemLanguage = 'Hindi';
    } else if (currentLanguage === 'ur-IN') {
      systemLanguage = 'Urdu (write in clear, natural Nastaliq Urdu script only. Do not use Roman letters.)';
    } else if (currentLanguage === 'ks-IN') {
      systemLanguage = 'Kashmiri (You MUST write exclusively in the native Perso-Arabic/Nastaliq script. NEVER use Roman letters. Keep the response very short, concise, and NEVER repeat the same phrase twice.)';
    }

    let promptWithLanguage;
    if (currentLanguage === 'en-IN') {
      promptWithLanguage = `${inputText} \n\n[SYSTEM DIRECTIVE: You MUST respond in clear, natural English.]`;
    } else {
      promptWithLanguage = `${inputText} \n\n[CRITICAL RULE: The Python API will give you data in English, but you MUST translate your final conversational text response into ${systemLanguage}. Do not output English text in your chat bubble.]`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: promptWithLanguage,
          originalMessage: inputText,
          sessionId: sessionId,
          uid: user?.uid,
        }),
      });

      const data = await response.json();
      console.log('[AQUAH-FE] Backend response widgetData:', data.widgetData);

      if (data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'model',
            content: data.reply,
            widgetData: data.widgetData,
            language: currentLanguage,
          },
        ]);

        if (data.sessionId && !sessionId) {
          setSessionId(data.sessionId);
          const storageKey = `aquah_sessionId_${user.uid}`;
          localStorage.setItem(storageKey, data.sessionId);
        }
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'model', content: 'Error: Could not reach the advisory network.' },
        ]);
      }
    } catch (error) {
      console.error('API Error:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'model', content: 'Error: The server is currently unreachable.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSendMessage();
  };

  return (
    <div className="h-full flex flex-col bg-[#fdfdfd] relative">
      <div
        ref={chatFeedRef}
        className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col gap-8 scroll-smooth"
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'user' ? (
              <div className="bg-gray-100 text-gray-800 px-6 py-4 rounded-3xl rounded-tr-sm max-w-[85%] md:max-w-[70%] font-medium shadow-sm">
                {msg.content}
              </div>
            ) : (
              <div className="flex flex-col max-w-[90%] md:max-w-[85%] gap-2 w-full">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-[#0f3d24] rounded-xl flex items-center justify-center shadow-md shrink-0">
                    <MessageSquare size={16} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm leading-tight">AQUAH Assistant</h3>
                  </div>
                </div>
                <div className="bg-white border border-gray-100 rounded-3xl rounded-tl-sm p-6 shadow-sm text-gray-700 leading-relaxed">
                  {msg.content}
                </div>
                {msg.widgetData && (() => {
                  const msgLang = msg.language || 'en-IN';
                  const tMsg = (key) => translations[msgLang]?.[key] || translations['en-IN'][key];
                  const topCrop = Array.isArray(msg.widgetData.recommended_crops)
                    ? msg.widgetData.recommended_crops[0]
                    : msg.widgetData.recommended_crops || msg.widgetData.crop || msg.widgetData.recommended_crop;
                  return (
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                      <div className="bg-white border border-green-100 rounded-2xl p-6 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-xs font-bold text-gray-400 uppercase">{tMsg('floodRiskLabel')}</h3>
                          <Activity size={16} className="text-green-600" />
                        </div>
                        <h4 className="text-3xl font-black text-gray-800 uppercase">
                          {tMsg(msg.widgetData.flood_risk) || msg.widgetData.flood_risk || tMsg('unknownRisk')}
                        </h4>
                        <p className="text-sm text-gray-500 mt-2">{tMsg('basedOnSensors')}</p>
                      </div>
                      <div className="bg-[#0f3d24] rounded-2xl p-6 shadow-sm relative overflow-hidden text-white">
                        <div className="relative z-10">
                          <div className="flex justify-between items-center mb-4">
                            <p className="text-xs font-bold text-green-300 uppercase">{tMsg('topCropLabel')}</p>
                            <Leaf size={16} className="text-green-400" />
                          </div>
                          <h4 className="text-3xl font-black mb-1">
                            {tMsg(topCrop) || topCrop || tMsg('consultExpert')}
                          </h4>
                          <p className="text-sm text-green-200">{tMsg('optimalSoilMoisture')}</p>
                        </div>
                        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-green-500 rounded-full opacity-20 blur-2xl"></div>
                      </div>
                    </div>
                  );
                })()}
                {msg.widgetData && (
                  <HydrologyDashboard
                    forecast={msg.widgetData.forecast}
                    avgFlow={msg.widgetData.avg_flow}
                    maxFlow={msg.widgetData.max_flow}
                    soil={msg.widgetData.soil}
                    temperature={msg.widgetData.temperature}
                    location={msg.widgetData.location}
                  />
                )}
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex flex-col max-w-[85%] gap-2">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-[#0f3d24] rounded-xl flex items-center justify-center shadow-md">
                  <MessageSquare size={16} className="text-white" />
                </div>
                <h3 className="font-bold text-gray-800 text-sm">AQUAH Assistant</h3>
              </div>
              <div className="bg-white border border-gray-100 rounded-3xl rounded-tl-sm p-6 shadow-sm flex gap-1 w-fit">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          </div>
        )}
        <div className="h-28 md:h-32 shrink-0 w-full"></div>
      </div>
      <div className="absolute bottom-4 sm:bottom-6 left-0 right-0 flex flex-col items-center px-4 sm:px-8">
        <div className="w-full max-w-3xl bg-[#f4f4f4] border border-gray-200 rounded-full flex items-center p-2 pr-2 sm:pr-3 shadow-sm focus-within:ring-2 focus-within:ring-green-200 focus-within:bg-white transition-all">
          <button
            className="p-2 sm:p-3 text-gray-400 hover:text-gray-700 disabled:opacity-50"
            disabled={isLoading}
          >
            <Paperclip size={20} />
          </button>
          <input
            type="text"
            placeholder={isLoading ? 'Analyzing data...' : t('placeholder')}
            className="flex-1 bg-transparent border-none outline-none text-gray-700 px-2 w-full text-sm sm:text-base disabled:opacity-50"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={isLoading}
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="hidden sm:block p-3 text-gray-400 hover:text-gray-700 disabled:opacity-50"
              disabled={isLoading}
            >
              <Camera size={20} />
            </button>
            <select
              value={currentLanguage}
              onChange={(e) => setCurrentLanguage(e.target.value)}
              className="text-xs bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 outline-none cursor-pointer hover:border-green-300 transition-colors disabled:opacity-50"
              disabled={isLoading}
              title="Select voice language"
            >
              <option value="en-IN">🇬🇧 EN</option>
              <option value="hi-IN">🇮🇳 हिंदी</option>
              <option value="ur-IN">🇵🇰 اردو</option>
              <option value="ks-IN">🇮🇳 كٲشُر</option>
            </select>
            <button
              type="button"
              onClick={toggleListening}
              disabled={isLoading}
              className={`p-2 sm:p-3 rounded-full shadow-md transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/50'
                  : 'bg-[#0f3d24] text-white hover:bg-[#1a5c38]'
              }`}
              title={isListening ? t('listening') : t('clickToSpeak')}
            >
              <Mic size={18} />
            </button>
            <button
              type="button"
              onClick={handleSendMessage}
              disabled={isLoading || !inputText.trim()}
              className="p-2 sm:p-3 text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:text-gray-500 rounded-full shadow-md transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}