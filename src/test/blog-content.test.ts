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
