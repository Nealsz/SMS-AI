export async function summarize(text: string) {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      body: JSON.stringify({
        model: "llama3.1:latest",
        prompt: `Summarize the following student data:\n\n${text}`,
      }),
    });
  
    const stream = response.body;
    if (!stream) {
        throw new Error("Response body is null");
    }
    const reader = stream.getReader();
    let result = "";
  
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      result += new TextDecoder().decode(value);
    }
  
    return result;
  }
  