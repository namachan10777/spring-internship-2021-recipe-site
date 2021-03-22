import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import queryString from 'query-string';
import { getRecipes, Recipe } from '../lib/recipe';
import Heading from './heading';

export default function Home() {
  const router = useRouter();
  const query = queryString.parse(router.asPath.split(/\?/)[1]) as { search: string };
  const [searchWord, setSearchWord] = useState(query.search ? query.search : '');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  useEffect(() => {
    (async () => {
      const recipes = await getRecipes();
      console.log(recipes);
      setRecipes(recipes);
    })();
  }, []);
  return (
    <div>
      <Head>
        <title>クッキングパッド</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header>
        <h1>クッキングパッド</h1>
      </header>
      <main>
        <input type="text" value={searchWord} onChange={(e) => setSearchWord(e.target.value)} />
        <button>検索</button>
        {recipes.map((recipe) => <Heading title={recipe.title} description={recipe.description} image_url={recipe.image_url}/>)}
      </main>
      <footer></footer>
    </div>
  );
}
