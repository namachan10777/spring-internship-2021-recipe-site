import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { getRecipes, Recipe } from '../lib/recipe';
import Heading from '../components/heading';
import { MdSearch } from 'react-icons/md';

const COLUMN_MAX = 4;

export default function Home() {
  const router = useRouter();
  const [searchWordOfPage, setSearchWordOfPage] = useState('');
  const [searchWord, setSearchWord] = useState('');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [page, setPage] = useState(0);
  useEffect(() => {
    (async () => {
      const recipes = await getRecipes();
      const pageStr = router.query.page;
      const pageOrNaN = pageStr && typeof pageStr == 'string' ? parseInt(pageStr, 10) : 0;
      const page = pageOrNaN ? pageOrNaN : 0;
      const searchWordOfPage = router.query.search && typeof router.query.search == 'string' ? router.query.search : '';
      setSearchWordOfPage(searchWordOfPage);
      setSearchWord(searchWordOfPage);
      setPage(page);
      setRecipes(recipes.slice(page * COLUMN_MAX, (page + 1) * COLUMN_MAX));
    })();
  }, [router]);
  const genPageQuery = (page: number) => page == 0 ? '' : `page=${page}`;
  const genSearchQuery = (search: string) => search == '' ? '' : `search=${search}`;
  const genQuery = (page: number, searh: string) => {
    return [genPageQuery(page), genSearchQuery(searh)].filter(query => query != '').join('&');
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
        <Link href={`/?${genQuery(page - 1, searchWordOfPage)}`}>前のページ</Link>
        <Link href={`/?${genQuery(page + 1, searchWordOfPage)}`}>次のページ</Link>
      </footer>
    </div>
  );
}
