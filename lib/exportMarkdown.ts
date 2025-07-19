export function htmlToMarkdown(html: string): string {
  let markdown = html;

  // Remove script and style tags
  markdown = markdown.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
  markdown = markdown.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");

  // Convert headings
  markdown = markdown.replace(/<h1[^>]*>(.*?)<\/h1>/gi, "# $1\n\n");
  markdown = markdown.replace(/<h2[^>]*>(.*?)<\/h2>/gi, "## $1\n\n");
  markdown = markdown.replace(/<h3[^>]*>(.*?)<\/h3>/gi, "### $1\n\n");
  markdown = markdown.replace(/<h4[^>]*>(.*?)<\/h4>/gi, "#### $1\n\n");
  markdown = markdown.replace(/<h5[^>]*>(.*?)<\/h5>/gi, "##### $1\n\n");
  markdown = markdown.replace(/<h6[^>]*>(.*?)<\/h6>/gi, "###### $1\n\n");

  // Convert paragraphs
  markdown = markdown.replace(/<p[^>]*>(.*?)<\/p>/gi, "$1\n\n");

  // Convert line breaks
  markdown = markdown.replace(/<br\s*\/?>/gi, "\n");

  // Convert strong and bold
  markdown = markdown.replace(/<strong[^>]*>(.*?)<\/strong>/gi, "**$1**");
  markdown = markdown.replace(/<b[^>]*>(.*?)<\/b>/gi, "**$1**");

  // Convert emphasis and italic
  markdown = markdown.replace(/<em[^>]*>(.*?)<\/em>/gi, "*$1*");
  markdown = markdown.replace(/<i[^>]*>(.*?)<\/i>/gi, "*$1*");

  // Convert links
  markdown = markdown.replace(
    /<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi,
    "[$2]($1)"
  );

  // Convert unordered lists
  markdown = markdown.replace(
    /<ul[^>]*>([\s\S]*?)<\/ul>/gi,
    (match, content) => {
      return content.replace(/<li[^>]*>(.*?)<\/li>/gi, "- $1\n") + "\n";
    }
  );

  // Convert ordered lists
  markdown = markdown.replace(
    /<ol[^>]*>([\s\S]*?)<\/ol>/gi,
    (match, content) => {
      let counter = 1;
      return (
        content.replace(/<li[^>]*>(.*?)<\/li>/gi, () => `${counter++}. $1\n`) +
        "\n"
      );
    }
  );

  // Convert blockquotes
  markdown = markdown.replace(
    /<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi,
    (match, content) => {
      return (
        content
          .split("\n")
          .map((line: string) => `> ${line.trim()}`)
          .join("\n") + "\n\n"
      );
    }
  );

  // Convert code blocks
  markdown = markdown.replace(
    /<pre[^>]*>([\s\S]*?)<\/pre>/gi,
    "```\n$1\n```\n\n"
  );

  // Convert inline code
  markdown = markdown.replace(/<code[^>]*>(.*?)<\/code>/gi, "`$1`");

  // Convert horizontal rules
  markdown = markdown.replace(/<hr[^>]*>/gi, "---\n\n");

  // Clean up extra whitespace and empty lines
  markdown = markdown
    .replace(/\n\s*\n\s*\n/g, "\n\n")
    .replace(/^\s+|\s+$/gm, "")
    .trim();

  return markdown;
}

export function downloadMarkdown(
  content: string,
  filename: string = "blog-post.md"
): void {
  const blob = new Blob([content], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadText(
  content: string,
  filename: string = "blog-post.txt"
): void {
  // Remove HTML tags for plain text export
  const text = content.replace(/<[^>]+>/g, "");
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
