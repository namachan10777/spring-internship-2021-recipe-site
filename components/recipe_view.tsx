import React from 'react';
import Image from 'next/image';
import { Recipe } from '../lib/generated/graphql';
import { IoMdHeart, IoMdHeartEmpty } from 'react-icons/io';

export type RecipeViewProps = {
  recipe: Recipe;
  bookmark: (id: string) => void;
  bookmarked: boolean;
  unbookmark: (id: string) => void;
};

const RecipeView = (props: RecipeViewProps) => {
  return (
    <div>
      {props.recipe.image_url ? (
        <div className="w-full">
          <Image src={props.recipe.image_url} width={1280} height={720} alt={props.recipe.title} layout="responsive" />
        </div>
      ) : null}
      <h1 className="text-2xl font-bold p-2">
        {props.bookmarked ? (
          <button onClick={() => props.unbookmark(props.recipe.id)}>
            <IoMdHeart className="text-red-700" />
          </button>
        ) : (
          <button onClick={() => props.bookmark(props.recipe.id)}>
            <IoMdHeartEmpty />
          </button>
        )}
        <span className="ml-2">{props.recipe.title}</span>
      </h1>

      <div className="flex flex-row justify-between m-2">
        <span className="block">{props.recipe.author.user_name}</span>
        <span className="block">{props.recipe.published_at}</span>
      </div>
      <p className="p-4">{props.recipe.description}</p>
      <section>
        <header className="px-4 bg-gray-300 text-lg font-bold">材料</header>
        <ul role="list">
          {props.recipe.ingredients.map((ingredient, i) => (
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
          {props.recipe.steps.map((step, i) => (
            <li key={i} className="border-b-2 p-2 font-bold">
              <span className="ml-1 font-normal">{step}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
};

export default RecipeView;
