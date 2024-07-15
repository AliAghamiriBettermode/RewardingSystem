# Rewarding System

This project handles rewarding user points based on the user's activity.
It will save points using `MongoDB` database.
Point types:

- `Reaction Point (1)`: Points that are rewarded when a user reacts to a post created by specific user.
- `Comment Point (2)`: Points that are rewarded when a user comments on a post created by specific user.
- `Post Point (10)`: Points that are rewarded when a user creates a post and gets more than 5 reactions or comments.

## Flow Overview

1. **Create an App and Install It**
    - Obtain `client_id`, `client_secret`, and `webhook_signing_secret`.

2. **Setup Webhook domain**
    - Add a domain for handling webhooks.
    - Add `post.published` and `reaction.added` events.
    - Update webhooks.

3. **Add Custom Code**
    - Add custom code to `<body>` section
   ```html
   <script>
    let lastPath = ''
    function fetchMemberPointData() {
        if (lastPath !== location.pathname) {
            lastPath = location.pathname
            if (location.pathname.startsWith('/member/')) {
                fetch(`https://example.com/webhook/point-view/${location.pathname.replace('/member/', '')}`, {
                    method: 'POST',
                    redirect: 'follow',
                    })
                    .then((response) => response.json())
                    .then((result) => {
                        document.getElementById('member-profile-point-view').innerHTML = result.data.html
                    })
                    .catch((error) => console.error(error))
            }   
        }
    }
    
   // Function to observe DOM changes
    function observeDOMChanges() {
        const observer = new MutationObserver((mutationsList, observer) => {
            for (let mutation of mutationsList) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    fetchMemberPointData()
                }
            }
        })

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        })
    }

    // Initial run
    fetchMemberPointData()

    // Observe path changes
    window.addEventListener('popstate', fetchMemberPointData);

    // Handle pushState and replaceState as well
    (function(history) {
        const pushState = history.pushState
        const replaceState = history.replaceState

        history.pushState = function(state) {
            pushState.apply(history, arguments)
            window.dispatchEvent(new Event('popstate'))
        }

        history.replaceState = function(state) {
            replaceState.apply(history, arguments)
            window.dispatchEvent(new Event('popstate'))
        }
    })(window.history)
    
    observeDOMChanges()
   </script>
   ```

4. **Create a `.env` File**
   - Fill the `.env` file with the following variables:
   - `ADMIN_MEMBER_ID` is the ID of the admin member which is used to reward points.
    ```sh
   # Backend
   NODE_APP_PORT=XXXX
   
   # Database
   MONGODB_CONNECTION_URL=XXXXXXXX (e.g. 'mongodb://localhost:27017')
   MONGODB_DATABASE=XXXXXXXX
   
   # Bettermode
   WEBHOOK_SIGNING_SECRET=XXXXXXXXXXXXXXXXXXXXXXXX
   CLIENT_ID=XXXXXXXX-XXXXXXXXXXXXXXXX
   CLIENT_SECRET=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ADMIN_MEMBER_ID=XXXXXXXX
    ```

5. **Create an HTML Script in profile page**
    - Add the following HTML script to the profile page.
    ```html
    <div id="member-profile-point-view"></div>
    ```

6. **Fill in the Blanks in the Project**

7. **Run the Project**
    - Run the project using the following command:
    ```sh
    npm start
    ```