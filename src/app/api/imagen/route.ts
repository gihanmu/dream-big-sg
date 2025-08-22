import { NextRequest, NextResponse } from 'next/server';
import { VertexAI } from '@google-cloud/vertexai';
import { GoogleAuth } from 'google-auth-library';
import { z } from 'zod';
import { generateImagenPrompt } from '@/lib/prompts';
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
});

type GenerateRequest = z.infer<typeof generateRequestSchema>;

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
    console.log('📥 [Imagen API] Request body:', JSON.stringify(body, null, 2));
    
    const validatedData = generateRequestSchema.parse(body);
    console.log('✅ [Imagen API] Request validation passed');

    // Sanitize text inputs
    const sanitizedPrompt = sanitizeText(validatedData.prompt);
    const sanitizedBgHint = validatedData.bgHint ? sanitizeText(validatedData.bgHint) : undefined;
    
    console.log('🔧 [Imagen API] Sanitized prompt:', sanitizedPrompt);
    console.log('🔧 [Imagen API] Background hint:', sanitizedBgHint);
    console.log('👤 [Imagen API] Has selfie data:', !!validatedData.selfieDataUrl);
    console.log('👤 [Imagen API] Avatar selection:', body.avatarSelection || 'None');

    // Check for required environment variables
    const projectId = process.env.GOOGLE_PROJECT_ID;
    const location = process.env.GOOGLE_LOCATION || 'us-central1';
    
    // Use edit model for photos, generate model for text-only
    const modelId = process.env.IMAGEN_MODEL_ID || 'imagen-4.0-ultra-generate-001'
   

    if (!projectId) {
      return NextResponse.json(
        { error: 'Missing Google Cloud project configuration' },
        { status: 500 }
      );
    }

    // Initialize Vertex AI
    const vertexAI = new VertexAI({
      project: projectId,
      location: location,
    });

    const generativeModel = vertexAI.getGenerativeModel({
      model: modelId,
    });

    // Prepare the generation request with multimodal support
    interface ContentPart {
      text?: string;
      inlineData?: {
        mimeType: string;
        data: string;
      };
    }
    
    const parts: ContentPart[] = [
      {
        text: sanitizedPrompt
      }
    ];

    // Add image data if selfie is provided
    if (validatedData.selfieDataUrl) {
      // Extract base64 data from data URL (remove the data:image/...;base64, prefix)
      const base64Match = validatedData.selfieDataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
      if (base64Match && base64Match[2]) {
        console.log('🖼️ [Imagen API] Adding image to request (multimodal)');
        parts.push({
          inlineData: {
            mimeType: `image/${base64Match[1]}`, // jpeg, png, etc.
            data: base64Match[2] // base64 string without prefix
          }
        });
      } else {
        console.warn('⚠️ [Imagen API] Invalid image data format');
      }
    }

    const generationRequest = {
      contents: [{
        role: 'user',
        parts: parts
      }],
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.7,
        topP: 0.8,
      },
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
      ],
    };

    // IMPORTANT: The generation request now includes multimodal support
    // When selfieDataUrl is provided, the image data is included in the request
    // This allows the AI model to use the actual child's photo as reference
    
    // REAL IMAGEN API IMPLEMENTATION
    console.log('⏳ [Imagen API] Calling Google Vertex AI Imagen API...');
    
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
      
      console.log('🔗 [Imagen API] Endpoint:', endpoint);
      console.log('🎯 [Imagen API] Model ID:', modelId);

      // Prepare the request payload for Imagen API
      const requestPayload: {
        instances: Array<{
          prompt: string;
          image?: {
            bytesBase64Encoded: string;
          };
        }>;
        parameters: {
          sampleCount: number;
          aspectRatio: string;
          safetyFilterLevel: string;
        };
      } = {
        instances: [
          {
            prompt: sanitizedPrompt
          }
        ],
        parameters: {
          sampleCount: 1,
          aspectRatio: validatedData.aspect.replace(':', ':'), // Ensure proper format
          safetyFilterLevel: "block_few", // Standard safety level for professional content
        }
      };

      // Structure request differently for editing vs generation
      if (validatedData.selfieDataUrl) {
        const base64Match = validatedData.selfieDataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
        if (base64Match && base64Match[2]) {
          console.log('🎨 [Imagen API] Using image editing model for photo transformation');
          // For image editing, image is the primary input
          requestPayload.instances[0] = {
            prompt: sanitizedPrompt,
            image: {
              bytesBase64Encoded: base64Match[2]
            }
          };
        } else {
          console.warn('⚠️ [Imagen API] Invalid image data format, falling back to generation');
        }
      } else {
        console.log('🖼️ [Imagen API] Using text-to-image generation (no photo provided)');
      }

      console.log('📤 [Imagen API] Request payload prepared');

      // Make the API call to Imagen
      const apiResponse = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload)
      });

      if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        console.error('❌ [Imagen API] HTTP error:', apiResponse.status, apiResponse.statusText);
        console.error('❌ [Imagen API] Error response:', errorText);
        
        throw new Error(`Imagen API error: ${apiResponse.status} ${apiResponse.statusText}\n${errorText}`);
      }

      const result = await apiResponse.json();
      console.log('✅ [Imagen API] API call successful');

      // Extract the generated image from the response
      if (!result.predictions || !result.predictions[0] || !result.predictions[0].bytesBase64Encoded) {
        throw new Error('Invalid response format from Imagen API');
      }

      const imageBase64 = result.predictions[0].bytesBase64Encoded;
      const mimeType = result.predictions[0].mimeType || 'image/png';
      
      console.log('🖼️ [Imagen API] Image generated successfully');
      console.log('📊 [Imagen API] Image size (base64):', imageBase64.length, 'characters');

      const response = {
        success: true,
        imageUrl: `data:${mimeType};base64,${imageBase64}`,
        metadata: {
          modelUsed: modelId,
          prompt: sanitizedPrompt,
          timestamp: new Date().toISOString(),
          hasUploadedPhoto: !!validatedData.selfieDataUrl,
          avatarUsed: validatedData.avatarSelection || null,
          aspectRatio: validatedData.aspect,
          apiProvider: 'Google Vertex AI Imagen',
          mimeType,
          generationType: validatedData.selfieDataUrl ? 'image-editing' : 'text-to-image',
          modelType: validatedData.selfieDataUrl ? 'imagen-edit' : 'imagen-generate',
          requiresClientOverlay: false // AI handles the integration now
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

      console.log('✨ [Imagen API] Image generation successful (fallback)');
      console.log('🖼️ [Imagen API] Generated image URL (first 100 chars):', response.imageUrl.substring(0, 100) + '...');
      console.log('📊 [Imagen API] Response metadata:', response.metadata);
      
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