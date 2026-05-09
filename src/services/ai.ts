
import { GoogleGenAI, Type } from "@google/genai";
import { LANDMARK_DEFINITIONS } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// The 19 landmarks in exact order as returned by HRNet-W32
// https://huggingface.co/cwlachap/hrnet-cephalometric-landmark-detection
const HRNET_LANDMARK_ORDER = [
  "S", "N", "Or", "Po", "A", "B", "Pog", "Me", "Gn", "Go", 
  "L1", "U1", "Ls", "Li", "Sn", "PgS", "PNS", "ANS", "Ar"
];

// Use this to connect to a custom Python/HRNet backend
export const detectLandmarksWithHRNet = async (base64Image: string, hrnetApiUrl: string) => {
  try {
    const url = hrnetApiUrl || "http://localhost:8000/predict";
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: base64Image }),
    });

    if (!response.ok) {
      throw new Error(`HRNet API Error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Normalize response based on potential formats from standard HRNet serving
    let points: {x: number, y: number}[] = [];
    
    if (Array.isArray(data)) {
        points = data.map(p => Array.isArray(p) ? {x: p[0], y: p[1]} : p);
    } else if (data.landmarks && Array.isArray(data.landmarks)) {
        points = data.landmarks.map((p: any) => Array.isArray(p) ? {x: p[0], y: p[1]} : p);
    } else if (data.points && Array.isArray(data.points)) {
        points = data.points.map((p: any) => Array.isArray(p) ? {x: p[0], y: p[1]} : p);
    } else {
        // Fallback
        points = data;
    }

    if (!points || !Array.isArray(points)) {
      throw new Error("Invalid response format from HRNet API. Expected array of coordinates.");
    }
    
    // Map the 19 raw ordered coordinates to our application's landmark format
    const mappedLandmarks = points.slice(0, 19).map((point, index) => {
      const id = HRNET_LANDMARK_ORDER[index];
      // Note: Assuming API returns normalized values (0-1) or absolute pixel values
      // scaling normalization should be handled based on your API's spec.
      // If the API returns raw 768x768 coordinates, we normalize them to 0-1 range here:
      const x = point.x > 1 ? point.x / 768.0 : point.x;
      const y = point.y > 1 ? point.y / 768.0 : point.y;
      
      return {
        id: id,
        x: x,
        y: y
      };
    });

    return mappedLandmarks;
  } catch (error) {
    console.error("HRNet Detection failed:", error);
    throw error;
  }
};

export const detectLandmarks = async (base64Image: string) => {
  const model = "gemini-2.5-pro"; // Highly capable vision model
  
  const landmarkList = LANDMARK_DEFINITIONS.map(l => `${l.id}: ${l.name} (${l.description})`).join('\n');
  
  const prompt = `
    You are an expert, highly precise orthodontist and radiologist specializing in cephalometric analysis.
    Analyze the provided lateral cephalometric X-ray image deeply.

    Your task is to identify and precisely locate the exact anatomical coordinates for a required set of cephalometric landmarks.
    Return the coordinates as strictly normalized floating-point values (0.0000 to 1.0000) relative to the image dimensions.
    (0,0) represents the absolute top-left corner, and (1,1) represents the absolute bottom-right corner.
    
    Examine the bony structures (like the sella turcica, nasion, maxilla, mandible) and soft tissues carefully to find the exact positions.
    Please ensure high precision, matching standard orthodontic tracing methodology.
    
    Landmarks to detect:
    ${landmarkList}
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: [
        {
          parts: [
            { text: prompt },
            { inlineData: { mimeType: "image/jpeg", data: base64Image.split(',')[1] || base64Image } }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              x: { type: Type.NUMBER },
              y: { type: Type.NUMBER }
            },
            required: ["id", "x", "y"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text);
  } catch (error) {
    console.error("Error detecting landmarks:", error);
    throw error;
  }
};
