# Rocket Show Designer
This project allows editing lighting shows for Rocket Show as a web application in the browser.

## Fixture profile library
The Rocket Show Designer relies on the Open Fixture Library (OFL). There is a plugin, which maps the OFL profiles to the Rocket Show format. The format relies as close as possible on the OFL-format.

## Build & publish
```
cd projects/designer
npm version minor
cd ../..
npm run publish
```