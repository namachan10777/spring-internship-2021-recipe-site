type pagenatedBookmarks = {
  ids: number[];
  nextExists: boolean;
  prevExists: boolean;
}

const COLUMN_MAX = 10;

export function bookmarks(page: number):pagenatedBookmarks | null {
  const rawString = localStorage.getItem('bookmark');
  if (rawString) {
    const bookmarks: number[] = JSON.parse(rawString);
    const pageCount = Math.ceil(bookmarks.length / COLUMN_MAX);
    if (page < 1 || page > pageCount) {
      return null;
    }
    return {
      ids: bookmarks.slice((page - 1) * COLUMN_MAX, Math.max(page * COLUMN_MAX, bookmarks.length)),
      nextExists: page < pageCount,
      prevExists: page > 1,
    };
  }
  else {
    return {
      ids: [],
      nextExists: false,
      prevExists: false,
    }
  }
}

export function include(id: number):boolean {
  const rawString = localStorage.getItem('bookmark');
  if (rawString) {
    const bookmarks: number[] = JSON.parse(rawString);
    return bookmarks.includes(id);
  }
  else {
    return false;
  }
}

export function register(id: number) {
  const rawString = localStorage.getItem('bookmark');
  if (rawString) {
    const bookmarks: number[] = JSON.parse(rawString);
    bookmarks.push(id);
    localStorage.setItem('bookmark', JSON.stringify(bookmarks));
  }
  else {
    localStorage.setItem('bookmark', JSON.stringify([id]));
  }
}

export function unregister(id: number) {
  const rawString = localStorage.getItem('bookmark');
  if (rawString) {
    const bookmarks: number[] = JSON.parse(rawString);
    localStorage.setItem('bookmark', JSON.stringify(bookmarks.filter(storedId => storedId != id)));
  }
}
