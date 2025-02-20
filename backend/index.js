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
        { id: 1, text: "This Arthur, er, author, was knighted for his work in & about the Boer War" },
        { id: 2, text: "If you hit for the cycle in baseball, you've gotten all of these hits in one game, & congrats!" },
        { id: 3, text: "This opera was commissioned by the Khedive of Egypt & earned its composer 150,000 francs" },
        { id: 4, text: "Casamigos Añejo & Don Julio Blanco are bottles of this" },
        { id: 5, text: "The removal of 4 dams on the Klamath River has cut hydro power a bit but allowed these fish to return to their historic habitat" },
        { id: 6, text: "Rising from the Nevada desert in 2008, this band has had Top 10 hits with songs like 'Demons' & 'Radioactive'" },
        { id: 7, text: "Although it wasn't his 'Endgame', this author worked as James Joyce's amanuensis after moving from Dublin to Paris" },
        { id: 8, text: "A soccer team facing a free kick may form this architecturally named blocking formation & ouch" },
        { id: 9, text: "His 1884 'Holberg Suite' was written to commemorate the 200th birthday of Norwegian-born writer Ludvig Holberg" },
        { id: 10, text: "Queen Victoria adorns the label of this brand's Sapphire gin" },
        { id: 11, text: "OPEC's 1973 ban on sales to the U.S., then heavily dependent on foreign oil, is known as this word from the Spanish" },
        { id: 12, text: "This word that follows Uther in the name of King Arthur's father is a title for ancient British chiefs" },
        { id: 13, text: "After writing what Jack London called ''The Uncle Tom's Cabin' of wage slavery', he ran for governor of California three times" },
        { id: 14, text: "A classic volleyball sequence goes bump (stop the shot), set (tee up a teammate), this powerful attacking hit that may yield a kill" },
        { id: 15, text: "Tchaikovsky described this piece as very noisy with no great artistic value" },
        { id: 16, text: "The word 'whiskey' comes from the Gaelic for 'water of life', a translation of this Latin phrase" },
        { id: 17, text: "This word is found in the names of 3 now-decommissioned nuclear power plants, following Vermont, Maine & of course Connecticut" },
        { id: 18, text: "This book's title character is 'Armansky's star researcher... a pale, anorexic young woman who had hair as short as a fuse'" },
        { id: 19, text: "When this short story writer was on the lam, he headed down Honduras way, hung out with a bank robber & wrote 'Cabbages & Kings'" },
        { id: 20, text: "Also a place to store fishing gear, in football it's the area of the offensive backfield seen here" },
        { id: 21, text: "Despite its name this Chopin piece typically takes longer than 60 seconds to play" },
        { id: 22, text: "One ingredient in Aperol is this tart root also known as the pieplant" },
        { id: 23, text: "A turning point in empowering U.S. labor was a 1902 strike of this state's anthracite miners, driving up prices" },
        { id: 24, text: "Duanwu Jie in Chinese, this festive holiday features aquatic races, rice dumplings & rituals to ward off evil" },
        { id: 25, text: "In his early 20s this poet who wrote 'A Season in Hell' wanted a season abroad; he quit poetry & traveled the world" },
        { id: 26, text: "Named for a tough hockey HOFer, a Gordie Howe hat trick is scoring a goal, earning an assist & doing this" },
        { id: 27, text: "In 1931, 20 years after his death in Vienna, his 9th symphony had its U.S. premiere by the Boston Symphony" },
        { id: 28, text: "This Mexican liqueur brand uses arabica coffee beans & rum" },
        { id: 29, text: "Rapid clicking when you try to start your car is a sign of cold cranking, a problem with this item" },
        { id: 30, text: "This warning is not really found on old maps but really is found (in Latin) on a globe circa 1510" },
        { id: 31, text: "A is for this open central court of a Roman house or in Atlanta's Hyatt Regency" },
        { id: 32, text: "In 2022, Black actors played this family for the first time on Broadway in a revival of 'Death of a Salesman'" },
        { id: 33, text: "Staying on brand in 1581, he murdered his heir & namesake; Russia's Time of Troubles lay ahead" },
        { id: 34, text: "You could use the word zaftig or this synonym inspired by a Baroque master" },
        { id: 35, text: "Symbol Mg, this element that's essential to life might help with sleep issues & prevent migraines" },
        { id: 36, text: "On Sicily: this volcano at more than 11,000 feet" },
        { id: 37, text: "G is for this triangular end of a wall that mirrors the shape of the pitched roof" },
        { id: 38, text: "Opening in 2024, the jukebox musical 'A Wonderful World' traces the life of this legendary jazz great" },
        { id: 39, text: "Carlos I of this nation & his son were slain in 1908; another son, Manuel II, would take over, but by 1910 a republic was born" },
        { id: 40, text: "French for great generosity, it starts with a word for very big" },
        { id: 41, text: "27.7% of the Earth's crust is made up of this element that's used in computer chips" },
        { id: 42, text: "On Baffin Island: This mountain named for a thunder god with the world's greatest vertical drop" },
        { id: 43, text: "M is for this tower where a muezzin calls the faithful to prayer" },
        { id: 44, text: "In 1996, Idina Menzel was among a host of young people who made their Broadway debuts in this Jonathan Larson musical" },
        { id: 45, text: "This heir, a valuable pawn after his mom & dad got the guillotine in 1793, was determined to have died in a prison" },
        { id: 46, text: "Originally a type of Greek poem; Tennyson wrote some 'of the King'" },
        { id: 47, text: "Iron combines with oxygen to make ferric oxide, aka this mineral named for its blood red color" },
        { id: 48, text: "On Cyprus: this 6,000+-foot peak named just like the deity domicile on the mainland" },
        { id: 49, text: "N is for this architectural style of the U.S. Capitol & the White House" },
        { id: 50, text: "In the 1990s both parts of this Tony Kushner epic won Tonys for Best Play" },
        { id: 51, text: "Archduke Karl Ludwig's death made Franz Ferdinand next up for the Austro-Hungarians, but Franz would die in this city" },
        { id: 52, text: "The Latin for 'cage' may have given us this word for coaxing via flattery" },
        { id: 53, text: "The Og of elements is oganesson--though we don't know for sure it's a gas, it's part of group 18, this septet" },
        { id: 54, text: "On Hokkaido: this mountain (the island's tallest) that shares its name with a start-of-the-alphabet Japanese beer" },
        { id: 55, text: "C is for this column with female figures named for Greek maidens" },
        { id: 56, text: "In 2010, Adam Driver made his Broadway debut in a revival of this playwright's 'Mrs. Warren's Profession'" },
        { id: 57, text: "Cleopatra's son with a famous dad, he was king of Egypt for a while but larger ambitions saw his downfall in Alexandria" },
        { id: 58, text: "This word for a loyal follower is named for Thessalians devoted to Achilles; legend says they were once ants" },
        { id: 59, text: "You may have to drink this whitish element in liquid form for imaging of your GI tract" },
        { id: 60, text: "On New Zealand's South Island: this mountain also known as Mount Cook" },
        { id: 61, text: "He wrote, 'I must make the founder of lovely & famous Athens the counterpart... to the father of... glorious Rome'" },
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