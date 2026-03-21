import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { supabase } from "./supabaseClient";

function App() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // * start recording 
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;

    audioChunksRef.current = [];

    mediaRecorder.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data);
    };

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, {
        type: "audio/wav",
      });

      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.wav");
      if (user) {
         formData.append("user_id", user.id);
      }

    try {
      setLoading(true);
      setError("");
      // *
      const res = await axios.post( "http://localhost:5000/upload", formData);
      setText(res.data.transcription);
      fetchHistory();
} catch (err) {
  setError(err.response?.data?.error || "Something went wrong");
} finally {
  setLoading(false);
}};

    mediaRecorder.start();
    setRecording(true);
  };

//  * stop recording 
  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);
  };

  // *
useEffect(() => {
  const getUser = async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      setUser(data.session.user);
    }
  };

  getUser();
}, []);

useEffect(() => {
  if (user) {
    fetchHistory();
  }
}, [user]);


// * handling signup 
const handleSignup = async () => {
  setLoading(true);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    setError(error.message);
  } else {
    const { data: sessionData } = await supabase.auth.getSession();
    setUser(sessionData.session?.user || null);
  }

  setLoading(false);
};
// * handling login 
const handleLogin = async () => {
  setLoading(true);

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    setError(error.message);
  } else {
    const { data: sessionData } = await supabase.auth.getSession();
    setUser(sessionData.session?.user || null);
  }

  setLoading(false);
};

// * fetching history 
const fetchHistory = async () => {
  if (!user) return;
  try {
    const res = await axios.get( `http://localhost:5000/history?user_id=${user.id}`);
    setHistory(res.data);
  } catch (err) {
    console.error(err);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 to-purple-300 flex items-center justify-center">
      <div className="bg-blue-900 p-8 rounded-2xl shadow-xl w-[70vw] text-center ">

        {!user ? (<div className="flex flex-col gap-3 mb-4">
          <input type="email" placeholder="Email" className="p-2 rounded"onChange={(e) => setEmail(e.target.value)}/>
          <input type="password"  placeholder="Password" className="p-2 rounded" onChange={(e) => setPassword(e.target.value)} />
          <button type="button" onClick={handleSignup} disabled={loading} className="bg-blue-500 text-white p-2 rounded"> {loading ? "Signing up..." : "Sign Up"}</button>
          <button type="button"  onClick={handleLogin}  disabled={loading}  className="bg-green-500 text-white p-2 rounded">  {loading ? "Logging in..." : "Login"}</button>
        </div>) : (

  <>
    <h1 className="text-3xl font-bold mb-6 text-white">  Speech to Text converter </h1>

    {/* 🎤 Buttons */}
    <div className="flex gap-3 mb-4">
      {!recording ? (<button onClick={startRecording} className="w-[10vw] bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg"> Start Recording </button>
      ) : (
        <button onClick={stopRecording} className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg">  Stop & Transcribe </button>
      )}
    </div>

    {/* 🔄 Loading */}
    {loading && (
      <p className="text-blue-600 font-medium">Transcribing...</p>
    )}

    {error && (
      <p className="text-red-500 font-medium mt-2">{error}</p>
    )}

    {/* 🧾 Output */}
    <div className="mt-6 text-left">
      <h3 className="text-xl font-semibold mb-2 text-white"> Transcription:</h3>
      <div className="bg-gray-200 p-4 rounded-lg min-h-[80px]">
        {text || "Speak something..."}
      </div>
    </div>

    {/* 📜 History */}
    <div className="mt-6 text-left">
      <h3 className="text-xl font-semibold mb-2 text-white"> History: </h3>
      <div className="mt-4 grid gap-4 max-h-60 overflow-y-auto">
        {history.length === 0 ? ( <p className="text-gray-400 text-center">No history yet</p>) : ( history.map((item) => (
            <div key={item.id} className="bg-gray-200 p-4 rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] transition duration-300">
              <p className="text-gray-800 mb-2"> {item.transcription}</p>
              <div className="flex justify-between items-center text-sm text-gray-500"> <span> {new Date(item.created_at).toLocaleString()} </span> </div>
            </div>
          ))
        )}
      </div>
    </div>
  </>
        )}
      </div>
    </div>
  );
}

export default App;
