NOTE: The [react-dice-roll](https://www.npmjs.com/package/react-dice-roll) library is included in the project distribution as it cannot be automatically installed through package management due to version conflicts. It is not a creation of the project authors.

# MARRAKECH

This project is an implementation of the [Marrakech board game](https://boardgamegeek.com/boardgame/29223/marrakech) (also known as Suleika) for the Internet Applications course (2022/2023 Summer) at FIT BUT, Brno.

## Implementation Credits

Filip Dráber (xdrabe09@stud.fit.vutbr.cz): Game engine, React UI (collab.)
Mojmír Kyjonka (xkyjon00@stud.fit.vutbr.cz): API, React UI (collab.) 

## Installation and Usage

* `npm install`: Download and install all the necessary Node packages required to run the game and its client.

* `npm start`: Start the local development client, accessible at [http://localhost:3000](http://localhost:3000).

* `npm run build`: Build the application in a production version.

## Files and Directories

These are notable files that can be found in the project directory, including the most important scripts:

* `public/`: public, uncompiled files
* `src/api/`: scripts and schemata for communicating with backend
* `src/assets/carpets`: full carpets and carpet tiles
* `src/assets/tutorial`: images for the tutorial
* `src/assets/[arc|assam|dirham].png`: more image sources
* `src/components/`: React implementation of various screens, notably:
  - `src/components/Game.tsx`: the main implementation of the game UI
* `src/`: various vital scripts, notably:
  - `src/App.tsx`: main window to plug components into

  - `src/App.css`: composite Cascade Style Sheet for all components

  - `src/game.ts`: implementation of the Marrakech game

* `README.md`: this file

## Technologies

Out of the various technologies used within these project, these are the most notable ones:

### TypeScript

This [ECMAScript syntax extension](https://www.typescriptlang.org) is used to enforce types namely in the `game.ts` implementation of the Marrakech board game. It is also utilized in the implementation of all the individual components. It has proven invaluable in upholding strict rules in an otherwise notoriously weakly-typed language.

### React

The [web-development framework](https://react.dev) is utilized to design reactive web applications, and all of the app's UI components are rendered through React's inline HTML capabilities, and using states to ensure that the game refreshes itself.

### API

The backend of the application is serverless, and based on the AWS platform. The up-to-date data is taken care of by [AppSync](https://aws.amazon.com/pm/appsync/?trk=d3adb855-b91b-4e74-8308-5e9f08e34ed2&sc_channel=ps&ef_id=CjwKCAjwrpOiBhBVEiwA_473dFp4Z23HeoFtjZUl3j9gNSK1e3Bw8YLxoQhfMDrCmdl0JkBO-6upbhoCklQQAvD_BwE:G:s&s_kwcid=AL!4422!3!647302000945!e!!g!!amazon%20appsync!19621396985!145160419349) connected to [DynamoDB](https://aws.amazon.com/pm/dynamodb/?trk=1509de88-c72e-427e-a847-6a914fc95d08&sc_channel=ps&ef_id=CjwKCAjwrpOiBhBVEiwA_473dC-DplJNyJ9rC241dd0owtq3l4uzcye211M4HqZiCWCcY5sfUc1mWhoC3v8QAvD_BwE:G:s&s_kwcid=AL!4422!3!645186177970!e!!g!!dynamodb!19571721573!143945627894) using JS resolvers. Using AWS guarantees stability and scaleability.

## Testing

The game engine implemented in `src/game.ts` has been thoroughly tested with 100% code coverage (prior to adding interfaces to the file to handle objects received from the API). The tests are implemented in `game.test.ts` for the Jest framework.

Machine tests were not implemented for the React scripts as those require a different approach instead of pre-writing tests and fulfilling their requirements.

## Documentation

While the code is commented and relevant parts are documented using Doxygen-style comments, no technology has yet been utilized to generate complex documentation pages for the project.