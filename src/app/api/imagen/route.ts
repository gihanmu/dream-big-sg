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
  selectedModel: z.enum(['detailed', 'face-match']).optional(),
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
        text: `Analyze this person's photo to help with image-to-image transformation into a Singapore superhero.

TRANSFORMATION TARGET:
- Career: ${career} superhero
- Location: ${location}, Singapore
- Mission: ${activity}

ANALYSIS NEEDED:
1. **Current Appearance**: Describe their key features that should be preserved (face shape, eye color, hair texture, skin tone, distinctive features)

2. **Transformation Vision**: How to transform them while keeping their identity:
   - What ${career} superhero costume would suit them?
   - How should they pose while ${activity}?
   - What superpowers match both the career and their appearance?

3. **Scene Description**: Describe the ideal transformation scene:
   - Them in ${career} superhero costume at ${location}
   - Performing ${activity} with heroic pose
   - Singapore landmarks of ${location} in background
   - Professional poster composition

FORMAT: "Transform this person into a ${career} superhero in ${location}. [Detailed transformation description focusing on costume, pose, setting, and action while preserving their identity]."

Focus on TRANSFORMATION rather than creation - we want to change the scene while keeping the person's identity intact.`
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
    
    // Determine which model to use based on user selection
    const selectedModel = validatedData.selectedModel || 'detailed';
    
    // Debug logging for environment variables
    console.log('🔍 [Debug] Environment IMAGEN_MODEL_ID:', process.env.IMAGEN_MODEL_ID);
    console.log('🔍 [Debug] Environment IMAGEN_MODEL_ID_3:', process.env.IMAGEN_MODEL_ID_3);
    console.log('🔍 [Debug] User selectedModel from request:', validatedData.selectedModel);
    console.log('🔍 [Debug] Final selectedModel (with fallback):', selectedModel);
    console.log('🔍 [Debug] typeof selectedModel:', typeof selectedModel);
    
    // More robust model ID selection with explicit fallbacks
    let modelId: string;
    if (selectedModel === 'detailed') {
      modelId = process.env.IMAGEN_MODEL_ID || 'imagen-4.0-ultra-generate-001';
      console.log('✅ [Model Selection] DETAILED model chosen');
    } else {
      modelId = process.env.IMAGEN_MODEL_ID_3 || 'imagen-3.0-capability-001';
      console.log('✅ [Model Selection] FACE-MATCH model chosen');
    }
    
    console.log('🎯 [Model] Selected:', selectedModel);
    console.log('🎯 [Model] Using:', modelId);
    console.log('🎯 [Model] Logic check - selectedModel === "detailed":', selectedModel === 'detailed');
   
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

      // STEP 1: Analyze photo for image-to-image transformation with Gemini
      
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
        
        console.log('🦸 [Step 1] Photo analysis for transformation completed successfully');
      } catch (geminiError) {
        console.error('❌ [Step 1] Gemini photo analysis failed:', geminiError);
        superheroDescription = `Transform this person into a ${validatedData.career || 'superhero'} superhero performing ${validatedData.activity || 'heroic duties'} in ${validatedData.background || 'Singapore'}. They wear a colorful costume and strike a heroic pose while preserving their identity.`;
      }
      
      // STEP 2: Create transformation prompt for image-to-image generation
      
      const careerType = validatedData.career || 'superhero';
      const locationName = validatedData.background || 'Singapore';
      const missionActivity = validatedData.activity || 'saving the day';
      
      // For image-to-image generation, use transformation-focused prompt
      const enhancedPrompt = `${superheroDescription}

TRANSFORMATION INSTRUCTIONS:
- Transform the person in the reference image into a ${careerType} superhero
- Keep their facial features, identity, and recognizable characteristics intact
- Change their clothing to ${careerType} superhero costume with cape and heroic styling
- Place them in ${locationName}, Singapore with iconic landmarks visible
- Show them performing: ${missionActivity}
- Dynamic superhero action pose with confidence and power

SETTING: ${locationName}, Singapore
- Include recognizable landmarks and architecture of ${locationName}
- Singapore cultural elements and modern cityscape
- Professional poster composition with cinematic lighting

COSTUME DESIGN:
- ${careerType}-themed superhero outfit with professional elements
- Bright, colorful, heroic styling appropriate for career
- Cape, emblem, and superhero accessories
- Kid-friendly and inspiring design

VISUAL STYLE:
- Ultra-high resolution superhero movie poster aesthetic
- Vibrant colors with dramatic lighting
- Professional photography quality
- NO text, captions, or watermarks anywhere in image

PRESERVE: Person's face, identity, and key physical characteristics from reference image
TRANSFORM: Clothing, setting, pose, and background into superhero poster scene`;
      
      // Use the enhanced prompt directly
      const finalPrompt = enhancedPrompt;
      console.log('====================================');
      console.log('🦸 [Final Prompt]:', finalPrompt);
      console.log('====================================');
      
      
      // STEP 3: Prepare request for Imagen API based on selected model
      
      const base64 = base64Match[2];
      let requestPayload;
      
      console.log('🔍 [Debug] Request payload logic - selectedModel:', selectedModel);
      console.log('🔍 [Debug] About to check: selectedModel === "face-match":', selectedModel === 'face-match');
      
      if (selectedModel === 'face-match') {
        console.log('✅ [Debug] Taking FACE-MATCH path (reference image)');
        // Use imagen-3.0-capability-001 with reference image payload for image-to-image generation
        requestPayload = {
          instances: [
            {
              prompt: finalPrompt,
              referenceImages: [
                {
                  referenceType: "REFERENCE_TYPE_SUBJECT",
                  referenceId: 1,
                  referenceImage: {
                    bytesBase64Encoded: base64
                  },
                  subjectImageConfig: {
                    subjectType: "SUBJECT_TYPE_PERSON",
                    subjectDescription: "person to transform into superhero"
                  }
                }
              ]
            }
          ],
          parameters: {
            sampleCount: 1,
            aspectRatio: validatedData.aspect.replace(':', ':'),
            safetyFilterLevel: "block_few",
            personGeneration: "ALLOW_ALL",
            outputDimension: {
              widthPixels: 4096,
              heightPixels: 4096
            }
          }
        };
      } else {
        console.log('✅ [Debug] Taking DETAILED path (text-only)');
        // Use imagen-4.0-ultra-generate-001 with text-only payload for detailed generation
        requestPayload = {
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
      }

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
          modelType: selectedModel,
          selectedModel: selectedModel,
          prompt: finalPrompt.substring(0, 300) + (finalPrompt.length > 300 ? '...' : ''),
          superheroDescription: superheroDescription.substring(0, 200) + (superheroDescription.length > 200 ? '...' : ''),
          timestamp: new Date().toISOString(),
          hasUploadedPhoto: !!validatedData.selfieDataUrl,
          avatarUsed: validatedData.avatarSelection || null,
          aspectRatio: validatedData.aspect,
          apiProvider: selectedModel === 'face-match' 
            ? 'Google Vertex AI Imagen 3 + Gemini Vision' 
            : 'Google Vertex AI Imagen 4 + Gemini Vision',
          mimeType,
          generationType: selectedModel === 'face-match' 
            ? 'image-to-image-superhero-transformation'
            : 'text-to-image-superhero-creation',
          modelVersion: selectedModel === 'face-match' 
            ? 'imagen-3-with-reference-image'
            : 'imagen-4-text-generation',
          requiresClientOverlay: false,
          approach: selectedModel === 'face-match'
            ? 'gemini-analysis -> imagen-3-reference-image-transformation'
            : 'gemini-analysis -> imagen-4-text-to-image-generation'
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