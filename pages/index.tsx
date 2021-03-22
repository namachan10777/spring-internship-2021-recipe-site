import React, { useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { MdSearch } from 'react-icons/md';
import { getRecipes, Recipe } from '../lib/recipe';
import Heading from '../components/heading';

const COLUMN_MAX = 4;

type HomeProps = {
  recipes: Recipe[];
  page: number;
  totalPage: number;
  search: string;
};

export default function Home(props: HomeProps) {
  const { search, page, recipes, totalPage } = props;
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
        {page > 0 ? <Link href={`/${genQuery(page - 1, search)}`}>前のページ</Link> : null}
        {page + 1 < totalPage ? <Link href={`/${genQuery(page + 1, search)}`}>次のページ</Link> : null}
      </footer>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const recipes = await getRecipes();
  const totalPage = Math.ceil(recipes.length / COLUMN_MAX);
  const pageRaw = Math.min(Math.max(Number(context.query.page), 0), totalPage - 1);
  const page = Number.isNaN(pageRaw) ? 0 : pageRaw;
  const search = context.query.search === undefined ? '' : context.params?.search;
  return {
    props: {
      recipes: recipes.slice(page * COLUMN_MAX, Math.min(recipes.length, (page + 1) * COLUMN_MAX)),
      page,
      search,
      totalPage,
    },
  };
};
