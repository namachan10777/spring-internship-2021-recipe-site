export type Recipe = {
  // レシピID
  id: number;

  // レシピ名
  title: string;

  // レシピ概要
  description: string;

  // レシピ画像。画像がない場合は null。
  image_url: string | null;

  // レシピ作者
  author: {
    user_name: string;
  };

  // レシピを公開した日時。ISO 8601
  published_at: string;

  // レシピの手順
  steps: string[];

  // レシピの材料
  ingredients: {
    // 材料名
    name: string;
    // 分量（100g など）
    quantity: string;
  }[];

  // 関連するレシピのIDが最大5つ入っている。Poster View などを実装するのに使う。
  // なお、関連レシピの算出アルゴリズムのできが悪いため関連性が低い可能性がある点に注意。
  related_recipes: number[];
};
