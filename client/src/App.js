import React, { useState, useRef } from "react";
import axios from "axios";

const App = () => {
  const [transcript, setTranscript] = useState("");
  const [corrected, setCorrected] = useState("");
  const [isListening, setIsListening] = useState(false);

  const recognitionRef = useRef(null);

  // Initialize Speech Recognition
  const initRecognition = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported in your browser.");
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript;
      setTranscript(speechToText);
      getCorrection(speechToText);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    return recognition;
  };

  const startListening = () => {
    const recognition = initRecognition();
    if (recognition) {
      recognitionRef.current = recognition;
      recognition.start();
    }
  };

  const getCorrection = async (text) => {
    try {
      const res = await axios.post("http://localhost:5000/api/correct", {
        text,
      });
      const correctedText = res.data.corrected;
      setCorrected(correctedText);
      speak(correctedText);
    } catch (err) {
      console.error("Error correcting:", err);
    }
  };

  const speak = (text) => {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    synth.speak(utterance);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-xl space-y-6">
        <h1 className="text-3xl font-bold text-center text-indigo-600">
          TalkFluent 🎙️
        </h1>

        <div className="text-center">
          <button
            onClick={startListening}
            className={`px-6 py-3 text-white font-semibold rounded-xl transition ${isListening ? "bg-red-500" : "bg-indigo-600 hover:bg-indigo-700"
              }`}
          >
            {isListening ? "Listening..." : "Start Speaking"}
          </button>
        </div>

        {transcript && (
          <div>
            <h3 className="font-semibold text-gray-700">You said:</h3>
            <p className="text-gray-900 bg-gray-100 rounded p-2">{transcript}</p>
          </div>
        )}

        {corrected && (
          <div>
            <h3 className="font-semibold text-green-700 mb-1 flex items-center justify-between">
              <span>Corrected: </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(corrected);
                }}
                className="text-sm text-blue-600 hover:underline"
              >
                📋 Copy
              </button>
            </h3>
            <p className="text-green-900 bg-green-50 rounded p-2">{corrected}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
