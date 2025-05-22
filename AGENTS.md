# Repo Guide

## Adding New Posts
1. Create a folder at `/posts/<slug>/` and place an `index.html` inside following the existing examples.
2. The page must include `<script type="module" src="/post-init.js"></script>` so metadata and components load automatically.
3. Append an object describing the post to `posts.json`. Include at least `slug`, `title`, `subtitle` and `cover`.

## Adding New Components
1. Create a JavaScript module in `/components/` with the same name as the custom tag (e.g. `youtube-embed.js` for `<youtube-embed>`).
2. Export the element via `customElements.define(...)`.
3. When a tag is used in a page, `post-init.js` will dynamically import the matching file.

Keep these conventions in mind when extending the site.
