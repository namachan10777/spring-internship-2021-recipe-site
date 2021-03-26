import React, { CSSProperties, ReactNodeArray, ReactNode, useState, useRef, useEffect } from 'react';

export type SwipableProps = {
  children: ReactNodeArray;
  naviLeftIcon?: ReactNode;
  naviRightIcon?: ReactNode;
  indicateAnimation?: string;
  initialIdx?: number;
  onSwiped?: (before: number, after: number) => void;
};

type AnimateState =
  | {
      state: 'moving';
      startX: number;
      currentX: number;
      beforeX: number;
    }
  | {
      state: 'stop';
    }
  | { state: 'scroll' }
  | { state: 'cancel'; timeoutId: NodeJS.Timeout }
  | { state: 'right'; timeoutId: NodeJS.Timeout }
  | { state: 'left'; timeoutId: NodeJS.Timeout }
  | { state: 'move_start'; startX: number; startY: number };

const swipeAnimateDuration = 300;

const Swipeable: React.FC<SwipableProps> = (props: SwipableProps) => {
  const [posterIdx, setPosterIdx] = useState(props.initialIdx ? props.initialIdx : 0);
  const [swiped, setSwiped] = useState(false);
  const [recipeWatching, setRecipeWatching] = useState(false);
  const refRootDiv = useRef<HTMLDivElement>(null);
  const [animateState, setAnimateStateOrigin] = useState<AnimateState>({ state: 'stop' });
  const refAnimateState = useRef(animateState);
  const setAnimateState = (state: AnimateState) => {
    setAnimateStateOrigin(state);
    refAnimateState.current = state;
  };
  useEffect(() => {
    refRootDiv.current?.addEventListener('touchmove', (e) => {
      handleMove(e);
    });
  }, [refRootDiv.current]);
  const swipingToEdge =
    animateState.state == 'moving'
      ? (posterIdx == 0 && animateState.currentX > animateState.startX) ||
        (posterIdx == props.children.length - 1 && animateState.currentX < animateState.startX)
      : false;
  console.log(swipingToEdge);
  const rootStyle: CSSProperties = {
    position: 'relative',
    transform:
      animateState.state == 'moving'
        ? `translate3d(${(animateState.currentX - animateState.startX) / (swipingToEdge ? 6 : 1.5)}px, 0, 0)`
        : animateState.state == 'right'
        ? recipeWatching
          ? 'translate(-100vw)'
          : 'translate(-85vw)'
        : animateState.state == 'left'
        ? recipeWatching
          ? 'translate(100vw)'
          : 'translate(85vw)'
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
  const topMargin = process.browser ? document.documentElement.scrollTop : 0;
  const posterStyle = (id: number): CSSProperties => {
    if (id == posterIdx) {
      return {
        boxShadow: recipeWatching ? 'none' : '0px 0px 10px 3px #878787',
        borderRadius: recipeWatching ? undefined : '1rem',
        width: recipeWatching ? '100vw' : '80vw',
        marginLeft: 'auto',
        marginRight: 'auto',
        transition: animateState.state == 'stop' ? 'all 300ms ease 0s' : 'width 300ms ease 0s',
      };
    } else if (id == posterIdx + 1) {
      return {
        boxShadow: recipeWatching ? 'none' : '0px 0px 10px 3px #878787',
        borderRadius: recipeWatching ? undefined : '1rem',
        width: recipeWatching ? '100vw' : '80vw',
        position: 'absolute',
        top: topMargin,
        left: 0,
        transform: recipeWatching ? 'translate(100vw)' : 'translate(95vw)',
      };
    } else if (id == posterIdx - 1) {
      return {
        boxShadow: recipeWatching ? 'none' : '0px 0px 10px 3px #878787',
        borderRadius: recipeWatching ? undefined : '1rem',
        width: recipeWatching ? '100vw' : '80vw',
        position: 'absolute',
        top: topMargin,
        left: 0,
        transform: recipeWatching ? 'translate(-100vw)' : 'translate(-75vw)',
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
      const accel = animateState.currentX - animateState.beforeX;
      const swipeableToRight = posterIdx < props.children.length - 1;
      const swipeableToLeft = posterIdx > 0;
      const viewWidth = document.body.clientWidth;
      // スワイプで次の要素へ移る処理
      if (swipeableToRight && (moved < -viewWidth / 2 || accel < -1)) {
        autoSwipeRight();
      } else if (swipeableToLeft && (moved > viewWidth / 2 || accel > 1)) {
        autoSwipeLeft();
      } else {
        cancelSwipe();
      }
    }
  };
  const handleMove = (e: TouchEvent) => {
    if (process.browser && document.documentElement.scrollTop > 30) {
      setRecipeWatching(true);
    } else {
      setRecipeWatching(false);
    }
    if (refAnimateState.current) {
      const animateState = refAnimateState.current;
      if (animateState.state == 'moving') {
        e.preventDefault();
        setAnimateState({
          state: 'moving',
          startX: animateState.startX,
          beforeX: animateState.currentX,
          currentX: e.touches[0].clientX,
        });
      } else if (animateState.state == 'move_start') {
        const touch = e.touches[0];
        const move_direction = Math.abs((animateState.startX - touch.clientX) / (animateState.startY - touch.clientY));
        // magic number
        if (move_direction > 1.5) {
          e.preventDefault();
          setAnimateState({
            state: 'moving',
            beforeX: animateState.startX,
            startX: animateState.startX,
            currentX: touch.clientX,
          });
        } else {
          setAnimateState({
            state: 'scroll',
          });
        }
      }
    }
  };
  const autoSwipeRight = () => {
    setAnimateState({
      state: 'right',
      timeoutId: setTimeout(() => {
        if (props.onSwiped) {
          props.onSwiped(posterIdx, posterIdx + 1);
        }
        setPosterIdx(posterIdx + 1);
        setAnimateState({ state: 'stop' });
        scrollTo({
          top: 0,
        });
      }, swipeAnimateDuration),
    });
  };
  const autoSwipeLeft = () => {
    setAnimateState({
      state: 'left',
      timeoutId: setTimeout(() => {
        if (props.onSwiped) {
          props.onSwiped(posterIdx, posterIdx - 1);
        }
        setPosterIdx(posterIdx - 1);
        setAnimateState({ state: 'stop' });
        scrollTo({
          top: 0,
        });
      }, swipeAnimateDuration),
    });
  };
  const cancelSwipe = () => {
    setAnimateState({
      state: 'cancel',
      timeoutId: setTimeout(() => {
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
      <div style={rootStyle} onTouchStart={(e) => handleStart(e)} onTouchEnd={(e) => handleEnd(e)} ref={refRootDiv}>
        {props.children.map((node, i) => (
          <div key={i} style={posterStyle(i)}>
            {node}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Swipeable;
