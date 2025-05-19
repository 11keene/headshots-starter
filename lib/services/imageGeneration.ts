import OpenAI from 'openai';
import { supabaseAdmin } from '@/lib/supabaseClient';
import { sendHeadshotReadyEmail } from '@/lib/sendEmail';
import type { OrderDetails, PackType } from '@/types/imageGeneration';

const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4';
const ASTRIA_API_URL = "https://api.astria.ai";
const ASTRIA_API_KEY = process.env.ASTRIA_API_KEY!;

interface AstriaResult {
  prompt: string;
  imageUrl: string;
}

export async function processOrder(details: OrderDetails): Promise<void> {
  await updateOrderStatus(details.orderId, 'processing');
  try {
    const prompts =
      details.packType === 'custom'
        ? await generateCustomPrompts(details.intakeForm!)
        : generateStandardPrompts(details.packType, details.extras ?? 0);

    const taskIds = await sendPromptsToAstria(prompts);
    const results = await waitForAstriaResults(taskIds);

    await saveHeadshots(details.orderId, details.userId, results);
    await updateOrderStatus(details.orderId, 'completed');

    try {
      await sendHeadshotReadyEmail(
        details.userEmail,
        results.map((r) => r.imageUrl)
      );
    } catch (emailErr) {
      console.error('Error sending email:', emailErr);
    }
  } catch (err) {
    await updateOrderStatus(details.orderId, 'failed');
    throw err;
  }
}

function generateStandardPrompts(packType: PackType, extrasCount: number): string[] {
  const count = packType === 'starter' ? 6 : 15;
  const totalPacks = extrasCount + 1;
  const prompts: string[] = [];
  for (let p = 0; p < totalPacks; p++) {
    for (let i = 1; i <= count; i++) {
      prompts.push(`Professional headshot prompt ${i} for ${packType} pack`);
    }
  }
  return prompts;
}

async function generateCustomPrompts(intake: string): Promise<string[]> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
  const res = await openai.chat.completions.create({
    model: OPENAI_MODEL,
    messages: [
      { role: 'system', content: 'Generate image prompts based on user intake.' },
      { role: 'user', content: intake }
    ]
  });
  const content = res.choices?.[0]?.message?.content || '';
  return content.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
}

async function sendPromptsToAstria(prompts: string[]): Promise<string[]> {
  const tasks: string[] = [];
  for (const prompt of prompts) {
    const res = await fetch(`${ASTRIA_API_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ASTRIA_API_KEY}`
      },
      body: JSON.stringify({ prompt })
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Astria generate error: ${err}`);
    }
    const data = await res.json();
    tasks.push(data.task_id);
  }
  return tasks;
}

async function waitForAstriaResults(taskIds: string[]): Promise<AstriaResult[]> {
  const timeout = 5 * 60 * 1000;
  const interval = 5000;
  const deadline = Date.now() + timeout;
  const results: AstriaResult[] = [];
  const pending = new Set(taskIds);

  while (pending.size && Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, interval));
    for (const taskId of Array.from(pending)) {
      const res = await fetch(`${ASTRIA_API_URL}/status/${taskId}`, {
        headers: { Authorization: `Bearer ${ASTRIA_API_KEY}` }
      });
      if (!res.ok) continue;
      const data = await res.json();
      if (data.status === 'succeeded') {
        for (const img of data.images) {
          results.push({ prompt: data.prompt, imageUrl: img.url });
        }
        pending.delete(taskId);
      } else if (data.status === 'failed') {
        pending.delete(taskId);
        throw new Error(`Astria task ${taskId} failed`);
      }
    }
  }

  if (pending.size) {
    throw new Error('Timed out waiting for Astria results');
  }
  return results;
}

async function saveHeadshots(
  orderId: string,
  userId: string,
  images: AstriaResult[]
): Promise<void> {
  const records = images.map((img) => ({
    order_id: orderId,
    user_id: userId,
    prompt: img.prompt,
    image_url: img.imageUrl
  }));
  const { error } = await supabaseAdmin.from('headshots').insert(records);
  if (error) throw new Error(`Supabase insert error: ${error.message}`);
}

async function updateOrderStatus(
  orderId: string,
  status: 'processing' | 'completed' | 'failed'
): Promise<void> {
  const { error } = await supabaseAdmin
    .from('orders')
    .update({ status })
    .eq('id', orderId);
  if (error) throw new Error(`Supabase order status update error: ${error.message}`);
}