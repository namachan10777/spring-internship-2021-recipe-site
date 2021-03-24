import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { GetStaticProps } from 'next';
import { useRouter } from 'next/dist/client/router';
import Link from 'next/link';
import { IoMdHeart, IoMdHeartEmpty } from 'react-icons/io';
import Search from '../components/search';
import { Recipe, RecipeQuery } from '../lib/generated/graphql';
import * as Bookmark from '../lib/bookmark';
import { client } from '../lib/graphql_client';
import query from '../graphql/ops/recipe';
import 'tailwindcss/tailwind.css';

type RecipePageProps = Recipe;

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
    setBookmared(Bookmark.include(props.id));
  }, []);
  const handleUnregister = () => {
    Bookmark.unregister(props.id);
    setBookmared(false);
  };
  const handleRegister = () => {
    Bookmark.register(props.id);
    setBookmared(true);
  };
  return (
    <div>
      <Head>
        <title>{props.title}</title>
        <link rel="icon" href="/favicon.ico" />
        <meta property="og:title" content={props.title} />
        <meta property="og:description" content={props.description} />
        <meta property="og:type" content="article" />
        <meta property="og:article:author" content={props.author?.user_name} />
        <meta property="og:article:published_time" content={props.published_at} />
        <meta property="og:article:modified_time" content={props.published_at} />
        <meta property="og:article:section" content="Cooking" />
        <meta property="og:image" content={props.image_url ? props.image_url : ''} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image:src" content={props.image_url ? props.image_url : ''} />
        <meta name="twitter:description" content={props.description} />
        <meta name="twitter:title" content={props.title} />
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
      {props.image_url ? (
        <div className="w-full">
          <Image src={props.image_url} width={1280} height={720} alt={props.title} layout="responsive" />
        </div>
      ) : null}
      <h1 className="text-2xl font-bold p-2">
        {bookmarked ? (
          <button onClick={() => handleUnregister()}>
            <IoMdHeart className="text-red-700" />
          </button>
        ) : (
          <button onClick={() => handleRegister()}>
            <IoMdHeartEmpty />
          </button>
        )}
        <span className="ml-2">{props.title}</span>
      </h1>

      <div className="flex flex-row justify-between m-2">
        <span className="block">{props.author?.user_name}</span>
        <span className="block">{props.published_at}</span>
      </div>
      <p className="p-4">{props.description}</p>
      <section>
        <header className="px-4 bg-gray-300 text-lg font-bold">材料</header>
        <ul role="list">
          {props.ingredients?.map((ingredient, i) => (
            <li key={i} className="border-b-2 flex justify-between p-2">
              <div>{ingredient.name}</div>
              <div>{ingredient.quantity}</div>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <header className="px-4 bg-gray-300 text-lg font-bold">手順</header>
        <ol className="list-inside list-decimal">
          {props.steps?.map((step, i) => (
            <li key={i} className="border-b-2 p-2 font-bold">
              <span className="ml-1 font-normal">{step}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

export const getStaticPaths = async () => ({
  paths: [],
  fallback: true,
});

export const getStaticProps: GetStaticProps = async (context) => {
  const id = Number(context.params?.id);
  if (id) {
    const queried = await client.query<RecipeQuery>({ query, variables: { id } });
    if (queried.errors) {
      return {
        notFound: true,
      };
    }
    if (queried.data.recipe) {
      return {
        props: queried.data.recipe,
        revalidate: 180,
      }
    }
  }
  return {
    notFound: true,
  };
};
