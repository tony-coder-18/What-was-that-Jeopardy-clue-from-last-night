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
  const jeopardyClues = [
        { clue: "Ming emperor Chengzu moved the capital of China from Nanjing to this city & built a 30-foot wall surrounding it", value: "$200", id: 26 },
        { clue: "You know that it'd be untrue, though it's said he played the lyre, if I was to say to you, this Greek sun god sang 'Light My Fire'", value: "$200", id: 27 },
        { clue: "In 1972 Humble Oil XXed out the name Enco & renamed its stations this", value: "$200", id: 28 },
        { clue: "This cocktail made with bourbon has been the official drink of the Kentucky Derby since 1939", value: "$200", id: 29 },
        { clue: "Matthew Perry & Courteney Cox were among the friends who attended her lavish wedding to Brad Pitt", value: "$200", id: 30 },
        { clue: "You can be doing this (presently!) both down an airport runway or 42nd Street in public transportation", value: "$400", id: 16 },
        { clue: "Cannons helped decide the outcome of 1453's Battle of Castillon, the last major clash of this conflict", value: "$400", id: 24 },
        { clue: "In book XI of Ovid's 'Metamorphoses', this man 'touched a clod of earth, and by the power of touch, the clod became a nugget'", value: "$400", id: 21 },
        { clue: "This brand makes the Axent knife", value: "$400", id: 19 },
        { clue: "Alabama's state quarter features an image of this woman & her name in English & Braille", value: "$400", id: 23 },
        { clue: "The multiple Oscar-nominated films of 2000 included 'Gladiator' & this one with co-stars including Helen Hunt & a ball", value: "$400", id: 22 },
        { clue: "It's this job: Now who wants to bid $100 I hear $100 thank you do I hear 2 yes 2 OK now 4! $400 once... twice... sold for $400!", value: "$600", id: 1 },
        { clue: "Itzcoatl allied with neighboring states in 1428 & made this empire the dominant force in Central Mexico", value: "$600", id: 20 },
        { clue: "Achilles took a dip for invulnerability in this body of water, but uh oh... looks like mom missed a spot", value: "$600", id: 18 },
        { clue: "This gum brand makes Refreshers, gum that's coated in tiny crystals with a chewy center", value: "$600", id: 17 },
        { clue: "In the original version of the game Monopoly, many of the locations were taken from this New Jersey resort metropolis", value: "$600", id: 3 },
        { clue: "This hot new video game of the year had players controlling the day-to-day lives of virtual people", value: "$600", id: 15 },
        { clue: "You know how to play this instrument, aka mirliton, don't you, Steve? You just put your lips together around it & blow... I mean, hum. You hum", value: "$800", id: 2 },
        { clue: "This Wallachian prince picked up his killing-method-based nickname in battles against the Ottoman Turks", value: "$800", id: 11 },
        { clue: "Early Postmates man Hercules nabbed golden fruit guarded by these maidens whose name is Greek for 'daughters of night'", value: "$800", id: 12 },
        { clue: "Microsoft launched this gaming console in late 2005 at a price of $399", value: "$800", id: 5 },
        { clue: "In 1996 a village 25 miles north of New York City changed its name to this in honor of an 1820 horror story set there", value: "$800", id: 13 },
        { clue: "Eminem released this 'LP', his follow-up to 'The Slim Shady LP', & often considered his best album", value: "$800", id: 14 },
        { clue: "2 U's have different sounds in this word for an unbroken line or sequence", value: "DD: $1,400", id: 6 },
        { clue: "The structure called this, after the old city of Tokyo, was built; over centuries, it expanded greatly, then contracted", value: "$1000", id: 7 },
        { clue: "Half woman, half serpent but 100% dangerous, this monster whose name is also that of an Aussie mammal was the Sphinx' mom", value: "$1000", id: 8 },
        { clue: "Here's the logo of this clothing brand that has been around since 1991", value: "$1000", id: 4 },
        { clue: "Joining the U.S. as the 19th state in 1816, Indiana had been part of this vast tract of land ceded to the U.S. after the Revolution", value: "$1000", id: 9 },
        { clue: "In 2000 this future Oscar winner won an Emmy & a Golden Globe for her portrayal of Dorothy Dandridge", value: "$1000", id: 10 },
        { clue: "As it flows through the city of Oxford, this 210-mile river is known as the Isis", value: "$400", id: 22 },
        { clue: "Jules Verne quit his stock market job with the success of 'Five Weeks in' this, about 3 men who get a great view of Africa", value: "$400", id: 28 },
        { clue: "This architecturally named segment of the aorta curves over the heart", value: "$400", id: 27 },
        { clue: "It can be Boolean: CHASER", value: "$400", id: 20 },
        { clue: "Jimmy Buffet said he wrote about one of these 'In Paradise' after being limited to canned food & peanut butter on a Caribbean boat trip", value: "$400", id: 29 },
        { clue: "Alexis Fraser & Katherine Mason are known for making art using this cosmetic that comes in tubes, like oil paint does", value: "$800", id: 23 },
        { clue: "The Royal Conservatoire & the University of Strathclyde are both found in this city, Scotland's most populous", value: "$800", id: 21 },
        { clue: "This masked swashbuckler who fought for justice in Old California debuted in the 1919 story 'The Curse of Capistrano'", value: "$800", id: 24 },
        { clue: "Rh incompatibility is one cause of hemolysis, the breakdown of these cells", value: "$800", id: 25 },
        { clue: "Be patient with this famously slow-pouring condiment: it can polish copper", value: "$800", id: 26 }
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