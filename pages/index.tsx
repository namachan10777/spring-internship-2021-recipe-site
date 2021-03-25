import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import * as Bookmark from '../lib/bookmark';
import 'tailwindcss/tailwind.css';
import Heading from '../components/heading';
import { RecipesPage, RecipesPageQuery } from '../lib/generated/graphql';
import { client } from '../lib/graphql_client';
import query from '../graphql/ops/recipes_page';
import DrawerContainer from '../components/drawerContainer';

type HomeProps = {
  page: number;
  search: string;
  queried: RecipesPage | null;
};

export default function Home(props: HomeProps) {
  const { search, page, queried } = props;
  const genPageQuery = (p: number) => (p === 0 ? '' : `page=${p}`);
  const genSearchQuery = (s: string) => (s === '' ? '' : `search=${s}`);
  const genQuery = (p: number, s: string): string => {
    const queryString = [genPageQuery(p), genSearchQuery(s)].filter((query) => query !== '').join('&');
    return queryString === '' ? '' : `?${queryString}`;
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
    const mask: { [key: string]: boolean } = {};
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
      <DrawerContainer search={search}>
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
      </DrawerContainer>
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
