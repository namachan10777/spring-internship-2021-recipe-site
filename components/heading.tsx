import * as React from 'react';
import 'tailwindcss/tailwind.css';

type HeadingProps = {
  title: string;
  description: string;
  image_url: string | null;
};

const Heading: React.FC<HeadingProps> = (props: HeadingProps) => {
  // TODO: dummy image url
  return (
    <section className="flex flex-row m-1">
      <img src={props.image_url ? props.image_url : 'dummy'} alt={props.title} className="w-5/12 flex-shrink-0"/>
      <div className="ml-2">
        <header className="text-xl mb-1">{props.title}</header>
        <p>{props.description}</p>
      </div>
    </section>
  );
};

export default Heading;
