/**
 * Perfume API Service
 * Service for fetching perfume data from external APIs
 * يمكن ربطه مع أي API خارجي مثل:
 * - Fragrantica API
 * - Parfumo API
 * - OpenAI API للذكاء الاصطناعي
 * - أو أي API مخصص
 */

export interface PerfumeData {
  name: string;
  nameAr?: string;
  brand: string;
  brandAr?: string;
  description?: string;
  descriptionAr?: string;
  
  // Fragrance Details
  gender?: 'men' | 'women' | 'unisex';
  genderAr?: string;
  concentration?: string;
  concentrationAr?: string;
  fragranceFamily?: string;
  fragranceFamilyAr?: string;
  
  // Notes
  topNotes?: string[];
  topNotesAr?: string[];
  middleNotes?: string[];
  middleNotesAr?: string[];
  baseNotes?: string[];
  baseNotesAr?: string[];
  
  // Additional Info
  scentProfile?: string;
  scentProfileAr?: string;
  season?: string[];
  seasonAr?: string[];
  occasion?: string[];
  occasionAr?: string[];
  longevity?: 'weak' | 'moderate' | 'long-lasting' | 'very-long-lasting';
  longevityAr?: string;
  sillage?: 'intimate' | 'moderate' | 'strong' | 'enormous';
  sillageAr?: string;
  
  // Year
  year?: number;
}

/**
 * Mock data for demonstration
 * يمكن استبداله بـ API حقيقي
 */
