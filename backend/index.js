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
        { id: 1, text: "Nepal's coat of arms features a garland of rhododendrons encompassing this summit" },
        { id: 2, text: "Hyacinth Hippo is the star of the 'Dance of the Hours' segment of this Disney film" },
        { id: 3, text: "'I'm not pretty anymore'; 'Note to the filmmakers... Margot Robbie is the wrong person to cast if you want to make this point'" },
        { id: 4, text: "Shake, rattle & roll: SEMI SOY LOG" },
        { id: 5, text: "Created in 1957, the Standard & Poor's index with this number tracks companies from energy to real estate" },
        { id: 6, text: "You can stand on a raised one to give a speech, or wear this kind of boot or heel to raise yourself up a few inches" },
        { id: 7, text: "This 3,000-mile mountain range extends from the U.S. into the northernmost reaches of British Columbia" },
        { id: 8, text: "In a confusing turn of events, this Hasbro game of 'marble chomping madness' has a unicorn edition (but the same name)" },
        { id: 9, text: "'Metaman, express elevator! Dynaguy, snag on takeoff! Splashdown, sucked into a vortex! No capes!'" },
        { id: 10, text: "It's for the birds: THORNY IGLOO" },
        { id: 11, text: "On a company's balance sheet, 'AR' refers to this, money owed to the business by customers" },
        { id: 12, text: "When it comes to love, this adjective can be used in contrast to erotic" },
        { id: 13, text: "At an elevation of 8,100 feet, Great St. Bernard Pass through these mountains connects Switzerland & Italy" },
        { id: 14, text: "A viral sensation in 2024, Moo Deng is a pygmy hippo at the Khao Kheow Open Zoo in this country" },
        { id: 15, text: "'Now... sink into the floor... sink... now you're in the Sunken Place'" },
        { id: 16, text: "It's cutting edge: LENGTHY COO" },
        { id: 17, text: "From the Latin for 'body', this action offers more protection against liability than sole proprietorship" },
        { id: 18, text: "Facial features of this monotreme include a duckbill & white fur under its eyes" },
        { id: 19, text: "South America's highest peak, Mount Aconcagua is found near the border of these 2 countries" },
        { id: 20, text: "A blue hippo from Egypt's Middle Kingdom is the unofficial mascot of this New York museum that displays him" },
        { id: 21, text: "'Most people wanna borrow sugar. or even ketchup! You wanna borrow my car? Hell, naw!', leading to 'Bye, Felisha'" },
        { id: 22, text: "Let's get physical or cultural: OOH ANGRY PLOT" },
        { id: 23, text: "Divide the benefit gained by the amount put in, then multiply by 100 to calculate ROI, this" },
        { id: 24, text: "If you don't know the details of a secret government operation, you've given yourself this kind of deniability" },
        { id: 25, text: "Bearing the name of a country, it's the second-highest mountain in Africa" },
        { id: 26, text: "From 395 to 430, this saint was bishop of the port city of Hippo" },
        { id: 27, text: "Ted Knight: 'I'm no slouch myself'. Chevy: 'Don't sell yourself short, judge. You're a tremendous slouch'" },
        { id: 28, text: "Time to bone up: GOOEY SLOT" },
        { id: 29, text: "Used to secure repayment, it's assets or property pledged when a loan agreement is signed" },
        { id: 30, text: "This guide says its yellow-&-black 'logo has been woven into the theatregoing experience'" }
    ];  

    const newClues = [
      { id: 31, text: `"Erik the Red's Saga" says that this son of Erik was blown off course & ended up in grape-laden North America` },
      { id: 32, text: `Idiomatically, they're very small stages of progress` },
      { id: 33, text: `Scottish artist Eduardo Paolozzi anticipated this movement by a decade depicting brands in works like 1949's "Improved Beans"` },
      { id: 34, text: `Once upon a time, in a kingdom far away, she played paralegal-turned-lawyer Rachel Zane on "Suits"` },
      { id: 35, text: `He was a senator, a governor & our 5th U.S. president; "Jeopardy!" 101... know the order of the presidents, folks!` },
      { id: 36, text: `In "Someplace Like Montana", Ada Limón recalls life in this New York City borough of bodegas, buildings & bridges--& Bushwick` },
      { id: 37, text: `Admiral George Anson lost half his ships trying to round this cape but later cashed in by seizing a Spanish galleon` },
      { id: 38, text: `Various sources say in the early 2000s, the length of these "toothsome" morsels of political persuasion was 7-9 seconds` },
      { id: 39, text: `The Rococo age was on a gilt trip & surviving pieces often use gilt this alloy, less valuable to strip & melt than silver` },
      { id: 40, text: `A regular on "30 Rock", she's more recently hosted a reboot of "Name That Tune"; I can name that actress in...` },
      { id: 41, text: `In 1924 this luxury fashion store addressed itself at a New York City location between 49th & 50th Streets` },
      { id: 42, text: `"The ghost of Père Lachaise/ Is walking the streets" in Hope Mirrlees' 1920 modernist classic titled this` },
      { id: 43, text: `On July 25, 1579 this Englishman pulled up anchor near what is now San Francisco & headed out across the Pacific` },
      { id: 44, text: `Fittingly, not much effort was needed in the 1980s to create this phrase meaning to take it super-easy; it's only 6 total letters` },
      { id: 45, text: `Coin collecting was big in the Early Renaissance, maybe one reason portraits showed sitters like Matteo Olivieri this way` },
      { id: 46, text: `Conchata Ferrell is perhaps best remembered for her roles on "L.A. Law" & as sarcastic housekeeper Berta on this sitcom` },
      { id: 47, text: `Leeloo & Cornelius work together to save the Earth in this 1997 sci-fi epic, from an idea Luc Besson had at age 16` },
      { id: 48, text: `The Vale of Tawasentha & the shore of Gitche Gumee are settings in the "Song of" him` },
      { id: 49, text: `Aboard the ships São Gabriel & São Rafael, this explorer made it to Mozambique in 1498 & got help from the sultan there` },
      { id: 50, text: `With scenes like the hide & clap in "The Conjuring", director James Wan has mastered this effect--it literally moves the viewer` },
      { id: 51, text: `In the Hellenistic period Greeks interacted with Africans more than before, but in art still ID'd them all as this nationality` },
      { id: 52, text: `Her TV roles have included She-Hulk & on another series, Sarah Manning, Alison Hendrix & Rachel Duncan` },
      { id: 53, text: `A nationalist Gen. in the Spanish Civil War is said to have coined this idiom for a secret group trying to undermine a nation` },
      { id: 54, text: `In a Coleridge classic, this locale is where Kubla Khan did "a stately pleasure-dome decree"` },
      { id: 55, text: `Jacques Cartier discovered this island, but its French name later gave way to one honoring a son of King George III` },
      { id: 56, text: `In realtor-speak it's a big, open area on the main floor; it's not just good, it's a...` },
      { id: 57, text: `Around 1800 Antonio Canova was the greatest sculptor of this old-is-new style with works depicting Cupid, Perseus & Daedalus` },
      { id: 58, text: `She returned to TV as "The Diplomat" Kate Wyler` },
      { id: 59, text: `Do we have an E.T.A. on that? Oh yes, 1810, when his glowing review of Beethoven's Fifth Symphony helped immortalize the work` },
      { id: 60, text: `The ruins of this abbey on the River Wye were namechecked in the title of a poem by William Wordsworth` },
      { id: 61, text: `A biosphere reserve in Michoacán is named for these creatures that turn the forests orange & black every November` }
    ];
    
    // Adding new clues to the existing array
    clues.push(...newClues);
    
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