import React, { CSSProperties, ReactNodeArray, useState } from 'react';

export type SwipableProps = {
  children: ReactNodeArray;
};

type SwipeInfo =
  | {
      state: 'moving';
      startX: number;
      currentX: number;
    }
  | {
      state: 'stop';
    };

const Swipeable: React.FC<SwipableProps> = (props: SwipableProps) => {
  const [info, setInfo] = useState<SwipeInfo>({ state: 'stop' });
  const root_style: CSSProperties = {};
  const style: CSSProperties = {
    transform: info.state == 'moving' ? `translate(${info.currentX - info.startX}px)` : 'initial',
    transition: info.state == 'stop' ? 'translate 200ms ease 0s' : undefined,
  };
  console.log(style);
  const handleStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setInfo({
      state: 'moving',
      startX: e.touches[0].clientX,
      currentX: e.touches[0].clientX,
    });
  };
  const handleEnd = (_: React.TouchEvent<HTMLDivElement>) => {
    setInfo({
      state: 'stop',
    });
  };
  const handleMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (info.state == 'moving') {
      setInfo({
        state: 'moving',
        startX: info.startX,
        currentX: e.touches[0].clientX,
      });
    }
  };
  return (
    <div style={root_style}>
      {props.children.map((node, i) => (
        <div
          key={i}
          style={style}
          onTouchMove={(e) => handleMove(e)}
          onTouchStart={(e) => handleStart(e)}
          onTouchEnd={(e) => handleEnd(e)}
        >
          {node}
        </div>
      ))}
    </div>
  );
};

export default Swipeable;
