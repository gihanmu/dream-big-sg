import { NextRequest, NextResponse } from 'next/server';
import { GoogleAuth } from 'google-auth-library';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import { imagenRateLimiter, sanitizeText, validateEnvironment } from '@/lib/security';

const generateRequestSchema = z.object({
  prompt: z.string(),
  seed: z.number().optional(),
  aspect: z.enum(['1:1', '4:3', '3:4', '16:9']).optional().default('4:3'),
  selfieDataUrl: z.string().optional(),
  avatarSelection: z.string().optional(),
  bgHint: z.string().optional(),
  career: z.string().optional(),
  background: z.string().optional(),
  activity: z.string().optional(),
  model: z.enum(['detailed']).optional().default('detailed'),
});

// Function to analyze image with Gemini and generate person description
async function analyzeImageWithGemini(imageBase64: string, imageMimeType: string, apiKey: string): Promise<string> {
  
  try {
    console.log('🔍 [Gemini Vision] Analyzing uploaded photo...');
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const parts = [
      {
        text: `Please analyze this young person's photo to help create their future adult professional visualization.
Focus on features that will persist into adulthood for accurate age progression.

CRITICAL - Determine current age:
- Specific age estimate (e.g., "approximately 8 years old", "around 25 years old")
- If child (5-12): note as "young child requiring 20+ year age progression"
- If teenager (13-17): note as "teenager requiring 10-15 year age progression"
- If young adult (18-24): note as "young adult requiring 5-10 year career progression"
- If adult (25-40): note as "adult requiring superhero transformation at current age"
- If mature adult (40+): note as "mature adult requiring expert mentor transformation"

Core facial features to preserve in adult version:
- Face shape and bone structure (will remain constant)
- Eye shape, spacing, and color
- Nose shape and proportions
- Ear shape and size relative to head
- Distinctive features (dimples, chin shape, eyebrow arch)
- Smile characteristics and mouth shape

Current appearance details:
- Current height/build estimation
- Hair color and texture (may change with age)
- Skin tone with specific description
- Any glasses or likely permanent accessories

Features that should mature in adult version:
- Face should elongate and mature appropriately
- Professional adult hairstyle evolution
- Adult body proportions and height
- Mature facial features while keeping identity

End with: "For age progression: transform from [current age] to professional adult (age 25-30)"`
      },
      {
        inlineData: {
          mimeType: imageMimeType,
          data: imageBase64
        }
      }
    ];

    const result = await model.generateContent(parts);
    const description = result.response.text();
    
    console.log('✅ [Gemini Vision] Analysis complete');
    console.log('👤 [Gemini Vision] Generated description length:', description.length);
    
    return description.trim();
  } catch (error) {
    console.error('❌ [Gemini Vision] Analysis failed:', error);
    // Return a generic description if analysis fails
    return "a person";
  }
}


