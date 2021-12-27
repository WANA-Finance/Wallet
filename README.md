# SPL Token Wallet

Example Solana wallet with support for [SPL tokens](https://spl.solana.com/token) and Serum integration.

See [sollet.io](https://www.sollet.io) or the [Sollet Chrome Extension](https://chrome.google.com/webstore/detail/sollet/fhmfendgdocmcbmfikdcogofphimnkno) for a demo.

Wallet keys are stored in `localStorage`, optionally encrypted by a password.

Run `yarn start` to start a development server or `yarn build` to create a production build that can be served by a static file server.

See the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started) for other commands and options.

# safari 

When converting from the stock sollet you'll get the following warnings

```
Warning: The following keys in your manifest.json are not supported by your current version of Safari. If these are critical to your extension, you should review your code to see if you need to make changes to support Safari:
        manifest_version
        description
        persistent
        version
        js
        content_security_policy
        matches
        name
        icons
        scripts
        storage
        browser_action
        web_accessible_resources
        all_frames
        run_at
Warning: Persistent background pages are not supported on iOS and iPadOS. You will need to make changes to support a non-persistent background page.
```