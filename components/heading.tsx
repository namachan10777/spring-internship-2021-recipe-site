import * as React from 'react';

type HeadingProps = {
  title: string;
  description: string;
  image_url: string | null;
};

const Heading: React.FC<HeadingProps> = (props: HeadingProps) => {
  // TODO: dummy image url
  return (
    <section>
      <img src={props.image_url ? props.image_url : "dummy" } alt={props.title}/>
      <div><header>{props.title}</header><p>{props.description}</p></div>
    </section>
  );
};

export default Heading;