export async function POST(request: NextRequest) {
  console.log('🎨 [Imagen API] Starting image generation request');
  
  try {
    // Validate environment
    const envValidation = validateEnvironment();
    if (!envValidation.isValid) {
      console.error('Environment validation failed:', envValidation.errors);
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Rate limiting
    const clientId = request.headers.get('x-forwarded-for') || 'anonymous';
    if (!imagenRateLimiter.isAllowed(clientId)) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded', 
          remainingAttempts: imagenRateLimiter.getRemainingAttempts(clientId)
        },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    
    const validatedData = generateRequestSchema.parse(body);
    console.log('✅ [Imagen API] Request validated for', {
      career: validatedData.career,
      background: validatedData.background,
      model: validatedData.model,
      hasImage: !!validatedData.selfieDataUrl
    });

    // Sanitize text inputs
    const sanitizedPrompt = sanitizeText(validatedData.prompt);
    const sanitizedBgHint = validatedData.bgHint ? sanitizeText(validatedData.bgHint) : undefined;

    // Check for required environment variables
    const projectId = process.env.GOOGLE_PROJECT_ID;
    const location = process.env.GOOGLE_LOCATION || 'us-central1';
    const geminiApiKey = process.env.GEMINI_API_KEY;
    
    // Use single model only
    const modelId = process.env.IMAGEN_MODEL_ID || 'imagen-4.0-ultra-generate-001';
    console.log('🎯 [Model] Using:', modelId);
   
    if (!projectId) {
      return NextResponse.json(
        { error: 'Missing Google Cloud project configuration' },
        { status: 500 }
      );
    }

    if (!geminiApiKey) {
      console.error('❌ [Config] Missing GOOGLE_API_KEY environment variable');
      return NextResponse.json(
        { error: 'Missing Google API key for Gemini analysis. Please check server configuration.' },
        { status: 500 }
      );
    }




    
    // REAL IMAGEN API IMPLEMENTATION
    try {
      // Get Google Cloud credentials
      const credentials = process.env.GOOGLE_VERTEX_CREDENTIALS_JSON 
        ? JSON.parse(process.env.GOOGLE_VERTEX_CREDENTIALS_JSON)
        : null;

      if (!credentials && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        throw new Error('Google Cloud credentials not found');
      }

      // Get access token for authentication
      let accessToken: string;
      
      if (credentials) {
        // Use service account credentials to get access token
        const auth = new GoogleAuth({
          credentials,
          scopes: ['https://www.googleapis.com/auth/cloud-platform']
        });
        const authClient = await auth.getClient();
        const tokenResponse = await authClient.getAccessToken();
        accessToken = tokenResponse.token!;
      } else {
        // Use Application Default Credentials
        const auth = new GoogleAuth({
          scopes: ['https://www.googleapis.com/auth/cloud-platform']
        });
        const authClient = await auth.getClient();
        const tokenResponse = await authClient.getAccessToken();
        accessToken = tokenResponse.token!;
      }

      // Construct the Imagen API endpoint
      const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${modelId}:predict`;

      // Validate that photo is always provided
      if (!validatedData.selfieDataUrl) {
        return NextResponse.json(
          { error: 'Camera photo is required' },
          { status: 400 }
        );
      }

      // Extract base64 data from data URL
      const base64Match = validatedData.selfieDataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
      if (!base64Match || !base64Match[2]) {
        return NextResponse.json(
          { error: 'Invalid image data format' },
          { status: 400 }
        );
      }

      // STEP 1: Analyze image with Gemini to get person description
      
      let personDescription: string;
      try {
        personDescription = await analyzeImageWithGemini(
          base64Match[2], 
          `image/${base64Match[1]}`, 
          geminiApiKey
        );
        
        if (personDescription === "a person") {
          console.warn('⚠️ [Gemini Vision] Analysis returned generic fallback description');
        }
      } catch (geminiError) {
        console.error('❌ [Step 1] Gemini vision analysis failed:', geminiError);
        personDescription = "a person with a friendly appearance";
      }
      
      // STEP 2: Create enhanced prompt combining person description with context
      
      // Extract age information from person description for better prompting
      const descLower = personDescription.toLowerCase();
      const isChild = descLower.includes('young child');
      const isTeenager = descLower.includes('teenager');
      const isYoungAdult = descLower.includes('young adult') && descLower.includes('career progression');
      const isAdult = descLower.includes('adult requiring superhero transformation');
      const isMatureAdult = descLower.includes('mature adult') || descLower.includes('expert mentor');
      
      // Create age-appropriate progression messages
      let ageProgression, transformationType, timeContext;
      
      if (isChild) {
        ageProgression = "Show this young person grown up 20 years into the future as a successful adult professional (age 25-30). ";
        transformationType = "future adult self";
        timeContext = "in the year 2045";
      } else if (isTeenager) {
        ageProgression = "Show this teenager matured 10-15 years into the future as an established young professional (age 25-30). ";
        transformationType = "future professional self";
        timeContext = "in the year 2035";
      } else if (isYoungAdult) {
        ageProgression = "Transform this young adult into an experienced professional 5-10 years in the future (age 28-35), showing career advancement and expertise. ";
        transformationType = "experienced professional self";
        timeContext = "in the near future";
      } else if (isAdult) {
        ageProgression = "Transform this adult into a superhero version of themselves at their current age, with enhanced professional presence and heroic styling. ";
        transformationType = "superhero professional self";
        timeContext = "in present-day Singapore";
      } else if (isMatureAdult) {
        ageProgression = "Transform this distinguished professional into an expert mentor figure and superhero leader, showing wisdom and mastery in their field. ";
        transformationType = "master mentor self";
        timeContext = "at the peak of their career";
      } else {
        // Fallback for unclear age
        ageProgression = "Transform into a confident, successful professional version of themselves. ";
        transformationType = "best professional self";
        timeContext = "in their prime";
      }
      
      const enhancedPrompt = `${ageProgression}Create an inspiring poster showing ${personDescription}
transformed into their ${transformationType} as a successful ${validatedData.career || "professional"} performing ${validatedData.activity || "professional duties with confidence"}.
Setting: ${sanitizedBgHint || "Singapore"} ${timeContext}.

CRITICAL INSTRUCTIONS:
${isChild || isTeenager ? 
`- Age the person appropriately to show them as a mature adult professional (25-30 years old)
- Show realistic adult development: mature facial structure, adult height and professional build` :
isYoungAdult ?
`- Show career progression: more experienced, confident, and established in their field
- Slightly mature their appearance while maintaining youthful energy` :
isAdult ?
`- Maintain current age but enhance with superhero transformation
- Show peak professional confidence and heroic presence` :
isMatureAdult ?
`- Show as distinguished expert and leader in their field
- Emphasize wisdom, experience, and mentorship qualities` :
`- Transform into their best professional self`}
- Preserve their core facial identity: maintain eye shape, nose structure, face shape, and distinctive features
- Professional attire and equipment appropriate for a ${validatedData.career || "professional"}
- Confident, successful, inspiring superhero-style pose showing achievement and capability
${isChild || isTeenager || isYoungAdult ? 
`- Futuristic elements showing advanced technology and modern setting` :
`- Contemporary professional setting with heroic enhancement`}

Visual style: ${isChild || isTeenager ? "Aspirational 'future vision'" : isAdult || isMatureAdult ? "Heroic professional transformation" : "Career advancement"} poster. 
Cinematic quality with vibrant colors. The person should be recognizable but ${isChild || isTeenager ? "professionally mature" : "heroically enhanced"}.
Ultra-high resolution, sharp professional photography, suitable for large format printing.
NO text, captions, watermarks, or written elements anywhere in the image.`;
      
      // Validate prompt length (Imagen has limits)
      const MAX_PROMPT_LENGTH = 2000;
      // if (enhancedPrompt.length > MAX_PROMPT_LENGTH) {
      //   console.warn(`⚠️ Prompt too long (${enhancedPrompt.length} chars), truncating to ${MAX_PROMPT_LENGTH}`);
      // }
      // console.log('🔍 [Step 2]  length of prompt:', enhancedPrompt.length);
      // const finalPrompt = enhancedPrompt.length > MAX_PROMPT_LENGTH 
      //   ? enhancedPrompt.substring(0, MAX_PROMPT_LENGTH - 3) + '...'
      //   : enhancedPrompt;
      const finalPrompt = enhancedPrompt;
      console.log('====================================');
      console.log('Prompt:', finalPrompt);
      console.log('====================================');
      
      
      // STEP 3: Prepare request for Imagen API with text-only format
      
      // Always use imagen-4.0-ultra-generate-001 with text-only payload
      const requestPayload = {
        instances: [
          {
            prompt: finalPrompt
          }
        ],
        parameters: {
          sampleCount: 1,
          aspectRatio: validatedData.aspect.replace(':', ':'),
          safetyFilterLevel: "block_few",
          outputDimension: {
            widthPixels: 4096,
            heightPixels: 4096
          }
        }
      };

      // STEP 4: Make the API call to Imagen
      console.log('🚀 [Imagen API] Calling model:', modelId);
      
      let apiResponse: Response;
      try {
        apiResponse = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestPayload)
        });
      } catch (fetchError) {
        console.error('❌ [Step 4] Network error calling Imagen API:', fetchError);
        throw new Error(`Network error: Unable to reach Imagen API. Please try again.`);
      }

      if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        console.error('❌ [Step 4] Imagen API HTTP error:', apiResponse.status, apiResponse.statusText);
        console.error('❌ [Step 4] Error response:', errorText);
        
        // Provide more specific error messages based on status code
        let errorMessage = `Imagen API error: ${apiResponse.status}`;
        if (apiResponse.status === 400) {
          errorMessage = 'Bad request to Imagen API. The prompt or parameters may be invalid.';
        } else if (apiResponse.status === 401) {
          errorMessage = 'Authentication error with Imagen API. Please check credentials.';
        } else if (apiResponse.status === 403) {
          errorMessage = 'Permission denied by Imagen API. Check your quota and permissions.';
        } else if (apiResponse.status === 429) {
          errorMessage = 'Rate limit exceeded. Please try again in a few moments.';
        } else if (apiResponse.status >= 500) {
          errorMessage = 'Imagen API server error. Please try again later.';
        }
        
        throw new Error(errorMessage);
      }

      const result = await apiResponse.json();
      console.log('✅ [Imagen API] API call successful');

      // Extract the generated image from the response
      if (!result.predictions || !result.predictions[0] || !result.predictions[0].bytesBase64Encoded) {
        throw new Error('Invalid response format from Imagen API');
      }

      const imageBase64 = result.predictions[0].bytesBase64Encoded;
      const mimeType = result.predictions[0].mimeType || 'image/png';
      
      console.log('✅ [Imagen API] Image generated successfully');

      const response = {
        success: true,
        imageUrl: `data:${mimeType};base64,${imageBase64}`,
        metadata: {
          modelUsed: modelId,
          modelType: 'detailed',
          prompt: finalPrompt.substring(0, 300) + (finalPrompt.length > 300 ? '...' : ''),
          personDescription: personDescription.substring(0, 200) + (personDescription.length > 200 ? '...' : ''),
          timestamp: new Date().toISOString(),
          hasUploadedPhoto: !!validatedData.selfieDataUrl,
          avatarUsed: validatedData.avatarSelection || null,
          aspectRatio: validatedData.aspect,
          apiProvider: 'Google Vertex AI Imagen 4 + Gemini Vision',
          mimeType,
          generationType: 'text-to-image-with-vision-analysis',
          modelVersion: 'imagen-4-with-gemini-vision',
          requiresClientOverlay: false,
          approach: 'two-step: gemini-vision-analysis -> imagen-text-to-image'
        }
      };

      return NextResponse.json(response);

    } catch (apiError) {
      console.error('❌ [Imagen API] Real API call failed:', apiError);
      
      // Fallback to placeholder if API fails (for demo purposes)
      console.log('🔄 [Imagen API] Falling back to placeholder...');
      
      // Determine the child avatar to display
      const childAvatar = validatedData.avatarSelection || (validatedData.selfieDataUrl ? '👦' : '🦸');
      
      // Map backgrounds to appropriate emojis
      const bgEmojis: Record<string, string> = {
        'gardens-by-the-bay': '🌳',
        'marina-bay-sands': '🏙️',
        'universal-studios': '🎢',
        'singapore-flyer': '🎡',
        'changi-airport': '✈️'
      };
      const bgEmoji = bgEmojis[validatedData.background || ''] || '🏙️';
      
      const response = {
        success: true,
        imageUrl: `data:image/svg+xml;base64,${Buffer.from(`
          <svg width="512" height="384" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#667EEA"/>
                <stop offset="50%" style="stop-color:#764BA2"/>
                <stop offset="100%" style="stop-color:#F093FB"/>
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <!-- Background -->
            <rect width="512" height="384" fill="url(#bg)"/>
            
            <!-- API Error Notice -->
            <text x="256" y="30" text-anchor="middle" fill="#FFE4B5" font-size="12" font-weight="bold" font-family="Arial">
              ⚠️ API Error - Showing Placeholder
            </text>
            
            <!-- Title -->
            <text x="256" y="60" text-anchor="middle" fill="white" font-size="24" font-weight="bold" font-family="Arial" filter="url(#glow)">
              Singapore Superhero Adventure!
            </text>
            
            <!-- Background Location Icon -->
            <text x="256" y="120" text-anchor="middle" font-size="64" opacity="0.3">
              ${bgEmoji}
            </text>
            
            <!-- Child Avatar (Main Character) -->
            <text x="256" y="200" text-anchor="middle" font-size="80" filter="url(#glow)">
              ${childAvatar}
            </text>
            
            <!-- Career Badge -->
            <rect x="206" y="230" width="100" height="30" rx="15" fill="rgba(255,255,255,0.9)"/>
            <text x="256" y="250" text-anchor="middle" fill="#4F46E5" font-size="14" font-weight="bold" font-family="Arial">
              ${validatedData.career || 'Hero'}
            </text>
            
            <!-- Location Label -->
            <text x="256" y="290" text-anchor="middle" fill="white" font-size="16" font-family="Arial">
              📍 ${validatedData.background || 'Singapore'}
            </text>
            
            <!-- Activity Description -->
            <text x="256" y="320" text-anchor="middle" fill="white" font-size="12" font-family="Arial" opacity="0.9">
              "${(validatedData.activity || 'Saving the day').substring(0, 50)}"
            </text>
            
            <!-- Partner Logos -->
            <text x="80" y="365" fill="white" font-size="10" font-family="Arial" opacity="0.7">
              Google Cloud
            </text>
            <text x="432" y="365" fill="white" font-size="10" font-family="Arial" opacity="0.7">
              NCS
            </text>
            
            <!-- Date -->
            <text x="256" y="365" text-anchor="middle" fill="white" font-size="8" font-family="Arial" opacity="0.5">
              ${new Date().toLocaleDateString()}
            </text>
          </svg>
        `).toString('base64')}`,
        metadata: {
          modelUsed: modelId,
          prompt: sanitizedPrompt,
          timestamp: new Date().toISOString(),
          hasChildImage: !!validatedData.selfieDataUrl,
          avatarUsed: validatedData.avatarSelection || null,
          fallback: true,
          apiError: apiError instanceof Error ? apiError.message : 'Unknown error'
        }
      };

      console.log('✅ [Imagen API] Fallback image generated');
      
      return NextResponse.json(response);
    }

  } catch (error) {
    console.error('❌ [Imagen API] Error generating image:', error);
    console.error('❌ [Imagen API] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate image', details: error },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    error: 'Method not allowed. Use POST to generate images.',
    supportedMethods: ['POST']
  }, { status: 405 });
}