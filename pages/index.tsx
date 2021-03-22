import React, { useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { MdSearch } from 'react-icons/md';
import { Recipe } from '../lib/recipe';
import Heading from '../components/heading';

type PageInfo = {
  recipes: Recipe[];
  page: number;
  search: string;
  nextExists: boolean;
  prevExists: boolean;
};

type HomeProps = {
  pageInfo: PageInfo;
};

export default function Home(props: HomeProps) {
  const { pageInfo } = props;
  const { search, page, recipes, nextExists, prevExists } = pageInfo;
  const [searchWord, setSearchWord] = useState(search);
  const genPageQuery = (p: number) => (p === 0 ? '' : `page=${p}`);
  const genSearchQuery = (s: string) => (s === '' ? '' : `search=${s}`);
  const genQuery = (p: number, s: string): string => {
    const queryString = [genPageQuery(p), genSearchQuery(s)].filter((query) => query !== '').join('&');
    return queryString === '' ? '' : `?${queryString}`;
  };
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
        <div className="border border-black rounded-md p-1 flex w-full items-center">
          <div>
            <MdSearch className="text-xl" />
          </div>
          <div className="w-full">
            <input
              type="text"
              placeholder="検索"
              value={searchWord}
              onChange={(e) => setSearchWord(e.target.value)}
              className="text-xl ml-1 flex-shrink w-full"
            />
          </div>
        </div>
        {recipes.map((recipe) => (
          <Heading key={recipe.id} title={recipe.title} description={recipe.description} image_url={recipe.image_url} />
        ))}
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
  const search = context.query.search === undefined ? '' : context.params?.search;
  const api_res = await fetch(`https://internship-recipe-api.ckpd.co/recipes?page=${page}`, {
    method: 'GET',
    headers: new Headers({
      'X-Api-Key': process.env.COOKPAD_API_KEY as string,
    }),
  });
  const res = await api_res.json();
  console.log(res);
  return {
    props: {
      pageInfo: {
        page,
        search,
        recipes: res.recipes,
        nextExists: res.links.next !== undefined,
        prevExists: res.links.prev !== undefined,
      },
    },
  };
};
