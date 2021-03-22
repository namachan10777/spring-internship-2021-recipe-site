// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { NextApiRequest, NextApiResponse } from 'next';

export default async (_: NextApiRequest, res: NextApiResponse) => {
  const api_res = await fetch('https://internship-recipe-api.ckpd.co/recipes', {
    method: 'GET',
    headers: new Headers({
      'X-Api-Key':  process.env.COOKPAD_API_KEY as string,
    })
  });
  const json = await api_res.json();
  return res.status(api_res.status).json(json);
}
