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
    { id: 1, text: "In July 2019 Megan Thee Stallion tweeted, 'I feel it's only right I drop a' this 'song before the summer is over'" },
    { id: 2, text: "'The stricken whale flew forward'; this man 'stooped to clear' the line, 'but the flying turn caught him round the neck'" },
    { id: 3, text: "Sorry, we don't have Coke, but at the South Carolina State Fair, we have served fried this beverage, created in N.C. in 1893" },
    { id: 4, text: "As a noun it can mean pleated fabric added as a trim; as a verb, to annoy or fluster someone's feathers" },
    { id: 5, text: "Whoooa... I was in Vegas last night, but that's the U. of Nevada's flagship campus... how'd I get to this city also big on gambling?" },
    { id: 6, text: "You can't fool me... or maybe you can! There are 22 major arcana cards in this type of deck; now go & empress us" },
    { id: 7, text: "'I'm drunk in the back of the car, and I cried like a baby' while doing this, reported Taylor Swift of her 'Cruel Summer'" },
    { id: 8, text: "'In the morning she was waked by a horrible nightmare, which had recurred ... even before her connection with Vronsky'" },
    { id: 9, text: "How about this stuffed Chinese app with shredded veggies & meat? It's larger than the spring type & I'm in" },
    { id: 10, text: "Said of some cats & dogs, it means in a wild state, perhaps after having once been domesticated" },
    { id: 11, text: "Oh dear... am I on Killington Peak or Little Killington in this New England range? & Where the heck is Camel's Hump?" },
    { id: 12, text: "Lamed, vav & shin are among the 22 letters in this alphabet" },
    { id: 13, text: "A Beach Boys song about a relaxing 'Spring' this rhymes it (pretty much) with 'Good Vibrations'" },
    { id: 14, text: "He says, 'You know, old sport, I've never used that pool all summer?' (he really should've stuck to that)" },
    { id: 15, text: "allrecipes.com notes 'you can also fry up red' ones with the recipe for these, a 1991 film title, but overripe ones 'will be mushy'" },
    { id: 16, text: "Types of this device are either continuous wave or pulsed, which can produce a short release up to 10 quadrillion watts" },
    { id: 17, text: "I'm not sure where I am now heading down this river, but I've passed El Paso, loped by Laredo & bounded by Brownsville" },
    { id: 18, text: "'The knife came down, missing him by inches, and he took off' is the last line of this novel" },
    { id: 19, text: "Nat King Cole, Bing Crosby & Frank Sinatra are among the many artists who've recorded the jazz standard 'Autumn' these" },
    { id: 20, text: "He/it says, 'I think there's been a failure in the pod-bay doors... lucky you weren't killed... Dave... what are you doing?'" },
    { id: 21, text: "For fried chicken, 'Joy of Cooking' says a marinade of this tangy dairy product 'promotes tenderness'" },
    { id: 22, text: "This member of the weasel family found in forests of Asia is highly valued for its fur" },
    { id: 23, text: "It's no tragedy to be lost in Othello, Wash., but I must bop down 395 & over on 12 & hit this double-named city in about 90 minutes" },
    { id: 24, text: "Bats entertainment! The pitch in this sport is 22 yards in length by 10 feet in width" },
    { id: 25, text: "'Winter Lady' was a track on the 1967 debut album 'Songs of...' this late singer-songwriter" },
    { id: 26, text: "He 'cried out twice, a cry that was no more than a breath: The horror! The horror!'" },
    { id: 27, text: "From the French, this deep-fried New Orleans staple is a yeast pastry that's soft as--but more delicious than--a pillow" },
    { id: 28, text: "This small fluid-filled sac reduces friction between tendons & bones at joints" },
    { id: 29, text: "Oh, you know me, hoppin' on my Harley & heading for the annual August rally in this city, but my faulty GPS has me in nearby Deadwood" },
    { id: 30, text: "The 22 bones that make up this structure account for 1/4 of your length at birth but only 1/8 by maturity" }
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