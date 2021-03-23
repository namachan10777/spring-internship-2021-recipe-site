import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/dist/client/router';
import Link from 'next/link';
import { IoMdHeart, IoMdHeartEmpty } from 'react-icons/io';
import Search from '../components/search';
import { Recipe } from '../lib/recipe';
import * as Bookmark from '../lib/bookmark';
import 'tailwindcss/tailwind.css';

type RecipePageProps = {
  id: number;
  title: string;
  description: string;
  image_url: string | null;
  author: {
    user_name: string;
  };
  published_at: string;
  steps: string[];
  ingredients: {
    name: string;
    quantity: string;
  }[];
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
      {props.image_url ? <img className="w-full" src={props.image_url} alt={props.title} /> : null}
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
        <span className="block">{props.author.user_name}</span>
        <span className="block">{props.published_at}</span>
      </div>
      <p className="p-4">{props.description}</p>
      <section>
        <header className="px-4 bg-gray-300 text-lg font-bold">材料</header>
        <ul role="list">
          {props.ingredients.map((ingredient, i) => (
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
          {props.steps.map((step, i) => (
            <li key={i} className="border-b-2 p-2 font-bold">
              <span className="ml-1 font-normal">{step}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const id = Number(context.params?.id);
  if (id) {
    const api_res = await fetch(`https://internship-recipe-api.ckpd.co/recipes/${id}`, {
      method: 'GET',
      headers: new Headers({
        'X-Api-Key': process.env.COOKPAD_API_KEY as string,
      }),
    });
    const res: Recipe = await api_res.json();
    if (api_res.status == 200) {
      return {
        props: {
          id,
          title: res.title,
          description: res.description,
          image_url: res.image_url,
          author: res.author,
          published_at: res.published_at,
          steps: res.steps,
          ingredients: res.ingredients,
        },
      };
    }
    return {
      notFound: true,
    };
  }
  return {
    notFound: true,
  };
};
