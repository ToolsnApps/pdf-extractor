import { GoogleGenAI } from "@google/genai";
import { OutputFormat } from '../types';

const getSystemInstruction = (format: OutputFormat): string => {
  switch (format) {
    case OutputFormat.CSV:
      return "You are an expert data extractor. Extract all tabular data or structured lists from the PDF and format it as a valid CSV (Comma Separated Values) file. Ensure all fields are properly quoted if they contain commas. Return ONLY the CSV data, no markdown code blocks.";
    case OutputFormat.JSON:
      return "You are a structured data parser. Extract the content from the PDF and represent it as a hierarchical JSON object. Keys should represent section headers or data labels. Return ONLY the valid JSON string, no markdown code blocks.";
    case OutputFormat.DOC:
      return "You are a document converter. Extract the text from the PDF, preserving paragraphs, headers, lists, and basic formatting. Return the output as clean HTML body content (use <h1>, <h2>, <p>, <ul>, <table> tags). Do not include <html> or <body> tags, just the inner content. Return ONLY the HTML content.";
    case OutputFormat.MD:
      return "You are a text extractor. Extract the content and format it using standard Markdown. Use headers, bullet points, and tables where appropriate. Return ONLY the markdown content.";
    case OutputFormat.TXT:
    default:
      return "You are a text extractor. Extract all text from the PDF file. Preserve layout by using newlines and spacing where appropriate to mimic the original document structure. Return ONLY the raw text.";
  }
};

export const convertPdf = async (base64Pdf: string, format: OutputFormat): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // We use gemini-2.5-flash for fast and efficient document processing
    const modelId = 'gemini-2.5-flash';

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'application/pdf',
              data: base64Pdf
            }
          },
          {
            text: "Convert this document based on the system instructions. Ensure the output is strictly in the requested format with no conversational text."
          }
        ]
      },
      config: {
        systemInstruction: getSystemInstruction(format),
        temperature: 0.2, // Low temperature for more deterministic/faithful extraction
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No content generated from the PDF.");
    }

    // Clean up any potential markdown code fencing if the model ignores instruction
    let cleanText = text.trim();
    if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```[a-z]*\n/, '').replace(/\n```$/, '');
    }

    return cleanText;

  } catch (error) {
    console.error("Gemini Conversion Error:", error);
    throw new Error(error instanceof Error ? error.message : "An unexpected error occurred during conversion.");
  }
};