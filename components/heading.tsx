import * as React from 'react';
import 'tailwindcss/tailwind.css';
import Link from 'next/link';
import { IoMdHeart, IoMdHeartEmpty } from 'react-icons/io';
import 'tailwindcss/tailwind.css';

type HeadingProps = {
  id: string;
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
          width={1280}
          height={720}
          className="w-5/12 flex-shrink-0 my-auto"
        />
      </Link>
      <div>
        <header className="text-lg mb-1 font-bold flex flex-row">
          {props.registered ? (
            <button onClick={() => props.unregisterBookmark()}>
              <IoMdHeart className="text-xl text-red-700 mx-1" />
            </button>
          ) : (
            <button onClick={() => props.registerBookmark()}>
              <IoMdHeartEmpty className="text-xl text-black mx-1" />
            </button>
          )}
          <div>
            <Link href={`/${props.id}`}>{props.title}</Link>
          </div>
        </header>
        <p>{props.description}</p>
      </div>
    </section>
  );
};

export default Heading;
