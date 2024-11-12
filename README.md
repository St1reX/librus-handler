# Librus Data Fetcher

A Node.js application that allows you to fetch data from the Librus API, including:
- Grades,
- Announcements,
- Messages,
- Lucky number,
- And more.

This app uses the `librus-api` library, making it easy to integrate with the Librus system and automatically retrieve all necessary data.

## Requirements

- Node.js (recommended version 14 or higher)
- Install the `librus-api` package

## Installation

To install all required dependencies, including `librus-api`, run the following command:

```bash
npm install librus-api
```
You also need to modify one function in `node_modules/librus-api/lib/api.js`.
```javascript
authorize(login, pass) {
    let caller = this.caller;
    return caller
      .get(
        "https://api.librus.pl/OAuth/Authorization?client_id=46&response_type=code&scope=mydata"
      )
      .then(() => {
        return caller.postForm(
          "https://api.librus.pl/OAuth/Authorization?client_id=46",
          {
            action: "login",
            login: login,
            pass: pass,
          }
        );
      })
      .then(() => {
        return caller
          .get("https://api.librus.pl/OAuth/Authorization/2FA?client_id=46")
          .then(() => {
            return this.cookie.getCookies(config.page_url);
          });
      })
      .catch(console.error); //LINE YOU ARE SUPPOSED TO REMOVE!!!
  }
```
