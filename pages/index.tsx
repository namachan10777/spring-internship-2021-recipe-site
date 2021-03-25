import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/dist/client/router';
import * as Bookmark from '../lib/bookmark';
import 'tailwindcss/tailwind.css';
import { MdBookmark, MdMenu } from 'react-icons/md';
import Heading from '../components/heading';
import Search from '../components/search';
import { RecipesPage, RecipesPageQuery } from '../lib/generated/graphql';
import { client } from '../lib/graphql_client';
import query from '../graphql/ops/recipes_page';
import Drawer from '../components/drawer';

type HomeProps = {
  page: number;
  search: string;
  queried: RecipesPage | null;
};

export default function Home(props: HomeProps) {
  const router = useRouter();
  const { search, page, queried } = props;
  const genPageQuery = (p: number) => (p === 0 ? '' : `page=${p}`);
  const genSearchQuery = (s: string) => (s === '' ? '' : `search=${s}`);
  const genQuery = (p: number, s: string): string => {
    const queryString = [genPageQuery(p), genSearchQuery(s)].filter((query) => query !== '').join('&');
    return queryString === '' ? '' : `?${queryString}`;
  };
  const handleSearch = (searchWord: string) => {
    if (search !== searchWord) {
      router.push(`/?search=${searchWord}`);
    }
  };
  const [bookmarkMask, setBookmarkMask] = useState<{ [key: string]: boolean }>({});
  const unregisterBookmark = (id: string) => {
    Bookmark.unregister(id);
    setBookmarkMask({ ...bookmarkMask, [id]: false });
  };
  const registerBookmark = (id: string) => {
    Bookmark.register(id);
    setBookmarkMask({ ...bookmarkMask, [id]: true });
  };
  const recipes = queried ? queried.recipes : [];
  const has_prev = queried ? queried.has_prev : false;
  const has_next = queried ? queried.has_next : false;
  const main_contents =
    recipes.length > 0 ? (
      recipes.map((recipe) => (
        <Heading
          registerBookmark={() => registerBookmark(recipe.id)}
          unregisterBookmark={() => unregisterBookmark(recipe.id)}
          registered={bookmarkMask[recipe.id] ? bookmarkMask[recipe.id] : false}
          id={recipe.id}
          key={recipe.id}
          title={recipe.title}
          description={recipe.description}
          image_url={recipe.image_url ? recipe.image_url : null}
        />
      ))
    ) : (
      <span className="text-2xl">レシピが見つかりませんでした</span>
    );
  const [drawerOpen, setDrawerOpen] = useState(false);
  useEffect(() => {
    const mask: { [key: string]: boolean } = {};
    recipes.forEach((recipe) => {
      mask[recipe.id] = Bookmark.include(recipe.id);
    });
    setBookmarkMask(mask);
  }, []);
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
    <div>
      <Head>
        <title>クッキングパッド</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Drawer drawerElements={drawerContents} width="300px" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <header className="bg-gray-300 flex flex-row items-center">
          <button className="h-10 w-10" onClick={() => setDrawerOpen(!drawerOpen)}>
            <MdMenu className="text-2xl mx-auto" />
          </button>
          <h1 className="text-xl ml-4 my-2 font-bold">クッキングパッド</h1>
        </header>
        <div className="my-4 mx-2">
          <Search keyword={search} onSubmit={(searchWord) => handleSearch(searchWord)} />
        </div>
        <main>{main_contents}</main>
        <footer className="p-8 flex flex-row justify-between">
          {has_prev ? (
            <span>
              <Link href={`/${genQuery(page - 1, search)}`}>前のページ</Link>
            </span>
          ) : (
            <span />
          )}
          {has_next ? (
            <span>
              <Link href={`/${genQuery(page + 1, search)}`}>次のページ</Link>
            </span>
          ) : (
            <span />
          )}
        </footer>
      </Drawer>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const pageRaw = Number(context.query.page);
  const page = Number.isNaN(pageRaw) ? 1 : Math.max(pageRaw, 1);
  const search = context.query.search === undefined ? '' : context.query.search;
  const queried = await client.query<RecipesPageQuery>({ query, variables: { page, keyword: search } });
  if (queried.errors) {
    return {
      props: {
        page,
        search,
        queried: null,
      },
    };
  } 
    return {
      props: {
        page,
        search,
        queried: queried.data.recipes,
      },
    };
  
};
