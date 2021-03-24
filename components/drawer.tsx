import React, { CSSProperties, PropsWithChildren, ReactElement } from 'react';

export type DrawerProps = {
  width: string;
  open: boolean;
  onClose: () => void;
  drawerElements: ReactElement[];
};

const Drawer: React.FC<PropsWithChildren<DrawerProps>> = (props: PropsWithChildren<DrawerProps>) => {
  const mask_style: CSSProperties = {
    position: 'fixed',
    transition: 'opacity 225ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
    zIndex: 1000,
    top: 0,
    bottom: 0,
    right: 0,
    width: props.open ? '100%' : '0%',
    height: '100%',
    transitionProperty: 'background',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  };
  const drawer_style: CSSProperties = {
    position: 'fixed',
    width: props.width,
    transform: props.open ? 'none' : `translate(-${props.width})`,
    transition: 'opacity 225ms cubic-bezier(0, 0, 0.2, 1) 0ms',
    top: 0,
    overflowY: 'scroll',
    transitionProperty: 'all',
    display: 'flex',
    zIndex: 1001,
    height: '100%',
    backgroundColor: 'white',
    flexDirection: 'column',
  };
  const root_style: CSSProperties = {
    zIndex: 1300,
  };
  return (
    <div>
      {props.children}
      <div style={root_style}>
        <div style={mask_style} onClick={() => props.onClose()}></div>
        <div style={drawer_style}>{props.drawerElements}</div>
      </div>
    </div>
  );
};

export default Drawer;
