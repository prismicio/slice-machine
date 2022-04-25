import { exitPreview } from '@prismicio/next'

export default async function exit(req, res) {
  await exitPreview({ res, req });
}