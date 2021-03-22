import React from 'react';
import Head from 'next/head';
import { Recipe } from '../lib/recipe';
import { GetServerSideProps } from 'next';
import Search from '../components/search';
import { useRouter } from 'next/dist/client/router';
import Link from 'next/link';

type RecipePageProps = {
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
  return (
    <div>
      <Head>
        <title>{props.title}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header>
        <h2 className="text-3xl">
          <Link href="/">クッキングパッド</Link>
        </h2>
      </header>
      <Search keyword="" onSubmit={(searchWord) => handleSearch(searchWord)} />
      {props.image_url ? <img className="w-full" src={props.image_url} alt={props.title} /> : null}
      <h1 className="text-4xl">{props.title}</h1>
      <div className="flex flex-row justify-between">
        <span className="block">{props.author.user_name}</span>
        <span className="block">{props.published_at}</span>
      </div>
      <section>
        <header className="bg-gray-300 text-xl">材料</header>
        <ul className="list-inside list-disc">
          {props.ingredients.map((ingredient, i) => (
            <li key={i}>
              <span>{ingredient.name}</span>
              <span>{ingredient.quantity}</span>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <header className="bg-gray-300 text-xl">手順</header>
        <ol className="list-inside list-decimal">
          {props.steps.map((step, i) => (
            <li key={i}>
              {step}
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
          title: res.title,
          description: res.description,
          image_url: res.image_url,
          author: res.author,
          published_at: res.published_at,
          steps: res.steps,
          ingredients: res.ingredients,
        },
      };
    } else {
      return {
        notFound: true,
      };
    }
  } else {
    return {
      notFound: true,
    };
  }
};