const MOCK_PERFUME_DATABASE: Record<string, PerfumeData> = {
  // Dior Sauvage
  'dior sauvage': {
    name: 'Sauvage',
    nameAr: 'سوفاج',
    brand: 'Dior',
    brandAr: 'ديور',
    description: 'Sauvage is a fragrance for men that was launched by Dior in 2015. It is a fresh, spicy scent with notes of bergamot, pepper, and ambroxan.',
    descriptionAr: 'عطر سوفاج من ديور هو عطر رجالي منعش وحار يتميز بنوتات البرغموت والفلفل والأمبروكسان',
    gender: 'men',
    genderAr: 'رجالي',
    concentration: 'Eau de Toilette',
    concentrationAr: 'او دو تواليت',
    fragranceFamily: 'Woody Aromatic',
    fragranceFamilyAr: 'خشبي عطري',
    topNotes: ['Bergamot', 'Pepper'],
    topNotesAr: ['برغموت', 'فلفل'],
    middleNotes: ['Lavender', 'Pink Pepper', 'Elemi', 'Geranium', 'Vetiver', 'Patchouli'],
    middleNotesAr: ['لافندر', 'فلفل وردي', 'ايليمي', 'جيرانيوم', 'فيتيفر', 'باتشولي'],
    baseNotes: ['Ambroxan', 'Cedar', 'Labdanum'],
    baseNotesAr: ['أمبروكسان', 'أرز', 'لابدانوم'],
    scentProfile: 'Fresh, Spicy, Woody',
    scentProfileAr: 'منعش، حار، خشبي',
    season: ['Spring', 'Summer', 'Fall'],
    seasonAr: ['ربيع', 'صيف', 'خريف'],
    occasion: ['Casual', 'Sport', 'Office'],
    occasionAr: ['يومي', 'رياضي', 'عمل'],
    longevity: 'long-lasting',
    longevityAr: 'ثبات طويل',
    sillage: 'strong',
    sillageAr: 'قوي',
    year: 2015,
  },
  
  // Chanel Bleu
  'chanel bleu': {
    name: 'Bleu de Chanel',
    nameAr: 'بلو دو شانيل',
    brand: 'Chanel',
    brandAr: 'شانيل',
    description: 'An aromatic-woody fragrance that captures the spirit of freedom with a fresh, clean scent.',
    descriptionAr: 'عطر خشبي عطري يجسد روح الحرية برائحة منعشة ونظيفة',
    gender: 'men',
    genderAr: 'رجالي',
    concentration: 'Eau de Parfum',
    concentrationAr: 'او دو بارفان',
    fragranceFamily: 'Woody Aromatic',
    fragranceFamilyAr: 'خشبي عطري',
    topNotes: ['Lemon', 'Bergamot', 'Mint', 'Pink Pepper'],
    topNotesAr: ['ليمون', 'برغموت', 'نعناع', 'فلفل وردي'],
    middleNotes: ['Ginger', 'Nutmeg', 'Jasmine', 'Iso E Super'],
    middleNotesAr: ['زنجبيل', 'جوزة الطيب', 'ياسمين', 'ايزو اي سوبر'],
    baseNotes: ['Incense', 'Vetiver', 'Cedar', 'Sandalwood', 'Patchouli', 'Labdanum', 'White Musk'],
    baseNotesAr: ['بخور', 'فيتيفر', 'أرز', 'خشب الصندل', 'باتشولي', 'لابدانوم', 'مسك أبيض'],
    scentProfile: 'Fresh, Woody, Elegant',
    scentProfileAr: 'منعش، خشبي، أنيق',
    season: ['All Seasons'],
    seasonAr: ['جميع الفصول'],
    occasion: ['Formal', 'Office', 'Evening'],
    occasionAr: ['رسمي', 'عمل', 'مسائي'],
    longevity: 'very-long-lasting',
    longevityAr: 'ثبات قوي جداً',
    sillage: 'strong',
    sillageAr: 'قوي',
    year: 2010,
  },

  // Yves Saint Laurent La Nuit de L'Homme
  'ysl la nuit': {
    name: "La Nuit de L'Homme",
    nameAr: 'لا نوي دو لوم',
    brand: 'Yves Saint Laurent',
    brandAr: 'ايف سان لوران',
    description: 'A mysterious and seductive masculine fragrance with spicy and woody notes.',
    descriptionAr: 'عطر رجالي غامض ومغري بنوتات حارة وخشبية',
    gender: 'men',
    genderAr: 'رجالي',
    concentration: 'Eau de Toilette',
    concentrationAr: 'او دو تواليت',
    fragranceFamily: 'Woody Spicy',
    fragranceFamilyAr: 'خشبي حار',
    topNotes: ['Cardamom', 'Bergamot', 'Cedar'],
    topNotesAr: ['هيل', 'برغموت', 'أرز'],
    middleNotes: ['Lavender', 'Caraway', 'Coumarin'],
    middleNotesAr: ['لافندر', 'كراوية', 'كومارين'],
    baseNotes: ['Vetiver', 'Virginia Cedar'],
    baseNotesAr: ['فيتيفر', 'أرز فيرجينيا'],
    scentProfile: 'Spicy, Woody, Seductive',
    scentProfileAr: 'حار، خشبي، مغري',
    season: ['Fall', 'Winter'],
    seasonAr: ['خريف', 'شتاء'],
    occasion: ['Evening', 'Date Night', 'Night Out'],
    occasionAr: ['مسائي', 'موعد غرامي', 'خروجات ليلية'],
    longevity: 'moderate',
    longevityAr: 'ثبات متوسط',
    sillage: 'moderate',
    sillageAr: 'متوسط',
    year: 2009,
  },

  // Tom Ford Black Orchid
  'tom ford black orchid': {
    name: 'Black Orchid',
    nameAr: 'بلاك أوركيد',
    brand: 'Tom Ford',
    brandAr: 'توم فورد',
    description: 'A luxurious and sensual unisex fragrance with rich, dark accords of black orchid and spice.',
    descriptionAr: 'عطر فاخر ومثير للجنسين بنوتات غنية وداكنة من الأوركيد الأسود والتوابل',
    gender: 'unisex',
    genderAr: 'للجنسين',
    concentration: 'Eau de Parfum',
    concentrationAr: 'او دو بارفان',
    fragranceFamily: 'Oriental Floral',
    fragranceFamilyAr: 'شرقي زهري',
    topNotes: ['Truffle', 'Gardenia', 'Black Currant', 'Ylang-Ylang', 'Jasmine', 'Bergamot', 'Mandarin Orange', 'Amalfi Lemon'],
    topNotesAr: ['كمأة', 'غاردينيا', 'كشمش أسود', 'يلانغ يلانغ', 'ياسمين', 'برغموت', 'برتقال ماندرين', 'ليمون أمالفي'],
    middleNotes: ['Orchid', 'Spices', 'Lotus', 'Fruity Notes'],
    middleNotesAr: ['أوركيد', 'توابل', 'لوتس', 'نوتات فواكه'],
    baseNotes: ['Mexican chocolate', 'Patchouli', 'Vanilla', 'Incense', 'Amber', 'Sandalwood', 'Vetiver', 'White Musk'],
    baseNotesAr: ['شوكولاتة مكسيكية', 'باتشولي', 'فانيليا', 'بخور', 'عنبر', 'خشب الصندل', 'فيتيفر', 'مسك أبيض'],
    scentProfile: 'Dark, Luxurious, Sensual',
    scentProfileAr: 'داكن، فاخر، مثير',
    season: ['Fall', 'Winter'],
    seasonAr: ['خريف', 'شتاء'],
    occasion: ['Evening', 'Formal', 'Special Occasions'],
    occasionAr: ['مسائي', 'رسمي', 'مناسبات خاصة'],
    longevity: 'very-long-lasting',
    longevityAr: 'ثبات قوي جداً',
    sillage: 'enormous',
    sillageAr: 'قوي جداً',
    year: 2006,
  },

  // Creed Aventus
  'creed aventus': {
    name: 'Aventus',
    nameAr: 'أفينتوس',
    brand: 'Creed',
    brandAr: 'كريد',
    description: 'A sophisticated fragrance inspired by the dramatic life of a historic emperor, celebrating strength, power and success.',
    descriptionAr: 'عطر راقٍ مستوحى من حياة إمبراطور تاريخي، يحتفي بالقوة والسلطة والنجاح',
    gender: 'men',
    genderAr: 'رجالي',
    concentration: 'Eau de Parfum',
    concentrationAr: 'او دو بارفان',
    fragranceFamily: 'Woody Fruity',
    fragranceFamilyAr: 'خشبي فاكهي',
    topNotes: ['Pineapple', 'Bergamot', 'Black Currant', 'Apple'],
    topNotesAr: ['أناناس', 'برغموت', 'كشمش أسود', 'تفاح'],
    middleNotes: ['Birch', 'Patchouli', 'Moroccan Jasmine', 'Rose'],
    middleNotesAr: ['خشب البتولا', 'باتشولي', 'ياسمين مغربي', 'ورد'],
    baseNotes: ['Musk', 'Oak Moss', 'Ambergris', 'Vanilla'],
    baseNotesAr: ['مسك', 'طحلب السنديان', 'عنبر', 'فانيليا'],
    scentProfile: 'Fruity, Woody, Fresh',
    scentProfileAr: 'فاكهي، خشبي، منعش',
    season: ['All Seasons'],
    seasonAr: ['جميع الفصول'],
    occasion: ['Business', 'Formal', 'Celebration'],
    occasionAr: ['عمل', 'رسمي', 'احتفالات'],
    longevity: 'very-long-lasting',
    longevityAr: 'ثبات قوي جداً',
    sillage: 'strong',
    sillageAr: 'قوي',
    year: 2010,
  },
};

