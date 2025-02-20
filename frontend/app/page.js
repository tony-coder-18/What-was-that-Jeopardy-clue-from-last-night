"use client";

import Image from "next/image";
import Button from "./button";
import { useState } from "react";
import Answer from "./answer";

export default function Home() {
  const [clueSearch, setCluesearch] = useState("");
  const [clueAnswer, setClueAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const getRandomIndex = (maximunIndex) => {
    return Math.floor((Math.random() * maximunIndex));
  };

  const fetchAnswer = async (clueSearch) => {
    setLoading(true);
    const url = `http://localhost:3000/search?search=${clueSearch}`;
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {'Content-Type': 'application/json'},
      });

      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }

      setLoading(false);
      const json = await response.json();
      setClueAnswer(json.clueAnswer);
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleClueChange = (event) => {
    setCluesearch(event.target.value)
  };

  const handleClueSubmit = (event) => {
    event.preventDefault();
    fetchAnswer(clueSearch);
    fetchAnswer(clueSearch);
  };

  return (
    <div className="flex-1">
      <main className="flex flex-col gap-20 px-8">
        { !clueAnswer && <section  className="contents">
          <h1 className="flex flex-col gap-4 py-2 text-center">
            <span className="text-xl">
              What was that clue from last
            </span>
            <span className="font-bold text-6xl">
              Jeopardy!
            </span>
          </h1>

          <form onSubmit={handleClueSubmit} className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <label htmlFor="clue">
                Type what you remember about the clue
              </label>
              <input
                id="clue"
                type="text"
                value={clueSearch}
                onChange={handleClueChange}
                className="bg-gray-300 p-4 rounded-xl" />
            </div>
            <div>
              <Button loading={loading} type="submit" id="findClue" text="Find my clue" />
            </div>
          </form>
        </section>}

        { clueAnswer && <section>
          <Answer 
            action={() => {
              // Reset state
              setCluesearch("");
              setClueAnswer("");
            }}
            text={clueAnswer} />
        </section>}
      </main>
    </div>
  );
}