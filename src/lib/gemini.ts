/**
 * Generates a ~200-word summary for a blog post using Groq API (llama-3.3-70b-versatile).
 * Summary is generated ONCE on post creation and stored in DB to avoid repeated API calls.
 * Groq free tier: 14,400 requests/day — very generous.
 */
export async function generatePostSummary(title: string, body: string): Promise<string> {
  try {
    // Strip HTML tags and truncate to ~2000 chars to reduce token usage
    const truncatedBody = body.replace(/<[^>]+>/g, '').slice(0, 2000);

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 300,
        messages: [
          {
            role: 'system',
            content: 'You are a blog summarizer. Write concise, engaging summaries of approximately 200 words. Return only the summary text — no preamble, no meta-commentary.',
          },
          {
            role: 'user',
            content: `Summarize this blog post:\n\nTitle: ${title}\n\nContent: ${truncatedBody}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Groq API error:', error);
    // Fallback: extract first 200 words from body if API fails
    const plainText = body.replace(/<[^>]+>/g, '');
    const words = plainText.split(' ').slice(0, 200);
    return words.join(' ') + '...';
  }
}
