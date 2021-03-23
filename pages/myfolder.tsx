import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import 'tailwindcss/tailwind.css';
import Heading from '../components/heading';
import { Recipe } from '../lib/recipe';
import * as Bookmark from '../lib/bookmark';

type MyFolderProps = {
  page: number;
};

export default function MyFolder(props: MyFolderProps) {
  const genQuery = (page: number) => (page === 1 ? '' : `?page=${page}`);
  const { page } = props;
  const [recipes, setRecipes] = useState<Recipe[] | null>(null);
  const [prevExists, setPrevExists] = useState(false);
  const [nextExists, setNextExists] = useState(false);
  const [bookmarkMask, setBookmarkMask] = useState<{ [key: number]: boolean }>({});
  const handleUnregister = (id: number) => {
    Bookmark.unregister(id);
    setBookmarkMask({ ...bookmarkMask, [id]: false });
    console.log(bookmarkMask);
  };
  const handleUndo = (id: number) => {
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
            image_url={recipe.image_url}
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
        let mask: { [key: number]: boolean } = {};
        bookmarkIds.ids.forEach((id: number) => (mask[id] = true));
        setBookmarkMask(mask);
        const xhr = new XMLHttpRequest();
        xhr.addEventListener('load', () => {
          setRecipes(JSON.parse(xhr.response).recipes);
        });
        xhr.open('GET', `http://localhost:3000/api?id=${bookmarkIds.ids.join(',')}`);
        setPrevExists(bookmarkIds.prevExists);
        setNextExists(bookmarkIds.nextExists);
        xhr.send();
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
      <header>
        <h1 className="bg-gray-300 p-2 text-xl font-bold">クッキングパッド</h1>
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
