import Link from 'next/link';

export default function Footer() {
    return (
      <footer 
        className="flex justify-between px-8 py-4 bg-gray-300 text-gray-900">
        <Link href="/" className="inline-block font-bold">
          Home
        </Link>
        <p className="font-light">
            Made with love by&nbsp;
            <a 
            className="underline"
            target="_blank" 
            href="https://www.linkedin.com/in/billllachsoftwareengineer/">Bill
            </a>,&nbsp;
            <a 
            className="underline"
            href="#">
                 SDG
            </a>
        </p>
      </footer>
    );
  }
  