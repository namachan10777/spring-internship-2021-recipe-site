import * as React from 'react';
import 'tailwindcss/tailwind.css';
import Link from 'next/link';
import { IoMdHeart, IoMdHeartEmpty } from 'react-icons/io';
import 'tailwindcss/tailwind.css';

type HeadingProps = {
  id: number;
  title: string;
  description: string;
  image_url: string | null;
  registerBookmark: () => void;
  unregisterBookmark: () => void;
  registered: boolean;
};

const Heading: React.FC<HeadingProps> = (props: HeadingProps) => {
  // TODO: dummy image url
  return (
    <section className="flex flex-row my-1 border-b-2 p-2">
      <Link href={`/${props.id}`}>
        <img
          src={props.image_url ? props.image_url : 'dummy'}
          alt={props.title}
          className="w-5/12 flex-shrink-0 my-auto"
        />
      </Link>
      <div className="ml-2">
        <button
          onClick={() => {
            if (props.registered) {
              props.unregisterBookmark();
            } else {
              props.registerBookmark();
            }
          }}
        >
          {props.registered ? <IoMdHeart className="text-red-700" /> : <IoMdHeartEmpty className="text-black" />}
        </button>
        <header className="text-lg mb-1 font-bold">
          <Link href={`/${props.id}`}>{props.title}</Link>
        </header>
        <p>{props.description}</p>
      </div>
    </section>
  );
};

export default Heading;
