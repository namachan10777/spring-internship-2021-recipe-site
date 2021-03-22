import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import queryString from 'query-string';
import { getRecipes, Recipe } from '../lib/recipe';
import Heading from '../components/heading';

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
        <div className="border border-black rounded-md p-1 inline-flex w-full items-end">
          <span className="flex-shrink-0">虫眼鏡</span>
          <input type="text" placeholder="検索" value={searchWord} onChange={(e) => setSearchWord(e.target.value)} className="mt-1 flex-shrink w-full"/>
        </div>
        {recipes.map((recipe) => (
          <Heading
            key={recipe.id}
            title={recipe.title}
            description={recipe.description}
            image_url={recipe.image_url} />
        ))}
      </main>
      <footer></footer>
    </div>
  );
}
