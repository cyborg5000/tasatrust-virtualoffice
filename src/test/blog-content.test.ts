import DOMPurify from "dompurify";
import {
  decorateArticleHtml,
  extractFaqItemsFromHtml,
} from "@/lib/blog-content";

describe("blog content helpers", () => {
  it("extracts faq items from details blocks", () => {
    const html = `
      <details>
        <summary>What is a virtual office?</summary>
        <p>A professional business address without a traditional lease.</p>
      </details>
    `;

    expect(extractFaqItemsFromHtml(html)).toEqual([
      {
        question: "What is a virtual office?",
        answer: "A professional business address without a traditional lease.",
      },
    ]);
  });

  it("adds heading ids and builds a table of contents", () => {
    const html = `
      <h2>Why choose Singapore?</h2>
      <p>Content</p>
      <h3>Tax efficiency</h3>
    `;

    const result = decorateArticleHtml(html);

    expect(result.headings).toEqual([
      { id: "why-choose-singapore", text: "Why choose Singapore?", level: 2 },
      { id: "tax-efficiency", text: "Tax efficiency", level: 3 },
    ]);
    expect(result.html).toContain('id="why-choose-singapore"');
    expect(result.html).toContain('id="tax-efficiency"');
  });
});

describe("article video embeds", () => {
  const YOUTUBE = "https://www.youtube.com/embed/hxFopN-2z4E";
  const cmsVideoBlock = `<figure class="qweaver-video-block" data-video-source-type="youtube"><iframe class="qweaver-video-block__iframe" src="${YOUTUBE}" title="YouTube video player" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen="true" width="560" height="315"></iframe></figure>`;

  const render = (html: string) => {
    const container = document.createElement("div");
    container.innerHTML = decorateArticleHtml(html).html;
    return container;
  };

  it("keeps the YouTube embed the CMS writes, with safe attributes only", () => {
    const iframe = render(cmsVideoBlock).querySelector("figure > iframe");

    expect(iframe).not.toBeNull();
    expect(iframe?.getAttribute("src")).toBe(YOUTUBE);
    expect(iframe?.getAttribute("allowfullscreen")).toBe("true");
    expect(iframe?.getAttribute("allow")).toContain("encrypted-media");
    expect(iframe?.getAttributeNames().sort()).toEqual(
      ["allow", "allowfullscreen", "height", "loading", "src", "title", "width"].sort(),
    );
  });

  it.each([
    ["youtube.com without www", "https://youtube.com/embed/hxFopN-2z4E"],
    ["youtube-nocookie", "https://www.youtube-nocookie.com/embed/hxFopN-2z4E"],
    ["a query string", "https://www.youtube.com/embed/hxFopN-2z4E?rel=0&start=30"],
  ])("keeps %s", (_label, src) => {
    const iframe = render(`<p>Before</p><iframe src="${src}"></iframe>`).querySelector("iframe");
    expect(iframe?.getAttribute("src")).toBe(src);
  });

  it.each([
    ["vimeo", `<iframe src="https://player.vimeo.com/video/76979871"></iframe>`],
    ["javascript: src", `<iframe src="javascript:alert(1)"></iframe>`],
    ["data: src", `<iframe src="data:text/html,<script>alert(1)</script>"></iframe>`],
    ["srcdoc alone", `<iframe srcdoc="<script>alert(1)</script>"></iframe>`],
    ["srcdoc beside a YouTube src", `<iframe src="${YOUTUBE}" srcdoc="<script>alert(1)</script>"></iframe>`],
    ["lookalike host", `<iframe src="https://www.youtube.com.evil.com/embed/hxFopN-2z4E"></iframe>`],
    ["userinfo host trick", `<iframe src="https://www.youtube.com@evil.com/embed/hxFopN-2z4E"></iframe>`],
    ["protocol-relative", `<iframe src="//www.youtube.com/embed/hxFopN-2z4E"></iframe>`],
    ["http:", `<iframe src="http://www.youtube.com/embed/hxFopN-2z4E"></iframe>`],
    ["YouTube non-embed path", `<iframe src="https://www.youtube.com/watch?v=hxFopN-2z4E"></iframe>`],
    ["path after the video id", `<iframe src="https://www.youtube.com/embed/hxFopN-2z4E/../../redirect?q=https://evil.com"></iframe>`],
    ["padded src", `<iframe src=" ${YOUTUBE}"></iframe>`],
    ["uppercase markup", `<IFRAME SRC="https://evil.com/"></IFRAME>`],
    ["no src", `<iframe></iframe>`],
  ])("removes an iframe with %s", (_label, hostile) => {
    const container = render(`<p>Before</p>${hostile}<p>After</p>`);

    expect(container.querySelector("iframe")).toBeNull();
    expect(container.innerHTML).not.toMatch(/iframe|script|srcdoc|evil|vimeo/i);
    expect(container.querySelectorAll("p")).toHaveLength(2);
  });

  it("strips event handlers, extra attributes and inner markup from a kept embed", () => {
    const container = render(
      `<iframe src="${YOUTUBE}" onload="alert(1)" onmouseover="alert(2)" style="position:fixed" name="x" id="y" sandbox=""><script>alert(3)</script></iframe>`,
    );
    const iframe = container.querySelector("iframe");

    expect(iframe?.getAttributeNames()).toEqual(["src"]);
    expect(container.innerHTML).toBe(`<iframe src="${YOUTUBE}"></iframe>`);
  });

  it.each([
    [
      "a decoy YouTube src quoted inside another attribute",
      `<iframe title='src="${YOUTUBE}"' src="https://evil.com/x"></iframe>`,
    ],
    ["a hostile src ahead of a YouTube src", `<iframe src="https://evil.com/x" src="${YOUTUBE}"></iframe>`],
  ])("removes an iframe with %s", (_label, hostile) => {
    const container = render(`<p>Before</p>${hostile}<p>After</p>`);

    expect(container.querySelector("iframe")).toBeNull();
    expect(container.innerHTML).not.toMatch(/evil/);
  });

  it.each([
    ["a > inside an attribute next to onload", `<iframe src="${YOUTUBE}" title="a>b" onload="alert(1)"></iframe>`],
    ["a nested hostile iframe", `<iframe src="${YOUTUBE}"><iframe src="https://evil.com/x"></iframe></iframe>`],
    [
      "a comment that closes the iframe early",
      `<iframe src="${YOUTUBE}"><!--</iframe><img src="x" onerror="alert(1)">--></iframe>`,
    ],
    ["a YouTube src ahead of a hostile src", `<iframe src="${YOUTUBE}" src="https://evil.com/x"></iframe>`],
  ])("keeps one clean embed and nothing else from %s", (_label, html) => {
    const container = render(html);
    const iframes = container.querySelectorAll("iframe");

    expect(iframes).toHaveLength(1);
    expect(iframes[0].getAttribute("src")).toBe(YOUTUBE);
    expect(iframes[0].innerHTML).toBe("");
    expect(container.innerHTML).not.toMatch(/evil|onload|onerror|alert/);
  });

  it("still strips everything else it stripped before", () => {
    const container = render(
      `<p onclick="alert(1)">Text</p><script>alert(1)</script><img src="x" onerror="alert(1)"><a href="javascript:alert(1)">link</a><object data="https://evil.com/x.swf"></object><embed src="https://evil.com/x.swf"><p allow="camera" allowfullscreen referrerpolicy="unsafe-url" frameborder="0">Attrs</p>`,
    );

    expect(container.querySelector("script, object, embed")).toBeNull();
    expect(container.innerHTML).not.toMatch(/onclick|onerror|javascript:|allow|referrerpolicy|frameborder/i);
  });

  it("leaves ordinary article HTML exactly as the previous sanitizer did", () => {
    const ordinary = `<p>Intro with <strong>bold</strong>, <em>emphasis</em> and a <a href="https://www.tasatrust.com/pricing" target="_blank" rel="noopener">link</a>.</p><figure><img src="https://example.com/a.jpg" alt="Office" loading="lazy" width="800" height="400"><figcaption>Caption</figcaption></figure><ul><li>One</li><li>Two</li></ul><blockquote>Quote</blockquote><table class="faq-block-table" data-faq-block="1"><tbody><tr><td>Q</td><td>What?</td></tr><tr><td>A</td><td>That.</td></tr></tbody></table><details><summary>More</summary><p>Hidden</p></details><pre><code>const a = 1;</code></pre>`;
    const previous = DOMPurify.sanitize(ordinary, {
      USE_PROFILES: { html: true },
      ADD_TAGS: ["details", "summary"],
    });

    expect(decorateArticleHtml(ordinary).html).toBe(
      new DOMParser().parseFromString(previous, "text/html").body.innerHTML,
    );
  });

  it("does not leak the iframe rule into other DOMPurify calls", () => {
    render(cmsVideoBlock);

    expect(DOMPurify.sanitize(`<iframe src="${YOUTUBE}"></iframe>`)).toBe("");
    // The shared instance has no iframe hook: asked to allow iframes, it keeps any of them.
    expect(
      DOMPurify.sanitize(`<iframe src="https://player.vimeo.com/video/1"></iframe>`, {
        ADD_TAGS: ["iframe"],
      }),
    ).toContain("player.vimeo.com");
  });
});
