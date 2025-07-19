import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface BlogGenerationRequest {
  title: string;
  topic?: string;
  tone?: "professional" | "casual" | "academic" | "conversational";
  length?: "short" | "medium" | "long";
}

export interface BlogGenerationResponse {
  content: string;
  title: string;
  summary: string;
  isFallback?: boolean;
}

// Fallback content generation when OpenAI API is not available
function generateFallbackContent(
  request: BlogGenerationRequest
): BlogGenerationResponse {
  const { title, topic, tone = "professional", length = "medium" } = request;

  const lengthWords = {
    short: "800-1200",
    medium: "1500-2000",
    long: "2500-3500",
  };

  const toneStyle = {
    professional: "professional and authoritative",
    casual: "friendly and conversational",
    academic: "scholarly and research-based",
    conversational: "engaging and approachable",
  };

  const fallbackContent = `
<h1>${title}</h1>

<p>Welcome to our comprehensive guide on ${
    topic || title.toLowerCase()
  }. In this ${
    toneStyle[tone]
  } article, we'll explore the key aspects of this important topic and provide you with valuable insights and practical information.</p>

<h2>Understanding the Basics</h2>

<p>To begin our exploration, it's essential to understand the fundamental concepts that underpin this subject. Whether you're a beginner or an experienced professional, having a solid foundation is crucial for success.</p>

<ul>
<li>Key concept 1: Understanding the core principles</li>
<li>Key concept 2: Identifying important factors</li>
<li>Key concept 3: Recognizing common challenges</li>
</ul>

<h2>Why This Matters</h2>

<p>In today's rapidly evolving landscape, staying informed about ${
    topic || title.toLowerCase()
  } is more important than ever. The decisions we make today can have lasting impacts on our future success and growth.</p>

<p>Consider these important factors:</p>

<ol>
<li><strong>Impact on daily operations:</strong> How this affects your routine activities</li>
<li><strong>Long-term benefits:</strong> The advantages of proper implementation</li>
<li><strong>Risk mitigation:</strong> Strategies to avoid common pitfalls</li>
</ol>

<h2>Best Practices and Strategies</h2>

<p>Based on extensive research and real-world experience, here are some proven strategies that can help you achieve better results:</p>

<blockquote>
<p><em>"Success in this area requires a combination of knowledge, practice, and continuous learning."</em></p>
</blockquote>

<p>Some effective approaches include:</p>

<ul>
<li>Regular assessment and evaluation</li>
<li>Continuous learning and adaptation</li>
<li>Collaboration with experts and peers</li>
<li>Implementation of proven methodologies</li>
</ul>

<h2>Common Challenges and Solutions</h2>

<p>Every journey comes with its own set of challenges. Here are some common obstacles you might encounter and practical solutions to overcome them:</p>

<h3>Challenge 1: Getting Started</h3>
<p>Many people struggle with taking the first step. The solution is to break down the process into smaller, manageable tasks.</p>

<h3>Challenge 2: Maintaining Consistency</h3>
<p>Consistency is key to long-term success. Establish clear routines and stick to them.</p>

<h3>Challenge 3: Measuring Progress</h3>
<p>Set clear metrics and regularly track your progress to stay motivated and on track.</p>

<h2>Looking Ahead</h2>

<p>As we look to the future, it's clear that ${
    topic || title.toLowerCase()
  } will continue to play a vital role in our personal and professional development. By staying informed and proactive, you can position yourself for success in this evolving landscape.</p>

<h2>Conclusion</h2>

<p>In conclusion, mastering ${
    topic || title.toLowerCase()
  } requires dedication, patience, and a willingness to learn. By following the strategies outlined in this guide and maintaining a commitment to continuous improvement, you can achieve your goals and unlock new opportunities for growth and success.</p>

<p>Remember, the journey of a thousand miles begins with a single step. Start today, and you'll be amazed at how far you can go.</p>
`;

  const summary = `This comprehensive guide explores ${
    topic || title.toLowerCase()
  }, covering essential concepts, best practices, and practical strategies. Whether you're a beginner or experienced professional, this article provides valuable insights to help you succeed in this important area.`;

  return {
    content: fallbackContent,
    title: title,
    summary: summary,
    isFallback: true,
  };
}

export async function generateBlogContent(
  request: BlogGenerationRequest
): Promise<BlogGenerationResponse> {
  try {
    const { title, topic, tone = "professional", length = "medium" } = request;

    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.log(
        "OpenAI API key not configured, using fallback content generation"
      );
      return generateFallbackContent(request);
    }

    const lengthWords = {
      short: "800-1200",
      medium: "1500-2000",
      long: "2500-3500",
    };

    const prompt = `Write a professional blog post with the following requirements:

Title: ${title}
${topic ? `Topic: ${topic}` : ""}
Tone: ${tone}
Length: ${lengthWords[length]} words

Please write a well-structured blog post that includes:
1. An engaging introduction
2. Clear section headings (use H2 tags)
3. Informative and engaging content
4. A conclusion that summarizes key points
5. Proper formatting with paragraphs, lists, and emphasis where appropriate

Format the response in HTML with proper tags like <h1>, <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em>, etc.

Make sure the content is original, informative, and provides value to readers.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a professional content writer who creates engaging, informative blog posts. Always respond with properly formatted HTML content.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 4000,
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content || "";

    // Extract title from content if it's in H1 tags
    const titleMatch = content.match(/<h1[^>]*>(.*?)<\/h1>/i);
    const extractedTitle = titleMatch ? titleMatch[1] : title;

    // Generate a summary
    const summaryResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a content summarizer. Create a brief 2-3 sentence summary of the given content.",
        },
        {
          role: "user",
          content: `Summarize this blog post in 2-3 sentences: ${content.replace(
            /<[^>]*>/g,
            ""
          )}`,
        },
      ],
      max_tokens: 150,
      temperature: 0.3,
    });

    const summary = summaryResponse.choices[0]?.message?.content || "";

    return {
      content,
      title: extractedTitle,
      summary,
    };
  } catch (error) {
    // Provide more specific error messages
    if (error instanceof Error) {
      if (
        error.message.includes("model_not_found") ||
        error.message.includes("does not exist")
      ) {
        console.log(
          "OpenAI model not available, using fallback content generation"
        );
        return generateFallbackContent(request);
      } else if (
        error.message.includes("insufficient_quota") ||
        error.message.includes("quota") ||
        error.message.includes("429")
      ) {
        console.log("OpenAI quota exceeded, using fallback content generation");
        return generateFallbackContent(request);
      } else if (
        error.message.includes("invalid_api_key") ||
        error.message.includes("authentication")
      ) {
        console.log(
          "Invalid OpenAI API key, using fallback content generation"
        );
        return generateFallbackContent(request);
      } else {
        console.log("OpenAI API error, using fallback content generation");
        return generateFallbackContent(request);
      }
    }

    console.log("Unknown error, using fallback content generation");
    return generateFallbackContent(request);
  }
}
