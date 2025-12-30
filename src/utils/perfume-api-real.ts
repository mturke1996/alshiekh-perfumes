/**
 * Real Perfume API - Simple & Working
 * باستخدام Google Generative AI (مجاني!)
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

export interface PerfumeData {
  name: string;
  nameAr?: string;
  brand: string;
  brandAr?: string;
  description?: string;
  descriptionAr?: string;
  gender?: "men" | "women" | "unisex";
  genderAr?: string;
  concentration?: string;
  concentrationAr?: string;
  fragranceFamily?: string;
  fragranceFamilyAr?: string;
  topNotes?: string[];
  topNotesAr?: string[];
  middleNotes?: string[];
  middleNotesAr?: string[];
  baseNotes?: string[];
  baseNotesAr?: string[];
  scentProfile?: string;
  scentProfileAr?: string;
  season?: string[];
  seasonAr?: string[];
  occasion?: string[];
  occasionAr?: string[];
  longevity?: "weak" | "moderate" | "long-lasting" | "very-long-lasting";
  longevityAr?: string;
  sillage?: "intimate" | "moderate" | "strong" | "enormous";
  sillageAr?: string;
  year?: number;
}

/**
 * جلب بيانات العطر باستخدام Google Gemini AI
 */
export async function fetchPerfumeDataWithGemini(
  perfumeName: string,
  apiKey: string
): Promise<PerfumeData | null> {
  try {
    console.log("🔍 البحث عن:", perfumeName);

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
    });

    const prompt = `أنت خبير عطور. اعطني معلومات تفصيلية عن عطر "${perfumeName}".

أرجع JSON فقط بهذا الشكل بالضبط:
{
  "name": "اسم العطر بالإنجليزي",
  "nameAr": "اسم العطر بالعربي",
  "brand": "اسم الماركة بالإنجليزي",
  "brandAr": "اسم الماركة بالعربي",
  "description": "وصف بالإنجليزي",
  "descriptionAr": "وصف بالعربي",
  "gender": "men أو women أو unisex",
  "genderAr": "رجالي أو نسائي أو للجنسين",
  "concentration": "Eau de Parfum أو Eau de Toilette",
  "concentrationAr": "او دو بارفان أو او دو تواليت",
  "topNotes": ["نوتة1", "نوتة2"],
  "topNotesAr": ["نوتة1 عربي", "نوتة2 عربي"],
  "middleNotes": ["نوتة1", "نوتة2"],
  "middleNotesAr": ["نوتة1 عربي", "نوتة2 عربي"],
  "baseNotes": ["نوتة1", "نوتة2"],
  "baseNotesAr": ["نوتة1 عربي", "نوتة2 عربي"]
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    console.log("📝 الرد:", text);

    // استخراج JSON
    const jsonMatch = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim()
      .match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const perfumeData = JSON.parse(jsonMatch[0]);
      console.log("✅ نجح!", perfumeData);
      return perfumeData;
    }

    return null;
  } catch (error: any) {
    console.error("❌ خطأ:", error.message);
    return null;
  }
}

/**
 * دالة رئيسية
 */
export async function fetchPerfumeData(
  perfumeName: string,
  geminiApiKey?: string
): Promise<PerfumeData | null> {
  if (!geminiApiKey) return null;
  return await fetchPerfumeDataWithGemini(perfumeName, geminiApiKey);
}

/**
 * حفظ API Key في localStorage (بسيط وسريع)
 */
export function saveApiKey(type: "gemini", apiKey: string): boolean {
  try {
    localStorage.setItem("gemini_api_key", apiKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * قراءة API Key
 */
export function getApiKey(type: "gemini"): string | null {
  try {
    return localStorage.getItem("gemini_api_key");
  } catch {
    return null;
  }
}

/**
 * حذف API Key
 */
export function clearApiKey(type: "gemini"): boolean {
  try {
    localStorage.removeItem("gemini_api_key");
    return true;
  } catch {
    return false;
  }
}
