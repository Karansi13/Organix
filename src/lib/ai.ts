import { GoogleGenerativeAI } from '@google/generative-ai';
import { Todo, AISuggestion } from '@/types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Try different model names in order of preference
const AVAILABLE_MODELS = [
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'models/gemini-1.5-flash',
  'models/gemini-1.5-pro',
  'gemini-pro',
  'models/gemini-pro'
];

export class AIService {
  static async getWorkingModel() {
    for (const modelName of AVAILABLE_MODELS) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        // Test with a simple prompt
        await model.generateContent('Test');
        return model;
      } catch (error) {
        console.warn(`Model ${modelName} not available, trying next...`);
        continue;
      }
    }
    throw new Error('No Gemini models are available with your API key');
  }

  static async parseNaturalLanguageTodo(input: string): Promise<Partial<Todo>> {
    // Fallback parsing if AI fails
    const fallbackTodo = {
      title: input.length > 50 ? input.substring(0, 50) + '...' : input,
      description: input,
      priority: 'medium' as const,
      tags: []
    };

    try {
      if (!process.env.GEMINI_API_KEY) {
        console.warn('No Gemini API key found, using fallback parsing');
        return fallbackTodo;
      }

      const model = await this.getWorkingModel();

      const prompt = `
        Parse the following natural language input into a structured todo item.
        Return ONLY a valid JSON object with title, description, dueDate (ISO string), priority (low/medium/high), and tags (array of strings).
        
        Input: "${input}"
        
        Rules:
        - ALWAYS include a title (required field)
        - Extract a clear, concise title from the input
        - Identify due dates from text like "by Friday", "tomorrow", "next week", etc.
        - Determine priority based on urgency words (urgent, ASAP, important, etc.)
        - Extract relevant tags based on context
        - If no due date is mentioned, omit the dueDate field
        - If input is unclear, use the input text as the title
        
        Example output:
        {
          "title": "Buy groceries",
          "description": "Buy groceries for the week including fruits and vegetables",
          "priority": "medium",
          "tags": ["shopping", "weekly"]
        }
        
        Return only the JSON object, no other text:
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();
      
      // Clean up the response to extract JSON
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        // Ensure title is always provided
        if (!parsed.title) {
          parsed.title = input.length > 50 ? input.substring(0, 50) + '...' : input;
        }
        return parsed;
      }
      
      // If no JSON found, return fallback
      console.warn('No JSON found in AI response, using fallback');
      return fallbackTodo;
    } catch (error) {
      console.error('AI parsing error:', error);
      // Always return fallback with title to prevent validation errors
      return fallbackTodo;
    }
  }

  static async generateTaskSuggestions(
    userId: string,
    recentTodos: Todo[]
  ): Promise<AISuggestion[]> {
    try {
      // If no recent todos, return empty suggestions
      if (recentTodos.length === 0) {
        return [];
      }

      const model = await this.getWorkingModel();

      const todoContext = recentTodos
        .map(todo => `${todo.title} - ${todo.status} - Priority: ${todo.priority}`)
        .join('\n');

      const prompt = `
        Based on the user's recent todo items, suggest 3-5 new tasks that would be helpful.
        Consider patterns, incomplete items, and logical follow-ups.
        
        Recent todos:
        ${todoContext}
        
        Return ONLY a valid JSON array with this exact format:
        [
          {
            "type": "task",
            "title": "Suggested task title",
            "description": "Why this task is suggested",
            "confidence": 0.8,
            "metadata": { "suggestedPriority": "medium", "suggestedTags": ["work"] }
          }
        ]
        
        Return only the JSON array, no other text:
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();
      
      // Clean up the response to extract JSON
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return [];
    } catch (error) {
      console.error('AI suggestion error:', error);
      return [];
    }
  }

  static async predictPriority(title: string, description?: string): Promise<'low' | 'medium' | 'high'> {
    try {
      const combinedText = `${title} ${description || ''}`.toLowerCase();
      
      // Simple keyword-based priority prediction
      const highPriorityKeywords = ['urgent', 'asap', 'critical', 'important', 'deadline', 'emergency'];
      const lowPriorityKeywords = ['someday', 'maybe', 'nice to have', 'optional', 'when possible'];
      
      if (highPriorityKeywords.some(keyword => combinedText.includes(keyword))) {
        return 'high';
      }
      
      if (lowPriorityKeywords.some(keyword => combinedText.includes(keyword))) {
        return 'low';
      }

      // Use Gemini for more nuanced prediction
      try {
        const model = await this.getWorkingModel();
        
        const prompt = `
          Analyze this task and determine its priority level (low, medium, high):
          Title: ${title}
          Description: ${description || 'No description'}
          
          Consider factors like urgency, importance, deadlines, and impact.
          Respond with only one word: low, medium, or high
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const aiResponse = response.text().trim().toLowerCase();
        
        if (['low', 'medium', 'high'].includes(aiResponse)) {
          return aiResponse as 'low' | 'medium' | 'high';
        }
      } catch (aiError) {
        console.warn('AI priority prediction failed, using fallback');
      }
      
      return 'medium';
    } catch (error) {
      console.error('AI priority prediction error:', error);
      return 'medium';
    }
  }

  static async generateSummary(todos: Todo[], period: 'daily' | 'weekly'): Promise<string> {
    try {
      // If no todos, return a simple message
      if (todos.length === 0) {
        return `No tasks found for your ${period} summary. Start by creating some tasks to track your productivity!`;
      }

      const model = await this.getWorkingModel();
      
      const completed = todos.filter(t => t.status === 'completed');
      const pending = todos.filter(t => t.status !== 'completed');
      
      const prompt = `
        Generate a ${period} summary of productivity based on these tasks:
        
        Completed (${completed.length}):
        ${completed.map(t => `- ${t.title}`).join('\n')}
        
        Pending (${pending.length}):
        ${pending.map(t => `- ${t.title} (${t.priority} priority)`).join('\n')}
        
        Create a motivational summary highlighting achievements and suggesting focus areas.
        Keep it concise and encouraging (2-3 paragraphs max).
        Do not use markdown formatting.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text() || 'No summary available.';
    } catch (error) {
      console.error('AI summary error:', error);
      return 'Unable to generate summary at this time. Please check your Gemini API key configuration.';
    }
  }

  // Test method to check API connectivity
  static async testConnection(): Promise<{ success: boolean; message: string; model?: string }> {
    try {
      const model = await this.getWorkingModel();
      const result = await model.generateContent('Say "Hello, Gemini API is working!"');
      const response = await result.response;
      
      return {
        success: true,
        message: response.text(),
        model: model.model
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Unknown error occurred'
      };
    }
  }
}