/**
 * Search for perfume data by name
 * البحث عن بيانات العطر بالاسم
 */
export async function searchPerfume(perfumeName: string): Promise<PerfumeData | null> {
  try {
    // Normalize search term
    const searchTerm = perfumeName.toLowerCase().trim();
    
    // Search in mock database
    // يمكن استبدال هذا بـ API call حقيقي
    for (const [key, data] of Object.entries(MOCK_PERFUME_DATABASE)) {
      if (
        key.includes(searchTerm) ||
        data.name.toLowerCase().includes(searchTerm) ||
        data.nameAr?.includes(perfumeName) ||
        `${data.brand.toLowerCase()} ${data.name.toLowerCase()}`.includes(searchTerm)
      ) {
        return data;
      }
    }

    // If not found in mock database, try to fetch from API
    // هنا يمكن إضافة استدعاء API خارجي
    // مثال: const response = await fetch(`https://api.fragrantica.com/search?q=${perfumeName}`);
    
    return null;
  } catch (error) {
    console.error('Error searching perfume:', error);
    return null;
  }
}

/**
 * Fetch perfume data using OpenAI or similar AI API
 * جلب بيانات العطر باستخدام الذكاء الاصطناعي
 * 
 * ملاحظة: يحتاج إلى API Key من OpenAI
 */
