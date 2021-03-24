import React, { useState } from 'react';
import { MdSearch } from 'react-icons/md';
import 'tailwindcss/tailwind.css';

export type SearhProps = {
  onSubmit: (keyword: string) => void;
  keyword: string;
};

const Search: React.FC<SearhProps> = (props: SearhProps) => {
  const [searchWord, setSearchWord] = useState(props.keyword);
  return (
    <form
      className="border border-gray-600 rounded-md flex w-full items-center shadow-sm focus-within:border-indigo-600 focus-within:ring focus-within:ring-indigo-600"
      onSubmit={(e) => {
        e.preventDefault();
        props.onSubmit(searchWord);
      }}
    >
      <button className="w-8 h-8" aria-label="search" onClick={() => props.onSubmit(searchWord)}>
        <MdSearch className="mx-auto flex-shrink-0" />
      </button>
      <input
        type="text"
        name="search"
        placeholder="検索"
        value={searchWord}
        onChange={(e) => setSearchWord(e.target.value)}
        className="ml-1 my-0.5 flex-shrink w-full focus:outline-none"
      />
    </form>
  );
};

export default Search;
