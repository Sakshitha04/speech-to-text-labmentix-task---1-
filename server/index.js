require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const supabase = require("./supabaseFile");
const fs = require("fs");
const app = express();
const axios = require("axios");

app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

app.post("/upload", upload.single("audio"), async (req, res) => {
  try {
    // *Check if file exists
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    // * Upload audio to AssemblyAI
    const filePath = req.file.path;
    const uploadRes = await axios.post("https://api.assemblyai.com/v2/upload",fs.createReadStream(filePath),{
       headers: {
         authorization: process.env.ASSEMBLYAI_API_KEY,
       },
     }
    );
    // * Request transcription
    const audio_url = uploadRes.data.upload_url;
    const transcriptRes = await axios.post("https://api.assemblyai.com/v2/transcript",
      { audio_url,
       speech_models: ["universal-2"],
      },
      {
        headers: {
          authorization: process.env.ASSEMBLYAI_API_KEY,
        },
      }
    );
    // *Poll for result
    const transcriptId = transcriptRes.data.id;
    let transcriptionText = "";

    while (true) {
      const pollingRes = await axios.get(`https://api.assemblyai.com/v2/transcript/${transcriptId}`,{
          headers: {
            authorization: process.env.ASSEMBLYAI_API_KEY,
          },
      });

      if (pollingRes.data.status === "completed") {
        transcriptionText = pollingRes.data.text;
        break;
      } 
      else if (pollingRes.data.status === "error") {
        throw new Error("Transcription failed");
      }
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
    // * Save to Supabase
    const { data, error } = await supabase
          .from("transcriptions")
          .insert([
            {
              audio_url: filePath,
              transcription: transcriptionText,
            },
          ]);

        if (error) {
          return res.status(500).json(error);
       }

        // *Delete file after processing
        fs.unlinkSync(filePath);

        // *Send response
        res.json({
          message: "Transcription successful",
            transcription: transcriptionText,
        });
  } 
catch (err) {
  console.error(err);
  res.status(500).json({ error: err.message || "Something went wrong" });
}
});

app.get("/", (req, res) => {
  res.send("Speech to Text API running...");
});

app.post("/save",async(req,res) =>{
    const {audio_url,transcription} = req.body;
    const {data, error} = await supabase
    .from("transcriptions")
    .insert([
        {audio_url, transcription}
    ]);

    if(error){
        return res.status(500).json(error);
    }
    res.json(data);
});

app.get("/history", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("transcriptions")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      return res.status(500).json(error);
    }
    res.json(data);
  }
   catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
