# Post System Instructions

To create a new post for the site:

1. Inside the `posts` folder, create a new directory named with a URL friendly version of the post title.
   - Use lowercase letters and hyphens (`-`) to separate words.
2. In that directory create two files:
   - `metadata.json` – contains details used on the front page.
   - `index.html` – contains the HTML content of the post.
3. The `metadata.json` file should look like this:

```json
{
  "title": "Your Post Title",
  "image": "url-to-image.jpg",
  "subtitle": "Short subtitle for the post",
  "tags": ["tag1", "tag2"],
  "date": "YYYY-MM-DD"
}
```

4. Add the folder name to the `postFolders` array in `index.html` so the post appears on the front page.
5. Commit your changes.

Posts are loaded dynamically on the front page via JavaScript, which reads each `metadata.json` file and builds the post cards automatically.
