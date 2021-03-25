type pagenatedBookmarks = {
  ids: string[];
  nextExists: boolean;
  prevExists: boolean;
}

const COLUMN_MAX = 10;

export function bookmarks(page: number):pagenatedBookmarks | null {
  const rawString = localStorage.getItem('bookmark');
  if (rawString) {
    const bookmarks: string[] = JSON.parse(rawString);
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
  
    return {
      ids: [],
      nextExists: false,
      prevExists: false,
    }
  
}

export function include(id: string):boolean {
  const rawString = localStorage.getItem('bookmark');
  if (rawString) {
    const bookmarks: string[] = JSON.parse(rawString);
    return bookmarks.includes(id);
  }
  
    return false;
  
}

export function register(id: string) {
  const rawString = localStorage.getItem('bookmark');
  if (rawString) {
    const bookmarks: string[] = JSON.parse(rawString);
    bookmarks.push(id);
    localStorage.setItem('bookmark', JSON.stringify(bookmarks));
  }
  else {
    localStorage.setItem('bookmark', JSON.stringify([id]));
  }
}

export function unregister(id: string) {
  const rawString = localStorage.getItem('bookmark');
  if (rawString) {
    const bookmarks: string[] = JSON.parse(rawString);
    localStorage.setItem('bookmark', JSON.stringify(bookmarks.filter(storedId => storedId != id)));
  }
}
