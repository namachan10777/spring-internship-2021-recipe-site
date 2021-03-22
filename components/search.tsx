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
      className="border border-gray-600 p-0.5 rounded-md flex w-full items-center"
      onSubmit={(e) => {
        e.preventDefault();
        props.onSubmit(searchWord);
      }}
    >
      <button onClick={() => props.onSubmit(searchWord)}>
        <MdSearch className="flex-shrink-0" />
      </button>
      <input
        type="text"
        name="search"
        placeholder="検索"
        value={searchWord}
        onChange={(e) => setSearchWord(e.target.value)}
        className="ml-1 flex-shrink w-full"
      />
    </form>
  );
};

export default Search;
