import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { MdSearch } from 'react-icons/md';
import { getRecipes, Recipe } from '../lib/recipe';
import Heading from '../components/heading';

const COLUMN_MAX = 4;

export default function Home() {
  const router = useRouter();
  const [searchWordOfPage, setSearchWordOfPage] = useState('');
  const [searchWord, setSearchWord] = useState('');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [page, setPage] = useState(0);
  const [totalPageN, setTotalPageN] = useState(0);
  useEffect(() => {
    (async () => {
      const fetchedRecipes = await getRecipes();
      const pageStr = router.query.page;
      const pageOrNaN = pageStr && typeof pageStr === 'string' ? parseInt(pageStr, 10) : 0;
      const parsedPage = Number.isNaN(pageOrNaN) ? 0 : pageOrNaN;
      const parsedSearchWordOfPage =
        router.query.search && typeof router.query.search === 'string' ? router.query.search : '';
      setSearchWordOfPage(parsedSearchWordOfPage);
      setSearchWord(parsedSearchWordOfPage);
      setPage(parsedPage);
      setTotalPageN(Math.ceil(fetchedRecipes.length / COLUMN_MAX));
      setRecipes(fetchedRecipes.slice(parsedPage * COLUMN_MAX, (parsedPage + 1) * COLUMN_MAX));
    })();
  }, [router]);
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
        {page > 0 ? <Link href={`/${genQuery(page - 1, searchWordOfPage)}`}>前のページ</Link> : null}
        {page + 1 < totalPageN ? <Link href={`/${genQuery(page + 1, searchWordOfPage)}`}>次のページ</Link> : null}
      </footer>
    </div>
  );
}
