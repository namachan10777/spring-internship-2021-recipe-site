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
  const [posterIdx, setPosterIdx] = useState(0);
  const rootStyle: CSSProperties = {
    position: 'relative',
    transform: info.state == 'stop' ? 'initial' : `translate3d(${info.currentX - info.startX}px, 0, 0)`,
    transition: info.state == 'stop' ? 'translate 200ms ease 0s' : 'initial',
  };
  const containerStyle: CSSProperties = {
    position: 'sticky',
    overflow: 'hidden',
    width: '100%',
  };
  const posterStyle = (id: number): CSSProperties => {
    if (id == posterIdx) {
      return {};
    } else if (id == posterIdx + 1) {
      return {
        position: 'absolute',
        top: 0,
        left: 0,
        transform: 'translate(100vw)',
      };
    } else if (id == posterIdx - 1) {
      return {
        position: 'absolute',
        top: 0,
        left: 0,
        transform: 'translate(-100vw)',
      };
    } else {
      return {
        display: 'none',
      };
    }
  };
  const handleStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setInfo({
      state: 'moving',
      startX: e.touches[0].clientX,
      currentX: e.touches[0].clientX,
    });
  };
  const handleEnd = (_: React.TouchEvent<HTMLDivElement>) => {
    console.log(props.children);
    if (info.state == 'moving' && document) {
      const moved = info.currentX - info.startX;
      if (moved < -document.body.clientWidth / 2 && posterIdx < props.children.length - 1) {
        setPosterIdx(posterIdx + 1);
      } else if (moved > document.body.clientWidth / 2 && posterIdx > 0) {
        setPosterIdx(posterIdx - 1);
      }
    }
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
    <div style={containerStyle}>
      <div style={rootStyle}>
        {props.children.map((node, i) => (
          <div
            key={i}
            style={posterStyle(i)}
            onTouchMove={(e) => handleMove(e)}
            onTouchStart={(e) => handleStart(e)}
            onTouchEnd={(e) => handleEnd(e)}
          >
            {node}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Swipeable;
