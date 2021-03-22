import React, { useState } from 'react';
import { MdSearch } from 'react-icons/md';

export type SearhProps = {
  onSubmit: (keyword: string) => void;
  keyword: string;
};

const Search: React.FC<SearhProps> = (props: SearhProps) => {
  const [searchWord, setSearchWord] = useState(props.keyword);
  return (
    <form
      className="border border-black rounded-md p-1 flex w-full items-center"
      onSubmit={(e) => {
        e.preventDefault();
        props.onSubmit(searchWord);
      }}
    >
      <div>
        <MdSearch className="text-xl" />
      </div>
      <div className="w-full">
        <input
          type="text"
          name="search"
          placeholder="検索"
          value={searchWord}
          onChange={(e) => setSearchWord(e.target.value)}
          className="text-xl ml-1 flex-shrink w-full"
        />
      </div>
    </form>
  );
};

export default Search;
