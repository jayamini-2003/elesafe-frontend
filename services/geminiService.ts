const API_KEY = process.env.EXPO_PUBLIC_GEMINI_KEY;

export const getSafetyAdvice = async (context: string) => {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Provide 3 short safety tips for: ${context}. Keep under 200 characters.`,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    return (
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Stay calm and safe distance."
    );
  } catch (error) {
    console.log("Gemini Error:", error);
    return "Move slowly away and avoid panic.";
  }
};