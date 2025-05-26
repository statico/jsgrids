# jsgrids

A List of JavaScript Spreadsheet and Data Grid Libraries - https://jsgrids.statico.io/

[![GitHub repo](https://img.shields.io/badge/github-repo-green)](https://github.com/statico/jsgrids) [![GitHub contributors](https://img.shields.io/github/contributors/statico/jsgrids)](https://github.com/statico/jsgrids/graphs/contributors) [![GitHub last commit](https://img.shields.io/github/last-commit/statico/jsgrids)](https://github.com/statico/jsgrids/commits/main) [![GitHub branch status](https://img.shields.io/github/checks-status/statico/jsgrids/main)](https://github.com/statico/jsgrids)

[<img src="https://github.com/user-attachments/assets/16e159b1-fa27-4237-89c7-600f3aeaa250" width="600" alt="screenshot of the jsgrids web interface" />](https://jsgrids.statico.io)

## Motivation

I build a lot of internal tools for data auditing and workflows, and every few months I end up looking for the best data grid or spreadsheet-like library for JavaScript. Other lists and sites are out of date and unmaintained. My goal here is to make the best list for all data grid and spreadsheet libraries for the top JavaScript frontend frameworks ([1](https://2019.stateofjs.com/front-end-frameworks/), [2](https://2019.stateofjs.com/other-tools/)). You're welcome to help!

## Contributing

Pull requests are welcome to help keep this project up to date. Please make sure the Vercel build passes successfully, and please make sure all source is formatted with [Prettier](https://prettier.io/) (there's a git hook that should do it for you anyway).

## Development

1. Create a [GitHub Personal Access Token](https://github.com/settings/tokens). You don't need to give it any scopes -- it's just to increase the API rate limit.
1. Make sure you have [Node.js](https://nodejs.org/) version 12.0 or later and the [pnpm package manager](https://pnpm.io/) installed.
1. Checkout the repo, run `pnpm install`
1. Run `GITHUB_TOKEN=<your token here> pnpm dev`
1. Go to http://localhost:3000/ and bask in the wild splendor that is jsgrids

Information on each library is in `data/` and is parsed in `lib/libraries.ts`. Enjoy!

## Miscellanous

- jsgrids is hosted on [Vercel](https://vercel.com/)
- This project makes extensive use of [Tailwind CSS](https://tailwindcss.com/), [Next.js](https://nextjs.org/) (with App Router), and [TypeScript](https://www.typescriptlang.org/)
- Icons are from the various icon sets in [react-icons](https://react-icons.github.io/react-icons/)
- The GitHub corner thing is Tim Holman's fancy [GitHub Corners](http://tholman.com/github-corners/) thing
- All library descriptions are adapted from each package's home page

## License

This project is licensed under the [MIT license](https://github.com/statico/jsgrids/blob/master/LICENSE).
