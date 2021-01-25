# Rocket Show Designer

This project allows editing lighting shows for Rocket Show as a web application in the browser.

## Fixture profile library

The Rocket Show Designer relies on the Open Fixture Library (OFL). There is currently no plugin, which maps the OFL profiles to the Rocket Show format. Currently, we rely on the OFL JSON-format.

## Development

- The git-flow-workflow is used: https://www.atlassian.com/de/git/tutorials/comparing-workflows/gitflow-workflow
- Start the designer with `npm install` and `ng serve`
- Access the app in your browser with `localhost:4200`
- Some functionality requires a server (e.g. loading/saving projects, handling audio files). You can start a rocket show server (see https://github.com/moritzvieli/rocketshow) and point environment.ts's localBackend to `http://localhost:8080`
- Prettier and precommit hook according to: https://medium.com/@victormejia/setting-up-prettier-in-an-angular-cli-project-2f50c3b9a537
- Test precommit 3

## Build & publish as NPM package

```
cd projects/designer
npm version minor
cd ../..
npm run publish
```

## Build for production

```
ng build --prod --base-href /designer/app/
```
