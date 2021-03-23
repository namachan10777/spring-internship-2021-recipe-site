import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/dist/client/router';
import * as Bookmark from '../lib/bookmark';
import 'tailwindcss/tailwind.css';
import Heading from '../components/heading';
import Search from '../components/search';
import gql from 'graphql-tag';
import { readFileSync } from 'fs';
import { RecipesPage, RecipesPageQuery } from '../lib/generated/graphql';
import { client } from '../lib/graphql_client';

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
  useEffect(() => {
    let mask: { [key: string]: boolean } = {};
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
    </div>
  );
}

const ops = readFileSync('graphql/ops/recipe_page.graphql', 'utf8');
const query = gql(ops);

export const getServerSideProps: GetServerSideProps = async (context) => {
  const pageRaw = Number(context.query.page);
  const page = Number.isNaN(pageRaw) ? 1 : Math.max(pageRaw, 1);
  const search = context.query.search === undefined ? '' : context.query.search;
  const queried = await client.query<RecipesPageQuery>({ query, variables: { page } });
  if (queried.errors) {
    return {
      props: {
        page,
        search,
        queried: null,
      },
    };
  } else {
    return {
      props: {
        page,
        search,
        queried: queried.data.recipes,
      },
    };
  }
};
