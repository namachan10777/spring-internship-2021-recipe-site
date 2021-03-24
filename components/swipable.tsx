import React, { CSSProperties, ReactNodeArray, ReactNode, useState } from 'react';

export type SwipableProps = {
  children: ReactNodeArray;
  naviLeftIcon?: ReactNode;
  naviRightIcon?: ReactNode;
};

type AnimateState =
  | {
      state: 'moving';
      startX: number;
      currentX: number;
    }
  | {
      state: 'stop';
    }
  | { state: 'scroll' }
  | { state: 'right'; timeoutId: NodeJS.Timeout }
  | { state: 'left'; timeoutId: NodeJS.Timeout }
  | { state: 'move_start'; startX: number; startY: number };

const swipeAnimateDuration = 300;

const Swipeable: React.FC<SwipableProps> = (props: SwipableProps) => {
  const [posterIdx, setPosterIdx] = useState(0);
  const [swiped, setSwiped] = useState(false);
  const [animateState, setAnimateState] = useState<AnimateState>({ state: 'stop' });
  // これよくないね。class componentにしましょう
  const rootStyle: CSSProperties = {
    position: 'relative',
    transform:
      animateState.state == 'moving'
        ? `translate3d(${
            (animateState.currentX - animateState.startX) /
            (posterIdx == 0 || posterIdx == props.children.length - 1 ? 5 : 1)
          }px, 0, 0)`
        : animateState.state == 'right'
        ? 'translate(-100vw)'
        : animateState.state == 'left'
        ? 'translate(100vw)'
        : 'initial',
    transition:
      animateState.state == 'moving' || animateState.state == 'scroll' || animateState.state == 'stop'
        ? 'initial'
        : `transform ${swipeAnimateDuration}ms ease 0s`,
  };
  const containerStyle: CSSProperties = {
    position: 'sticky',
    overflow: 'hidden',
    width: '100%',
  };
  const posterStyle = (id: number): CSSProperties => {
    if (id == 1 && !swiped) {
      // TODO animation
      return {
        position: 'absolute',
        top: 0,
        left: 0,
        boxShadow: '-10px 0px 10px rgba(0, 0, 0, 0.4)',
        transform: 'translate(100vw)',
      };
    }
    else if (id == posterIdx) {
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
    setSwiped(true);
    if (animateState.state == 'left' || animateState.state == 'right') {
      clearTimeout(animateState.timeoutId);
    }
    setAnimateState({
      state: 'move_start',
      startX: e.touches[0].clientX,
      startY: e.touches[0].clientY,
    });
  };
  const handleEnd = (_: React.TouchEvent<HTMLDivElement>) => {
    if (animateState.state == 'moving' && document) {
      const moved = animateState.currentX - animateState.startX;
      if (moved < -document.body.clientWidth / 2 && posterIdx < props.children.length - 1) {
        autoSwipeRight();
      } else if (moved > document.body.clientWidth / 2 && posterIdx > 0) {
        autoSwipeLeft();
      }
    }
  };
  const handleMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (animateState.state == 'moving') {
      setAnimateState({
        state: 'moving',
        startX: animateState.startX,
        currentX: e.touches[0].clientX,
      });
    } else if (animateState.state == 'move_start') {
      const touch = e.touches[0];
      const move_direction = Math.abs((animateState.startX - touch.clientX) / (animateState.startY - touch.clientY));
      // magic number
      if (move_direction > 1.0) {
        setAnimateState({
          state: 'moving',
          startX: animateState.startX,
          currentX: touch.clientX,
        });
      } else {
        setAnimateState({
          state: 'scroll',
        });
      }
    }
  };
  const autoSwipeRight = () => {
    setAnimateState({
      state: 'right',
      timeoutId: setTimeout(() => {
        setPosterIdx(posterIdx + 1);
        setAnimateState({ state: 'stop' });
      }, swipeAnimateDuration),
    });
  };
  const autoSwipeLeft = () => {
    setAnimateState({
      state: 'left',
      timeoutId: setTimeout(() => {
        setPosterIdx(posterIdx - 1);
        setAnimateState({ state: 'stop' });
      }, swipeAnimateDuration),
    });
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
          setSwiped(true);
          if (animateState.state == 'left' || animateState.state == 'right') {
            clearTimeout(animateState.timeoutId);
          }
          autoSwipeLeft();
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
          setSwiped(true);
          if (animateState.state == 'left' || animateState.state == 'right') {
            clearTimeout(animateState.timeoutId);
          }
          autoSwipeRight();
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