export async function fetchPerfumeWithAI(perfumeName: string, apiKey?: string): Promise<PerfumeData | null> {
  try {
    if (!apiKey) {
      console.warn('No API key provided for AI fetch');
      return null;
    }

    // Example using OpenAI API
    // const response = await fetch('https://api.openai.com/v1/chat/completions', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${apiKey}`,
    //   },
    //   body: JSON.stringify({
    //     model: 'gpt-4',
    //     messages: [
    //       {
    //         role: 'system',
    //         content: 'You are a perfume expert. Provide detailed information about perfumes in JSON format.'
    //       },
    //       {
    //         role: 'user',
    //         content: `Provide detailed information about the perfume "${perfumeName}" including: brand, gender, concentration, fragrance family, top notes, middle notes, base notes, scent profile, suitable seasons, occasions, longevity, and sillage. Return as JSON.`
    //       }
    //     ],
    //     temperature: 0.7,
    //   }),
    // });

    // const data = await response.json();
    // return JSON.parse(data.choices[0].message.content);
    
    return null;
  } catch (error) {
    console.error('Error fetching perfume with AI:', error);
    return null;
  }
}

/**
 * Translate fragrance notes to Arabic
 * ترجمة نوتات العطر إلى العربية
 */
export const fragranceNotesTranslation: Record<string, string> = {
  // Citrus
  'bergamot': 'برغموت',
  'lemon': 'ليمون',
  'lime': 'ليم',
  'orange': 'برتقال',
  'mandarin': 'ماندرين',
  'grapefruit': 'جريب فروت',
  
  // Floral
  'rose': 'ورد',
  'jasmine': 'ياسمين',
  'lavender': 'لافندر',
  'ylang-ylang': 'يلانغ يلانغ',
  'lily': 'زنبق',
  'violet': 'بنفسج',
  'iris': 'سوسن',
  'geranium': 'جيرانيوم',
  'orchid': 'أوركيد',
  
  // Spicy
  'pepper': 'فلفل',
  'pink pepper': 'فلفل وردي',
  'cardamom': 'هيل',
  'cinnamon': 'قرفة',
  'nutmeg': 'جوزة الطيب',
  'ginger': 'زنجبيل',
  'clove': 'قرنفل',
  
  // Woody
  'cedar': 'أرز',
  'sandalwood': 'خشب الصندل',
  'vetiver': 'فيتيفر',
  'patchouli': 'باتشولي',
  'oak moss': 'طحلب السنديان',
  'birch': 'خشب البتولا',
  
  // Sweet
  'vanilla': 'فانيليا',
  'tonka bean': 'تونكا',
  'caramel': 'كراميل',
  'honey': 'عسل',
  'chocolate': 'شوكولاتة',
  
  // Musky/Amber
  'musk': 'مسك',
  'white musk': 'مسك أبيض',
  'amber': 'عنبر',
  'ambergris': 'عنبر',
  'ambroxan': 'أمبروكسان',
  
  // Fruity
  'apple': 'تفاح',
  'pear': 'كمثرى',
  'peach': 'خوخ',
  'pineapple': 'أناناس',
  'black currant': 'كشمش أسود',
  'strawberry': 'فراولة',
  
  // Aromatic
  'mint': 'نعناع',
  'basil': 'ريحان',
  'sage': 'مريمية',
  'thyme': 'زعتر',
  
  // Oriental
  'incense': 'بخور',
  'oud': 'عود',
  'labdanum': 'لابدانوم',
  'myrrh': 'مر',
  'frankincense': 'لبان',
};

/**
 * Translate note to Arabic
 * ترجمة النوتة إلى العربية
 */
export function translateNote(note: string): string {
  const normalized = note.toLowerCase().trim();
  return fragranceNotesTranslation[normalized] || note;
}

/**
 * Get all available perfume names for autocomplete
 * الحصول على جميع أسماء العطور المتاحة للإكمال التلقائي
 */
export function getPerfumeNames(): string[] {
  return Object.values(MOCK_PERFUME_DATABASE).map(p => `${p.brand} ${p.name}`);
}

/**
 * Enrich product data with perfume information
 * إثراء بيانات المنتج بمعلومات العطر
 */
export async function enrichProductWithPerfumeData(
  productName: string,
  brandName?: string
): Promise<Partial<PerfumeData> | null> {
  const searchQuery = brandName ? `${brandName} ${productName}` : productName;
  const perfumeData = await searchPerfume(searchQuery);
  
  if (perfumeData) {
    return {
      ...perfumeData,
      // Translate notes if not already translated
      topNotesAr: perfumeData.topNotes?.map(translateNote),
      middleNotesAr: perfumeData.middleNotes?.map(translateNote),
      baseNotesAr: perfumeData.baseNotes?.map(translateNote),
    };
  }
  
  return null;
}

