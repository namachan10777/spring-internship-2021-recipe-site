import React, { CSSProperties, ReactNodeArray, ReactNode, useState } from 'react';

export type SwipableProps = {
  children: ReactNodeArray;
  naviLeftIcon?: ReactNode;
  naviRightIcon?: ReactNode;
};

type SwipeInfo =
  | {
      state: 'moving';
      startX: number;
      currentX: number;
    }
  | { state: 'released' }
  | {
      state: 'stop';
    }
  | { state: 'scroll' }
  | { state: 'move_start'; startX: number; startY: number };

type SwipeAnimateState =
  | { state: 'right'; timeoutId: NodeJS.Timeout }
  | { state: 'left'; timeoutId: NodeJS.Timeout }
  | { state: 'stop' };

const swipeAnimateDuration = 300;

const Swipeable: React.FC<SwipableProps> = (props: SwipableProps) => {
  const [info, setInfo] = useState<SwipeInfo>({ state: 'stop' });
  const [posterIdx, setPosterIdx] = useState(0);
  const [animateState, setAnimateState] = useState<SwipeAnimateState>({ state: 'stop' });
  // これよくないね。class componentにしましょう
  const rootStyle: CSSProperties = {
    position: 'relative',
    transform:
      info.state == 'moving'
        ? `translate3d(${
            (info.currentX - info.startX) / (posterIdx == 0 || posterIdx == props.children.length - 1 ? 5 : 1)
          }px, 0, 0)`
        : animateState.state == 'right'
        ? 'translate(-100vw)'
        : animateState.state == 'left'
        ? 'translate(100vw)'
        : 'initial',
    transition:
      info.state == 'moving'
        ? 'initial'
        : info.state == 'released'
        ? 'transform 200ms ease 0s'
        : animateState.state == 'stop'
        ? 'initial'
        : `transform ${swipeAnimateDuration}ms ease 0s`,
  };
  console.log(rootStyle);
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
    if (animateState.state == 'left' || animateState.state == 'right') {
      clearTimeout(animateState.timeoutId);
    }
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
      state: 'released',
    });
    setTimeout(() => {
      setInfo({
        state: 'stop',
      });
    }, 200);
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
  const naviCommonStyle: CSSProperties = {
    top: '40%',
    position: 'fixed',
    zIndex: 900,
  };
  const naviLeft =
    posterIdx > 0 && props.naviLeftIcon ? (
      <div
        style={{ ...naviCommonStyle, left: 0 }}
        onClick={() => {
          if (animateState.state == 'left' || animateState.state == 'right') {
            clearTimeout(animateState.timeoutId);
          }
          setAnimateState({
            state: 'left',
            timeoutId: setTimeout(() => {
              setAnimateState({ state: 'stop' });
              setPosterIdx(posterIdx - 1);
            }, swipeAnimateDuration),
          });
        }}
      >
        {props.naviLeftIcon}
      </div>
    ) : null;
  const naviRight =
    posterIdx < props.children.length - 1 && props.naviRightIcon ? (
      <div
        style={{ ...naviCommonStyle, right: 0 }}
        onClick={() => {
          if (animateState.state == 'left' || animateState.state == 'right') {
            clearTimeout(animateState.timeoutId);
          }
          setAnimateState({
            state: 'right',
            timeoutId: setTimeout(() => {
              setAnimateState({ state: 'stop' });
              setPosterIdx(posterIdx + 1);
            }, swipeAnimateDuration),
          });
        }}
      >
        {props.naviRightIcon}
      </div>
    ) : null;
  return (
    <div style={containerStyle}>
      {naviLeft}
      {naviRight}
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
