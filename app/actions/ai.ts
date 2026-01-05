'use server';

import OpenAI from 'openai';
import { z } from 'zod';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Schema for a single AI-generated todo
const AiTodoSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  dueDate: z.string().optional(), // ISO date string
  priority: z.enum(['low', 'medium', 'high']).optional(),
});

// Schema for the AI response
const AiResponseSchema = z.object({
  categoryName: z.string().optional(),
  categoryColor: z.string().optional(),
  todos: z.array(AiTodoSchema),
});

export type AiGeneratedTodo = z.infer<typeof AiTodoSchema>;
export type AiGeneratedResponse = z.infer<typeof AiResponseSchema>;

export async function generateTodosWithAI(input: string) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return {
        success: false,
        error: 'OpenAI API key not configured',
      };
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a helpful assistant that breaks down projects, tasks, or bulk text into structured todo items.

Your task:
- Parse the user's input (could be a project description, a list of tasks, or scattered thoughts)
- Break it down into clear, actionable todo items
- Each todo should have a concise title (max 100 chars)
- Add helpful descriptions when needed to clarify the task
- Suggest a category name if the input seems to be a project
- Suggest a category color (hex format) that fits the project theme
- Only suggest due dates if they're explicitly mentioned or critical

Return a JSON object with this structure:
{
  "categoryName": "Optional category name if this is a project",
  "categoryColor": "Optional hex color like #FF6B6B",
  "todos": [
    {
      "title": "Clear, actionable task title",
      "description": "Optional clarifying details",
      "dueDate": "Optional ISO date string like 2024-01-15",
      "priority": "low|medium|high (optional)"
    }
  ]
}

Guidelines:
- Break large tasks into smaller, actionable steps
- Use clear, action-oriented language (start with verbs like "Create", "Review", "Setup")
- Keep titles concise but descriptive
- Only add descriptions if they add value
- If input is just one task, return one todo
- If it's a project, suggest a category name
- Default priority is medium if not specified`,
        },
        {
          role: 'user',
          content: input,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      return {
        success: false,
        error: 'No response from AI',
      };
    }

    // Parse and validate the response
    const parsed = JSON.parse(responseContent);
    const validated = AiResponseSchema.parse(parsed);

    return {
      success: true,
      data: validated,
    };
  } catch (error) {
    console.error('Error generating todos with AI:', error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Invalid AI response format',
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate todos',
    };
  }
}
