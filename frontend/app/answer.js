import Button from "./button";
import Link from 'next/link';

export default function Answer(props) {

    return (
      <article 
        className={`bg-gray-300 rounded-xl text-gray-900 py-6 px-4 gap-8 flex flex-col gap-8`}>
        <section className="flex flex-col gap-2">
            <p className="text-sm font-bold">
                The Clue you're looking for is:
            </p>
            <p className="text-lg">
                {props.text}
            </p>
        </section>
        <div>
            <Button 
                text={"Find a new clue"}
                onClick={props.action} 
                className={`inline-block bg-blue-900 rounded-xl text-gray-50 py-4 px-8`}>
            </Button>
        </div>
      </article>
    );
  }