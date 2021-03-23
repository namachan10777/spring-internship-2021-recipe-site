import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/dist/client/router';
import { Recipe } from '../lib/recipe';
import * as Bookmark from '../lib/bookmark';
import 'tailwindcss/tailwind.css';
import Heading from '../components/heading';
import Search from '../components/search';

type HomeProps = {
  recipes: Recipe[];
  page: number;
  search: string;
  nextExists: boolean;
  prevExists: boolean;
};

export default function Home(props: HomeProps) {
  const router = useRouter();
  const { search, page, recipes, nextExists, prevExists } = props;
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
  const [bookmarkMask, setBookmarkMask] = useState<{ [key: number]: boolean }>({});
  const unregisterBookmark = (id: number) => {
    Bookmark.unregister(id);
    setBookmarkMask({ ...bookmarkMask, [id]: false });
  };
  const registerBookmark = (id: number) => {
    Bookmark.register(id);
    setBookmarkMask({ ...bookmarkMask, [id]: true });
  };
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
          image_url={recipe.image_url}
        />
      ))
    ) : (
      <span className="text-2xl">レシピが見つかりませんでした</span>
    );
  useEffect(() => {
    let mask: { [key: number]: boolean } = {};
    recipes.forEach((recipe) => {
      mask[recipe.id] = Bookmark.include(recipe.id);
    });
    setBookmarkMask(mask);
  }, []);
  return (
    <div>
      <Head>
        <title>クッキングパッド</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header className="bg-gray-300 p-2 flex flex-row items-center justify-between">
        <h1 className="text-xl font-bold">クッキングパッド</h1>
        <span className="mr-2">
          <Link href="/myfolder">マイフォルダ</Link>
        </span>
      </header>

      <div className="my-4 mx-2">
        <Search keyword={search} onSubmit={(searchWord) => handleSearch(searchWord)} />
      </div>
      <main>{main_contents}</main>
      <footer className="p-8 flex flex-row justify-between">
        {prevExists ? (
          <span>
            <Link href={`/${genQuery(page - 1, search)}`}>前のページ</Link>
          </span>
        ) : (
          <span />
        )}
        {nextExists ? (
          <span>
            <Link href={`/${genQuery(page + 1, search)}`}>次のページ</Link>
          </span>
        ) : (
          <span />
        )}
      </footer>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const pageRaw = Number(context.query.page);
  const page = Number.isNaN(pageRaw) ? 1 : Math.max(pageRaw, 1);
  const search = context.query.search === undefined ? '' : context.query.search;
  const endPointAndQuery =
    search === '' || typeof search !== 'string'
      ? `recipes?page=${page}`
      : `search?page=${page}&keyword=${encodeURI(search)}`;
  const api_res = await fetch(`https://internship-recipe-api.ckpd.co/${endPointAndQuery}`, {
    method: 'GET',
    headers: new Headers({
      'X-Api-Key': process.env.COOKPAD_API_KEY as string,
    }),
  });
  if (api_res.status == 200) {
    const res = await api_res.json();
    return {
      props: {
        page,
        search,
        recipes: res.recipes,
        nextExists: res.links.next !== undefined,
        prevExists: res.links.prev !== undefined,
      },
    };
  }
  return {
    props: {
      page,
      search,
      recipes: [],
      nextExists: false,
      prevExists: false,
    },
  };
};
