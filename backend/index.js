import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const corsOptions = {
  origin: 'http://localhost:3001/',//(https://your-client-app.com)
  // origin: '*',//(https://your-client-app.com)
  optionsSuccessStatus: 200
};

// Initialize Express app
const app = express();
// app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// Gemini API configuration
const GEMINI_API_KEY = process.env.GEMINI_AI; // Replace with your Gemini API key
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

app.get("/", (req, res) => res.send("Express on Vercel"));

// Define the search endpoint
app.get('/search', async (req, res) => {
  const userQuery = req.query;
  try {
    // console.log(req.query.search);
    // const response = await searchClue(userQuery.query);
    // res.json({ clue: response });
    let answerFromAI = await searchClue(req.query.search);

    console.log(answerFromAI);
    res.json({
      clueAnswer: answerFromAI
    })
    // res.send(req.query.search);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to process the query' });
  }
});

const getClues = () => {
  const clues = [
    { id: 1, text: "Ming emperor Chengzu moved the capital of China from Nanjing to this city & built a 30-foot wall surrounding it" },
    { id: 2, text: "You know that it'd be untrue, though it's said he played the lyre, if I was to say to you, this Greek sun god sang 'Light My Fire'" },
    { id: 3, text: "In 1972 Humble Oil XXed out the name Enco & renamed its stations this" },
    { id: 4, text: "This cocktail made with bourbon has been the official drink of the Kentucky Derby since 1939" },
    { id: 5, text: "Matthew Perry & Courteney Cox were among the friends who attended her lavish wedding to Brad Pitt" },
    { id: 6, text: "You can be doing this (presently!) both down an airport runway or 42nd Street in public transportation" },
    { id: 7, text: "Cannons helped decide the outcome of 1453's Battle of Castillon, the last major clash of this conflict" },
    { id: 8, text: "In book XI of Ovid's 'Metamorphoses', this man 'touched a clod of earth, and by the power of touch, the clod became a nugget'" },
    { id: 9, text: "This brand makes the Axent knife" },
    { id: 10, text: "Alabama's state quarter features an image of this woman & her name in English & Braille" },
    { id: 11, text: "The multiple Oscar-nominated films of 2000 included 'Gladiator' & this one with co-stars including Helen Hunt & a ball" },
    { id: 12, text: "It's this job: Now who wants to bid $100 I hear $100 thank you do I hear 2 yes 2 OK now 4! $400 once... twice... sold for $400!" },
    { id: 13, text: "Itzcoatl allied with neighboring states in 1428 & made this empire the dominant force in Central Mexico" },
    { id: 14, text: "Achilles took a dip for invulnerability in this body of water, but uh oh... looks like mom missed a spot" },
    { id: 15, text: "This gum brand makes Refreshers, gum that's coated in tiny crystals with a chewy center" },
    { id: 16, text: "In the original version of the game Monopoly, many of the locations were taken from this New Jersey resort metropolis" },
    { id: 17, text: "This hot new video game of the year had players controlling the day-to-day lives of virtual people" },
    { id: 18, text: "You know how to play this instrument, aka mirliton, don't you, Steve? You just put your lips together around it & blow... I mean, hum. You hum" },
    { id: 19, text: "This Wallachian prince picked up his killing-method-based nickname in battles against the Ottoman Turks" },
    { id: 20, text: "Early Postmates man Hercules nabbed golden fruit guarded by these maidens whose name is Greek for 'daughters of night'" },
    { id: 21, text: "Microsoft launched this gaming console in late 2005 at a price of $399" },
    { id: 22, text: "In 1996 a village 25 miles north of New York City changed its name to this in honor of an 1820 horror story set there" },
    { id: 23, text: "Eminem released this 'LP', his follow-up to 'The Slim Shady LP', & often considered his best album" },
    { id: 24, text: "2 U's have different sounds in this word for an unbroken line or sequence" },
    { id: 25, text: "The structure called this, after the old city of Tokyo, was built; over centuries, it expanded greatly, then contracted" },
    { id: 26, text: "Half woman, half serpent but 100% dangerous, this monster whose name is also that of an Aussie mammal was the Sphinx' mom" },
    { id: 27, text: "Here's the logo of this clothing brand that has been around since 1991" },
    { id: 28, text: "Joining the U.S. as the 19th state in 1816, Indiana had been part of this vast tract of land ceded to the U.S. after the Revolution" },
    { id: 29, text: "In 2000 this future Oscar winner won an Emmy & a Golden Globe for her portrayal of Dorothy Dandridge" },
    { id: 30, text: "As it flows through the city of Oxford, this 210-mile river is known as the Isis" }
  ];
    
      return clues.map(clue => clue.text).join(', ');
}

// Function to search for a clue using Gemini REST API
async function searchClue(userQuery) {
  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: `You are a Jeopardy clue assistant. Only respond with clues from the following dataset:
            - Clues: ${getClues()}
            User query: ${userQuery}`,
          },
        ],
      },
    ],
  };

  // const response = await axios.post(GEMINI_API_URL, requestBody, {
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  // });

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = requestBody.contents[0].parts[0].text;

  const result = await model.generateContent(prompt);

  console.log(result.response.text());

  // return response.data.candidates[0].content.parts[0].text;
  return result.response.text();
}

// Run the app
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// export default app;
// module.exports = app;