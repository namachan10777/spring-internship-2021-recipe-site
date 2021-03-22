import React, { useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { MdSearch } from 'react-icons/md';
import { Recipe } from '../lib/recipe';
import Heading from '../components/heading';

type HomeProps = {
  recipes: Recipe[];
  page: number;
  search: string;
  nextExists: boolean;
  prevExists: boolean;
};

export default function Home(props: HomeProps) {
  const { search, page, recipes, nextExists, prevExists } = props;
  const [searchWord, setSearchWord] = useState(search);
  const genPageQuery = (p: number) => (p === 0 ? '' : `page=${p}`);
  const genSearchQuery = (s: string) => (s === '' ? '' : `search=${s}`);
  const genQuery = (p: number, s: string): string => {
    const queryString = [genPageQuery(p), genSearchQuery(s)].filter((query) => query !== '').join('&');
    return queryString === '' ? '' : `?${queryString}`;
  };
  const main_contents =
    recipes.length > 0 ? (
      recipes.map((recipe) => (
        <Heading key={recipe.id} title={recipe.title} description={recipe.description} image_url={recipe.image_url} />
      ))
    ) : (
      <span className="text-xl">レシピが見つかりませんでした</span>
    );
  return (
    <div>
      <Head>
        <title>クッキングパッド</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header>
        <h1 className="text-3xl">クッキングパッド</h1>
      </header>
      <main>
        <form className="border border-black rounded-md p-1 flex w-full items-center">
          <div>
            <MdSearch className="text-xl" />
          </div>
          <div className="w-full">
            <input
              type="text"
              name="search"
              placeholder="検索"
              value={searchWord}
              onChange={(e) => setSearchWord(e.target.value)}
              className="text-xl ml-1 flex-shrink w-full"
            />
          </div>
        </form>
        {main_contents}
      </main>
      <footer>
        {prevExists ? <Link href={`/${genQuery(page - 1, search)}`}>前のページ</Link> : null}
        {nextExists ? <Link href={`/${genQuery(page + 1, search)}`}>次のページ</Link> : null}
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
  } else {
    return {
      props: {
        page,
        search,
        recipes: [],
        nextExists: false,
        prevExists: false,
      },
    };
  }
};
