# Tabius - Automatic Tab Grouping Assistant

### Current version: 2.0

Published at [Chrome Web Store](https://chrome.google.com/webstore/detail/tabius-automatic-tab-grou/enceimdjnaccoeikjobaeicfodlfnijp?hl=en) and [Microsoft Store](https://microsoftedge.microsoft.com/addons/detail/tabius-tab-grouping-ass/filcmnpmbooeiloehikfjlligcgnnibb)

![Tabius Icon](/public/icon.png "Tabius Icon")

An Automatic Tab Grouping Extension for Your Browser.
Tabius is a customizable and easy to use Tab Grouping assistant for Chrome.

![Tabius Features](/tabius-bento.png "Tabius Features")

If you use tab grouping or couldn't use it due to lack of options, Tabius is a must have extension for you.
The extension is packed with useful features like:

- Automatically create new tab groups when you open a link in a new tab.
- Auto Collapse inactive tab groups.
- Limit the browser to only create groups if the new tab matches the original tab's domain.
- Create custom tab grouping rules: always create tab groups with a specific name and color from your favorite websites!
- Save your favorite tab groups and restore them for later use!
- Don't want to create tab groups from a specific site? Create a blacklist from the settings or add the site to the blacklist right from the toolbar!
- Option to close an existing tab group when there is only 1 tab left in it.
- Limit maximum number of tabs allowed in a group.
- Automatically name tab groups based on domain/subdomain or the full URL.
- View current tab groups and act upon them by clicking on the extension icon right from the toolbar.
- Sync all your settings, tab groups, and custom lists with browser.
- ..and many more features.

I created this extension from my need. I use tab groups all the time and the extension helps enhance this feature.

### Special Thanks

- The open source icons are provided by [Iconoir](https://github.com/iconoir-icons/iconoir)
- Preact
- Vite

## Contribution guide

First, clone the repository and run `npm install` in the project directory.
Then run `npm run build` to build the extension. The dist folder will contain all the relevant bits after this step.

Next, go into the code and make a modification. In this case, the function "f" was modified in the background.js file to include the statement "Please ensure this URL is correct" to the end of the message, a console log statement "Rule deleted for URL" was added to indicate when a rule has been successfully deleted and error handling was improved by making it possible to log errors into the console.

To commit the changes to the github repository, save the file. In the terminal type "git add *path to background.js*" to stage the changes.
Then, commit the changes using the sommand "git commit -m *message descirbing changes that were made*"
Type "git push origin main" to push the changes to the repository.

To install in your browser, go to your Chrome/Edge (or any Chromium based browsers) Extension page and click on `Load Unpacked` and then select the `dist` folder.
The extension is good to go.

Please create an issue first before you make a pull request.

The goal of this extension is to be as simple as possible while providing the best tab grouping experience.
