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
    }
  | { state: 'scroll' }
  | { state: 'move_start'; startX: number; startY: number };

const Swipeable: React.FC<SwipableProps> = (props: SwipableProps) => {
  const [info, setInfo] = useState<SwipeInfo>({ state: 'stop' });
  const [posterIdx, setPosterIdx] = useState(0);
  const rootStyle: CSSProperties = {
    position: 'relative',
    transform: info.state == 'moving' ? `translate3d(${info.currentX - info.startX}px, 0, 0)` : 'initial',
    transition: info.state == 'moving' ? 'initial' : 'translate 200ms ease 0s',
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
      state: 'move_start',
      startX: e.touches[0].clientX,
      startY: e.touches[0].clientY,
    });
  };
  const handleEnd = (_: React.TouchEvent<HTMLDivElement>) => {
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
    } else if (info.state == 'move_start') {
      const touch = e.touches[0];
      const move_direction = Math.abs((info.startX - touch.clientX) / (info.startY - touch.clientY));
      // magic number
      if (move_direction > 1.0) {
        setInfo({
          state: 'moving',
          startX: info.startX,
          currentX: touch.clientX,
        });
      } else {
        setInfo({
          state: 'scroll',
        });
      }
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
