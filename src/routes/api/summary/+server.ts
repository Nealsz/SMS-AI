import { db } from "$lib/server/db";
import { user } from "$lib/server/db/schema";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from './$types';
import axios from "axios";

export const GET: RequestHandler = async () => {
  const data = await db.select().from(user);

  const studentInfo = data
    .map(s => `Name: ${s.name}, Age: ${s.age}, Course: ${s.course}`)
    .join("\n");
  const prompt = `Summarize the following student data:\n${studentInfo}`;

  try {
    const response = await axios.post("http://localhost:11434/api/generate", {
      model: "mistral", // Or "llama2", "gemma", etc.
      prompt,
      stream: false
    });

    const summary = response.data.response;

    return json({
      summary,
      students: data
    });

  } catch (err: any) {
    return json({
      error: "Failed to generate summary using Ollama",
      details: err.message
    }, { status: 500 });
  }
};
