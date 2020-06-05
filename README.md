# jsgrids.io

[![Netlify Status](https://api.netlify.com/api/v1/badges/9fac2029-7e64-40b6-855b-f4df15d2f54d/deploy-status)](https://app.netlify.com/sites/jsgrids/deploys)

A List of JavaScript Spreadsheets and Data Grid Libraries - https://jsgrids.io/

## Motivation

I build a lot of internal tools for data auditing and workflows, and every few months I end up looking for the best data grid or spreadsheet-like library for JavaScript. Other lists and sites are out of date and unmaintained. My goal here is to make the best list for all data grid and spreadsheet libraries for the top JavaScript frontend frameworks ([1](https://2019.stateofjs.com/front-end-frameworks/), [2](https://2019.stateofjs.com/other-tools/)). You're welcome to help!

## Contributing

Pull requests are welcome to help keep this project up to date. Please make sure the Netlify build passes successfully, and please make sure all source is formatted with [Prettier](https://prettier.io/) (there's a git hook that should do it for you anyway).

## Development

1. Create a [GitHub Personal Access Token](https://github.com/settings/tokens). You don't need to give it any scopes -- it's just to increase the API rate limit.
1. Make sure you have [Node.js](https://nodejs.org/) version 12.0 or later and the [Yarn package manager](https://yarnpkg.com/) installed.
1. Checkout the repo, run `yarn install`
1. Run `GITHUB_TOKEN=<your token here> yarn dev`
1. Go to http://localhost:3000/ and bask in the wild splendor that is jsgrids

Information on each library is in `data/` and is parsed in `lib/libraries.ts`. Enjoy!

## Miscellanous

- jsgrids.io is hosted on [Netlify](https://jsgrids.io/)
- This project makes extensive use of [Tailwind CSS](https://tailwindcss.com/), [Next.js](https://nextjs.org/), and [TypeScript](https://www.typescriptlang.org/)
- Icons are from the various icon sets in [react-icons](https://react-icons.github.io/react-icons/)
- The GitHub corner thing is Tim Holman's fancy [GitHub Corners](http://tholman.com/github-corners/) thing
- All library descriptions are adapted from each package's home page

## License

This project is licensed under the [MIT license](https://github.com/statico/jsgrids/blob/master/LICENSE).
