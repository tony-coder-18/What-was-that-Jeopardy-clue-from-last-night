"use client"

import Image from "next/image";
import Button from "../button";
import {useState} from "react";
import Answer from "../answer";

export default function Page() {

  return (
    <div className="flex-1">
      <main className="flex flex-col gap-20 px-8">
        <Answer text="The director called this film “about a bunch of Gen Zers with no cell service ‘Lord of the Flies’ meets ‘Mean Girls'”" />
      </main>
    </div>
  );
}