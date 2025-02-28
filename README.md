# README

This is a fork of [Tabius](https://github.com/FaisalBinAhmed/tabius) aiming at the implementation of further tab grouping features.

## Contribution guide

First, clone the repository and run `npm install` in the project directory.
Then run `npm run build` to build the extension. The dist folder will contain the built Chromeextension.

Next, go into the code and make a modification. In this case, the function "f" was modified in the background.js file to include the statement "Please ensure this URL is correct" to the end of the message, a console log statement "Rule deleted for URL" was added to indicate when a rule has been successfully deleted and error handling was improved by making it possible to log errors into the console.

To commit the changes to the github repository, save the file. In the terminal type "git add *path to background.js*" to stage the changes.
Then, commit the changes using the sommand "git commit -m *message descirbing changes that were made*"
Type "git push origin main" to push the changes to the repository.

To install in your browser, go to your Chrome/Edge (or any Chromium based browsers) Extension page and click on `Load Unpacked` and then select the `dist` folder.
The extension is good to go.

Please create an issue first before you make a pull request.

The goal of this extension is to be as simple as possible while providing the best tab grouping experience.
