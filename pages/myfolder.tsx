import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import 'tailwindcss/tailwind.css';
import Heading from '../components/heading';
import { RecipesByIdsQuery, RecipesByIdsQueryResult } from '../lib/generated/graphql';
import * as Bookmark from '../lib/bookmark';
import { client } from '../lib/graphql_client';
import gql from 'graphql-tag';

type MyFolderProps = {
  page: number;
};

const query = gql`
  query RecipesByIds($ids: [ID!]!) {
    recipesByIds(ids: $ids) {
      id
      title
      author {
        user_name
      }
      image_url
      description
    }
  }
`;

export default function MyFolder(props: MyFolderProps) {
  const genQuery = (page: number) => (page === 1 ? '' : `?page=${page}`);
  const { page } = props;
  const [recipes, setRecipes] = useState<RecipesByIdsQueryResult[] | null>(null);
  const [prevExists, setPrevExists] = useState(false);
  const [nextExists, setNextExists] = useState(false);
  const [bookmarkMask, setBookmarkMask] = useState<{ [key: string]: boolean }>({});
  const handleUnregister = (id: string) => {
    Bookmark.unregister(id);
    setBookmarkMask({ ...bookmarkMask, [id]: false });
    console.log(bookmarkMask);
  };
  const handleUndo = (id: string) => {
    Bookmark.register(id);
    setBookmarkMask({ ...bookmarkMask, [id]: true });
    console.log(bookmarkMask);
  };
  // TODO loading animation
  const main_contents = recipes ? (
    recipes.length > 0 ? (
      recipes.map((recipe) =>
        bookmarkMask[recipe.id] ? (
          <Heading
            id={recipe.id}
            key={recipe.id}
            title={recipe.title}
            registered={true}
            registerBookmark={() => handleUndo(recipe.id)}
            unregisterBookmark={() => handleUnregister(recipe.id)}
            description={recipe.description}
            image_url={recipe.image_url ? recipe.image_url : null}
          />
        ) : (
          <div key={recipe.id} className="text-xl">
            削除しました
            <button className="ml-2 text-indigo-800 font-bold" onClick={() => handleUndo(recipe.id)}>
              戻す
            </button>
          </div>
        )
      )
    ) : (
      <span className="text-2xl">レシピが見つかりませんでした</span>
    )
  ) : (
    <span className="text-2xl">ロード中</span>
  );
  useEffect(() => {
    (async () => {
      const bookmarkIds = Bookmark.bookmarks(props.page);
      if (bookmarkIds && bookmarkIds.ids.length > 0) {
        let mask: { [key: string]: boolean } = {};
        bookmarkIds.ids.forEach((id: string) => (mask[id] = true));
        setBookmarkMask(mask);
        const queried = await client.query<RecipesByIdsQuery>({
          query,
          variables: { ids: bookmarkIds.ids.map((bookmark) => bookmark.toString()) },
        });
        if (queried.data.recipesByIds) {
          setRecipes(queried.data.recipesByIds);
          setPrevExists(bookmarkIds.prevExists);
          setNextExists(bookmarkIds.nextExists);
        } else {
          // TODO
        }
      } else {
        setRecipes([]);
        setPrevExists(false);
        setNextExists(false);
        return;
      }
    })();
  }, []);
  // TODO: 検索
  return (
    <div>
      <Head>
        <title>クッキングパッド</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header className="bg-gray-300 p-2">
        <h1 className="text-xl font-bold">
          <Link href="/">クッキングパッド</Link>
        </h1>
      </header>
      <main>{main_contents}</main>
      <footer className="p-8 flex flex-row justify-between">
        {prevExists ? (
          <span>
            <Link href={`/${genQuery(page - 1)}`}>前のページ</Link>
          </span>
        ) : (
          <span />
        )}
        {nextExists ? (
          <span>
            <Link href={`/${genQuery(page + 1)}`}>次のページ</Link>
          </span>
        ) : (
          <span />
        )}
      </footer>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const pageRaw = Number(context.query.page);
  const page = Number.isNaN(pageRaw) ? 1 : Math.max(pageRaw, 1);
  return {
    props: {
      page,
    },
  };
};
