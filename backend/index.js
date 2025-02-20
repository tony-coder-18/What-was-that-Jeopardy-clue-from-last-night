import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';

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
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

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
        { id: 1, text: "Tributary rivers of this lake include the Cuyahoga, Detroit & Sandusky" },
        { id: 2, text: "Noughts & crosses is a British name for this game, but whatever you call it, it's still a tie with best play" },
        { id: 3, text: "The U.N. has designated May 20 a world day named for these insects whose population decline has alarmed many" },
        { id: 4, text: "A somewhat formal word for a bedroom, or the area of a firearm that holds the ammunition" },
        { id: 5, text: "In a nursery rhyme his broken crown was patched 'with vinegar and brown paper'" },
        { id: 6, text: "block east to Eighth Ave, the edge of this district" },
        { id: 7, text: "Fond of lakes? Start up the ol' Winnebago & head to Fond du Lac in this state & partake of Lake Winnebago" },
        { id: 8, text: "An optional 'speed die' for use with this game has one face with a picture of its eponymous top-hatted 'Mr.'" },
        { id: 9, text: "In 1990 South Dakota's legislature voted to rename the day formerly called this as Native Americans' Day" },
        { id: 10, text: "The border between East & West Germany featured Alpha & Bravo these as well as a more famous one" },
        { id: 11, text: "A 1972 caravan to D.C., the Trail of Broken these documents ended with the occupation of the Bureau of Indian Affairs" },
        { id: 12, text: "this song 'he's a flame'" },
        { id: 13, text: "One can traverse Lake Pontchartrain by taking this 24-mile-long type of bridge from Metairie to Mandeville" },
        { id: 14, text: "There's 'an infinite world that's yours to shape, one block at a time' in this 'ultimate sandbox game'" },
        { id: 15, text: "A fitting botanical prop is used in some celebrations of this first day of Holy Week" },
        { id: 16, text: "On her marriage to Prince Albert in 1840, Queen Victoria received a 1,250-pound wheel of this cheese as a wedding gift" },
        { id: 17, text: "If you change a web address, aka this 3-letter initialism, something called a 301 redirect will prevent the dreaded broken link" },
        { id: 18, text: "'Kaleidoscope' was the theme song of this sporting event in 2024 in Queens" },
        { id: 19, text: "Northwest of Allentown, Beltzville Lake is a popular fishing spot in this mountain range" },
        { id: 20, text: "In chess, one of these diagonally moving pieces is 'bad' if it's blocked by its own pawns" },
        { id: 21, text: "On Powder House Day this Conn. college town reenacts Benedict Arnold (still a good guy in 1775) standing up for the colonists" },
        { id: 22, text: "Rather than presidents, many universities have these top officials" },
        { id: 23, text: "Punch cards from this company helped the U.S. break WWII Japanese codes, which used book ciphers rather than machines" },
        { id: 24, text: "sung by a dude, 'Lovin' you darlin;'" },
        { id: 25, text: "Named for a Native American people, this Arizona lake is found within Tonto National Forest" },
        { id: 26, text: "Noted 17th C. poet Sir John Suckling popularized this peg, board & card game & is said to have won a fortune cheating at it" },
        { id: 27, text: "Sheep lactation is involved on Imbolc, a February 1 Celtic & pagan celebration of this, though it's still 7 weeks away" },
        { id: 28, text: "A veil or facescreen called a yashmak is often worn in public with this full-length garment for Muslim women" },
        { id: 29, text: "Modern medicine says broken heart syndrome can be triggered by grief & may lead to this, congestion from fluid in the lungs" },
        { id: 30, text: "'New York, concrete jungle where dreams are made of' this song Jay-Z" }
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

  const response = await axios.post(GEMINI_API_URL, requestBody, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return response.data.candidates[0].content.parts[0].text;
}

// Run the app
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});