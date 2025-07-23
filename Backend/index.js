require("dotenv").config();
const apiKey = process.env.MY_SECRET_KEY;

const express = require("express");
const cors = require("cors");
const https = require("https");
const { log } = require("console");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

//const apiKey = process.env.MY_SECRET_KEY;
const geminiApiUrl =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

// console.log(apiKey);
let nameResults = [];

app.get("/", (req, res) => {
  res.send("Welcome to the Express App!");
});

// GET request to fetch generated names
app.get("/chatres", (req, res) => {
  if (nameResults.length === 0) {
    return res.status(404).json({ error: "No names available. Query first!" });
  }
  res.json(nameResults);
});

// Function to fetch data using HTTPS module
const fetchGeminiResponse = (name) => {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Generate a list of 20  names for '${name}'and their name meaning, pronunciation, origin, gender in JSON format.`,
            },
          ],
        },
      ],
    });

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload),
      },
    };

    let req = https.request(`${geminiApiUrl}?key=${apiKey}`, options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          const jsonResponse = JSON.parse(data);
          console.log("Gemini API Response:", jsonResponse);
          resolve(jsonResponse);
        } catch (error) {
          reject("Error parsing response: " + error.message);
        }
      });
    });

    req.on("error", (error) => reject("Request Error: " + error.message));
    req.write(payload);
    req.end();
  });
};

// POST request to Gemini API
app.post("/chat", async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Name is required" });
  }

  try {
    const response = await fetchGeminiResponse(name);

    if (!response || !response.candidates || response.candidates.length === 0) {
      return res
        .status(500)
        .json({ error: "Invalid response from Gemini API" });
    }

    const chatbotResponse = response.candidates[0].content.parts[0].text.trim();
    const cleanResponse = chatbotResponse.replace(/```json|```/g, "").trim();
    // console.log(cleanResponse);
    try {
      const parsedResponse = JSON.parse(cleanResponse);

      nameResults = cleanResponse;
      console.log(nameResults);
      res.json({ message: "Names generated successfully", data: nameResults });
    } catch (parseError) {
      console.error("Error parsing Gemini API response:", parseError);
      res.status(500).json({ error: "Failed to parse Gemini API response" });
    }
  } catch (error) {
    console.error("Error querying name details:", error);
    res.status(500).json({ error: "Failed to retrieve name details" });
  }
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
