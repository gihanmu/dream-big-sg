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

// Function to generate superhero transformation description with Gemini
async function generateSuperheroDescription(
  imageBase64: string, 
  imageMimeType: string, 
  apiKey: string, 
  career: string,
  location: string,
  activity: string
): Promise<string> {
  
  try {
    console.log('🦸 [Gemini Vision] Creating superhero transformation...');
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const parts = [
      {
        text: `Create a detailed superhero poster description by analyzing this photo and transforming the person into a Singapore superhero.

SUPERHERO MISSION:
- Career: ${career}
- Location: ${location} 
- Activity/Mission: ${activity}

TRANSFORMATION REQUIREMENTS:
1. **Person Analysis**: Describe their current appearance (facial features, hair, skin tone, build, age estimate)

2. **Superhero Identity**: Transform them into a "${career}" superhero who ${activity} in ${location}, Singapore
   - Keep their facial features recognizable 
   - Design a superhero costume related to their career (${career})
   - Add appropriate superpowers that match their mission
   - Make them look heroic and inspiring

3. **Singapore Setting**: Place them in ${location} with recognizable Singapore landmarks
   - Show iconic architecture or features of ${location}
   - Include Singapore cultural elements
   - Make it clearly set in Singapore

4. **Poster Composition**: 
   - Dynamic action pose showing them performing: ${activity}
   - Bright, colorful, inspiring superhero aesthetic
   - Cinematic lighting and composition
   - Professional poster quality

FORMAT YOUR RESPONSE AS:
"A superhero poster showing [person description] transformed into [superhero identity] in [Singapore location setting]. [Detailed scene description with costume, pose, powers, background, and action]."

Focus on creating a vivid, detailed description that Imagen can use to generate an amazing superhero poster!`
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
    
    console.log('✅ [Gemini Vision] Superhero transformation complete');
    console.log('🦸 [Gemini Vision] Generated description length:', description.length);
    
    return description.trim();
  } catch (error) {
    console.error('❌ [Gemini Vision] Superhero transformation failed:', error);
    // Return a fallback superhero description
    return `A superhero poster showing a person transformed into a ${career} superhero performing ${activity} in ${location}, Singapore. They wear a colorful costume and strike a heroic pose against the backdrop of Singapore's skyline.`;
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

      // STEP 1: Generate superhero transformation description with Gemini
      
      let superheroDescription: string;
      try {
        superheroDescription = await generateSuperheroDescription(
          base64Match[2], 
          `image/${base64Match[1]}`, 
          geminiApiKey,
          validatedData.career || 'superhero',
          validatedData.background || 'Singapore',
          validatedData.activity || 'saving the day'
        );
        
        console.log('🦸 [Step 1] Superhero description generated successfully');
      } catch (geminiError) {
        console.error('❌ [Step 1] Gemini superhero transformation failed:', geminiError);
        superheroDescription = `A superhero poster showing a person transformed into a ${validatedData.career || 'superhero'} superhero performing ${validatedData.activity || 'heroic duties'} in ${validatedData.background || 'Singapore'}. They wear a colorful costume and strike a heroic pose.`;
      }
      
      // STEP 2: Create enhanced prompt with explicit career, location, and activity details
      
      const careerType = validatedData.career || 'superhero';
      const locationName = validatedData.background || 'Singapore';
      const missionActivity = validatedData.activity || 'saving the day';
      
      const enhancedPrompt = `SUPERHERO IDENTITY: ${careerType} superhero
LOCATION: ${locationName}, Singapore
MISSION: ${missionActivity}

${superheroDescription}

CRITICAL REQUIREMENTS:
- Show them as a ${careerType} with career-appropriate costume, equipment, and superpowers
- Set prominently in ${locationName} with recognizable Singapore landmarks and architecture
- Dynamic action scene showing them ${missionActivity}
- Professional ${careerType} elements integrated into superhero design
- Singapore cultural elements and iconic ${locationName} features clearly visible

VISUAL REQUIREMENTS:
- Ultra-high resolution, cinematic quality
- Vibrant, inspiring superhero poster aesthetic  
- Sharp professional photography suitable for large format printing
- Bright, colorful, and kid-friendly superhero movie style
- Dynamic composition with dramatic lighting
- ${locationName} landmarks prominently featured in background
- Professional ${careerType} equipment and styling elements
- Action pose demonstrating: ${missionActivity}
- NO text, captions, watermarks, or written elements anywhere in the image

STYLE: Inspirational superhero movie poster featuring a ${careerType} superhero in ${locationName}, Singapore.`;
      
      // Use the enhanced prompt directly
      const finalPrompt = enhancedPrompt;
      console.log('====================================');
      console.log('🦸 [Final Prompt]:', finalPrompt);
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
          superheroDescription: superheroDescription.substring(0, 200) + (superheroDescription.length > 200 ? '...' : ''),
          timestamp: new Date().toISOString(),
          hasUploadedPhoto: !!validatedData.selfieDataUrl,
          avatarUsed: validatedData.avatarSelection || null,
          aspectRatio: validatedData.aspect,
          apiProvider: 'Google Vertex AI Imagen 4 + Gemini Vision',
          mimeType,
          generationType: 'superhero-transformation',
          modelVersion: 'imagen-4-with-gemini-vision',
          requiresClientOverlay: false,
          approach: 'gemini-superhero-transformation -> imagen-poster-generation'
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