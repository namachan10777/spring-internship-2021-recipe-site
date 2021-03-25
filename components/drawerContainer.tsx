import React, { PropsWithChildren, useState } from 'react';
import Link from 'next/link';
import Drawer from './drawer';
import Search from './search';
import { useRouter } from 'next/dist/client/router';
import { MdBookmark, MdMenu } from 'react-icons/md';

export type Props = {
  search?: string;
};

const DrawerContainer: React.FC<PropsWithChildren<Props>> = (props: PropsWithChildren<Props>) => {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const handleSearch = (searchWord: string) => {
    if (props.search !== searchWord) {
      router.push(`/?search=${searchWord}`);
    }
  };
  const drawerContents = [
    <div key="myfolder" className="text-xl border-b p-2 cursor-pointer">
      <Link href="/myfolder">
        <span className="inline-flex items-center">
          <MdBookmark className="text-2xl mr-2" />
          マイフォルダ
        </span>
      </Link>
    </div>,
  ];
  return (
    <Drawer drawerElements={drawerContents} width="300px" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
      <header className="bg-gray-300 flex flex-row items-center">
        <button className="h-10 w-10" onClick={() => setDrawerOpen(!drawerOpen)}>
          <MdMenu className="text-2xl mx-auto" />
        </button>
        <h1 className="text-xl ml-4 my-2 font-bold">
          <Link href="/">クッキングパッド</Link>
        </h1>
      </header>
      {props.search != null ? (
        <div className="my-4 mx-2">
          <Search keyword={props.search} onSubmit={(searchWord) => handleSearch(searchWord)} />
        </div>
      ) : null}
      {props.children}
    </Drawer>
  );
};

export default DrawerContainer;
