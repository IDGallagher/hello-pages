/* /index.js  –  front-page logic
   Fetch posts.json, build a card for each post and append it to #card-grid.
   Change PAGE_SIZE if you want fewer/more cards at first load.            */

const PAGE_SIZE = 9;   // number of cards to show initially
let page = 0, posts = [];

(async () => {
  posts = await fetch("/posts.json").then(r => r.json());
  if (!Array.isArray(posts)) {
    console.error("posts.json is not an array"); return;
  }
  renderPage();
})();

function renderPage() {
  const slice = posts.slice(page * PAGE_SIZE, ++page * PAGE_SIZE);
  const grid  = document.getElementById("card-grid");
  slice.forEach(p => grid.append(makeCard(p)));
}

function makeCard({ slug, title, subtitle, cover }) {
  const a = document.createElement("a");
  a.href  = `/posts/${slug}/`;
  a.className = "card";
  a.innerHTML = `
      <img src="${cover}" alt="${title}">
      <div class="card-body">
        <h3>${title}</h3>
        <p>${subtitle}</p>
      </div>`;
  return a;
}
