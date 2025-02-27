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
        { id: 1, text: "On the Roman calendar, Feb. 13 was these of February, not quite as well known as the ones of March" },
        { id: 2, text: "A little easier on the wallet, this type of gem is created in a lab" },
        { id: 3, text: "Hannibal Lecter, who (mis)treated Mason Verger" },
        { id: 4, text: "Tami Taylor (Connie Britton) worked as a guidance counselor at Dillon High School, home of Panthers football, on this series" },
        { id: 5, text: "The sagittarii were these type of soldiers in the Roman army" },
        { id: 6, text: 'Ten high school pals who continued being "it" for more than 20 years inspired this 2018 movie with Jeremy Renner & Jon Hamm' },
        { id: 7, text: "Perhaps in the spirit of George Washington's birthday, National this dessert Day is celebrated on February 20" },
        { id: 8, text: "This North American tree throws a lot of shade & its peeling bark can look like camouflage" },
        { id: 9, text: "Miss Jean Brodie" },
        { id: 10, text: "Jewel won the sixth season of this series, competing as the Queen of Hearts" },
        { id: 11, text: "An ancient Persian force was called the 10,000 these--the soldiers didn't live forever, but were replaced as soon as they died" },
        { id: 12, text: '"Squid Game" put a gruesome twist on this stop-&-go game also called Statues' },
        { id: 13, text: "This stock market index debuted in February 1971" },
        { id: 14, text: 'The state motto of Virginia translates as "Thus Always to" these' },
        { id: 15, text: "Mitch McDeere" },
        { id: 16, text: 'This sitcom stalwart plays Charles, "A Man on the Inside" investigating crime at a nursing home' },
        { id: 17, text: "Geoffroi de Charney belonged to this order of knights & was immolated in 1314 with the grand master of his order" },
        { id: 18, text: "'90s kids might remember this game played with cardboard, bottle caps & slammers" },
        { id: 19, text: "This English chocolate company is credited with introducing the heart-shaped box of chocolates on Valentine's in 1868" },
        { id: 20, text: "This small area at the base of the brain helps manage, among other things, body temperature & thirst & hunger" },
        { id: 21, text: "Oliver Mellors, working on the Chatterley estate" },
        { id: 22, text: "Dominic West was McNulty on 'The Wire' & unfaithful spouse Noah Solloway on this Showtime series" },
        { id: 23, text: "17th century Ethiopian warrior Malik Ambar fought Jahangir, a ruler of this dynasty, on the Deccan plateau of India" },
        { id: 24, text: 'Come outside & play this verbal contest with me; the OED says it is where "2 people exchange insults" & mentions your mama' },
        { id: 25, text: "This group went to work for the first time in February 1790 with John Jay presiding" },
        { id: 26, text: "To the Greeks it was 10,000 specifically, but we think of it as being innumerable or an abundance of something" },
        { id: 27, text: "Howard Roark, who laughed in an opening line" },
        { id: 28, text: 'He was just a writer on "Ted Lasso" but thought, "I really identify with Roy Kent, so I should play him" & did' },
        { id: 29, text: 'From Arabic for "slave", these warriors established a dynasty in Egypt & Syria from 1250 to 1517' },
        { id: 30, text: 'Speeds can reach 150 mph in this fast-paced sport, "merry festival" in Basque' },
        { id: 31, text: 'In a poem inspired by this film, Amanda Gorman wrote, "Defending the good is how we defy gravity"' },
        { id: 32, text: "The Romans called this Somerset city Aquae Sulis, then probably took a soak there" },
        { id: 33, text: "Queen Victoria gave birth to her son Leopold in 1853, when this man (& sons) opened a piano shop in Manhattan" },
        { id: 34, text: 'One of the larger items auctioned off by Sotheby\'s was Sue, one of these, now residing at Chicago\'s Field Museum' },
        { id: 35, text: "About two inches, give or take a whisker, Otocinclus laps up algae & is related to the bullhead as this type of fish" },
        { id: 36, text: "If you've tabled an issue, you've put it on this proverbial spot, where it can simmer" },
        { id: 37, text: 'Frank Bidart\'s poem about this actor notes "The Joker\'s voice, so unlike the bruised, withheld, wounded voice of Ennis Del Mar"' },
        { id: 38, text: "This city on the Yamuna River in Uttar Pradesh is also home to the Pearl Mosque" },
        { id: 39, text: "In the 1850s Mendel studied pea plants & this Dem. senator introduced his Freeport Doctrine allowing laws tough on slave owners" },
        { id: 40, text: "A surplus of its office assets were auctioned off in 2023, including a neon bird sign from its San Francisco HQ" },
        { id: 41, text: "It's the 6-letter word for the hairy flap of skin under a moose's chin" },
        { id: 42, text: "Just the most basic, like a skeleton" },
        { id: 43, text: "Frank O'Hara wrote a poem for this film star after he died in a 1955 car accident" },
        { id: 44, text: "In 2015 Yemen's government fled to this port city after Houthi rebels captured Sana'a" },
        { id: 45, text: 'Mozart composed "Cosi fan tutte" around the time when this French guy was writing his "Elementary Treatise on Chemistry"' },
        { id: 46, text: "Written mostly by Bill W., the original working draft for this organization's Big Book was sold in 2018" },
        { id: 47, text: "Fratercula, a genus name of this sea parrot, means 'little brother', a reference to how its plumage looks like a monk's robe" },
        { id: 48, text: "In his 1941 State of the Union, FDR enumerated this quartet" },
        { id: 49, text: 'John Murillo name-drops Bruce Lee & Jim Kelly in a poem named for this 1973 martial arts film' },
        { id: 50, text: "This picturesque Austrian city on the Danube claims its namesake torte is the oldest cake named for a city" },
        { id: 51, text: 'Cecil B. DeMille directed the hit epic "The Ten Commandments"; this 1923 insurrection led by Hitler was a failure' },
        { id: 52, text: "The mahogany table on which he signed his abdication papers in 1936 was sold 62 years later for around $400,000" },
        { id: 53, text: "An endangered species, the golden lion variety of this primate lives exclusively in forested habitats in Brazil in the wild" },
        { id: 54, text: 'This pair of words is in the title of books that collect the pithy quotes of Oscar Wilde, Abraham Lincoln & others' },
        { id: 55, text: 'Allen Ginsberg\'s poem "The Blue Angel" begins with this German actress "singing a lament"' },
        { id: 56, text: "In 2011 this city in Africa became the world's newest national capital" },
        { id: 57, text: 'While Molière was cornering the market on French comedy, this "Phèdre" playwright was the virtuoso of French tragedy' },
        { id: 58, text: 'In 2018 a bronze head by this "Bird in Space" sculptor sold at auction for $71 million' },
        { id: 59, text: "These pointy denizens of the ocean were actually named after an earlier word for hedgehogs" },
        { id: 60, text: "This pair that tests one's forbearance sounds redundant; the phrase was used about St. Paul's epistle to the Romans" }
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