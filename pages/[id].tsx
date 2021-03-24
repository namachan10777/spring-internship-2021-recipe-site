import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/dist/client/router';
import Link from 'next/link';
import Search from '../components/search';
import { Recipe, RecipeQuery, FullRecipesByIdsQuery } from '../lib/generated/graphql';
import * as Bookmark from '../lib/bookmark';
import { client } from '../lib/graphql_client';
import query from '../graphql/ops/recipe';
import queryByIds from '../graphql/ops/full_recipes_by_id';
import 'tailwindcss/tailwind.css';
import RecipeView from '../components/recipe_view';
import Swipeable from '../components/swipable';

type RecipePageProps = {
  main?: Recipe;
  related_recipes: Recipe[];
};

export default function RecipePageProps(props: RecipePageProps) {
  const router = useRouter();
  const handleSearch = (searchWord: string) => {
    if (searchWord == '') {
      router.push('/');
    } else {
      router.push(`/?search=${searchWord}`);
    }
  };
  const [bookmarked, setBookmared] = useState(false);
  useEffect(() => {
    if (props.main) setBookmared(Bookmark.include(props.main.id));
  }, []);
  const handleUnregister = () => {
    if (props.main) {
      Bookmark.unregister(props.main.id);
      setBookmared(false);
    }
  };
  const handleRegister = () => {
    if (props.main) {
      Bookmark.register(props.main.id);
      setBookmared(true);
    }
  };
  return (
    <div>
      <Head>
        <title>{props.main?.title}</title>
        <link rel="icon" href="/favicon.ico" />
        <meta property="og:title" content={props.main?.title} />
        <meta property="og:description" content={props.main?.description} />
        <meta property="og:type" content="article" />
        <meta property="og:article:author" content={props.main?.author.user_name} />
        <meta property="og:article:published_time" content={props.main?.published_at} />
        <meta property="og:article:modified_time" content={props.main?.published_at} />
        <meta property="og:article:section" content="Cooking" />
        <meta property="og:image" content={props.main?.image_url ? props.main?.image_url : ''} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image:src" content={props.main?.image_url ? props.main?.image_url : ''} />
        <meta name="twitter:description" content={props.main?.description} />{' '}
        <meta name="twitter:title" content={props.main?.title} />
        <meta name="twitter:site" content="@namachan10777" />
      </Head>
      <header className="bg-gray-300 p-2  flex flex-row items-center justify-between">
        <h2 className="text-xl font-bold">
          <Link href="/">クッキングパッド</Link>
        </h2>
        <span className="mr-2">
          <Link href="/myfolder">マイフォルダ</Link>
        </span>
      </header>
      <div className="my-4 mx-2">
        <Search keyword="" onSubmit={(searchWord) => handleSearch(searchWord)} />
      </div>
      <Swipeable>
        {props.main ? (
          <RecipeView
            bookmarked={bookmarked}
            bookmark={(_) => handleRegister()}
            unbookmark={(_) => handleUnregister()}
            recipe={props.main}
          />
        ) : null}
        {props.related_recipes.map((recipe) => (
          <RecipeView bookmarked={false} recipe={recipe} bookmark={() => {}} unbookmark={() => {}} key={recipe.id} />
        ))}
      </Swipeable>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const id = Number(context.params?.id);
  if (id) {
    const queried = await client.query<RecipeQuery>({ query, variables: { id } });
    if (queried.errors) {
      return {
        notFound: true,
      };
    }
    if (queried.data.recipe) {
      const related = await client.query<FullRecipesByIdsQuery>({
        query: queryByIds,
        variables: { ids: queried.data.recipe.related_recipes },
      });
      const related_recipes: Recipe[] = related.data.recipesByIds ? related.data.recipesByIds : [];
      return {
        props: {
          main: queried.data.recipe,
          related_recipes,
        },
      };
    }
  }
  return {
    notFound: true,
  };
};
