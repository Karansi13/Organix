import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function GET(req: NextRequest) {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    
    console.log('Testing Gemini API with key:', process.env.GEMINI_API_KEY ? 'Key present' : 'No key found');
    
    // Try to list available models
    try {
      const models = await genAI.listModels();
      const modelNames = models.map(model => ({
        name: model.name,
        displayName: model.displayName,
        supportedGenerationMethods: model.supportedGenerationMethods
      }));
      
      return NextResponse.json({
        success: true,
        availableModels: modelNames,
        message: 'Successfully connected to Gemini API'
      });
    } catch (listError) {
      console.error('Error listing models:', listError);
      
      // Try a simple generation with different model names
      const testModels = [
        'gemini-1.5-flash',
        'gemini-1.5-pro', 
        'gemini-pro',
        'models/gemini-1.5-flash',
        'models/gemini-1.5-pro',
        'models/gemini-pro'
      ];
      
      const results = [];
      
      for (const modelName of testModels) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent('Say hello');
          const response = await result.response;
          results.push({
            model: modelName,
            success: true,
            response: response.text()
          });
          break; // If successful, we can stop testing
        } catch (error: any) {
          results.push({
            model: modelName,
            success: false,
            error: error.message
          });
        }
      }
      
      return NextResponse.json({
        success: false,
        listModelsError: listError.message,
        testResults: results,
        message: 'Could not list models, but tested individual models'
      });
    }
    
  } catch (error: any) {
    console.error('Gemini API test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        apiKeyPresent: !!process.env.GEMINI_API_KEY
      }, 
      { status: 500 }
    );
  }
}
