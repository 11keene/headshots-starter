// File: components/realtime/ClientSideModel.tsx

'use client';

import { useEffect, useState } from 'react';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';

// 1) Declare the prop interface
interface ClientSideModelProps {
  modelId: number;
}

// 2) Reuse your generated types for the rows
type ModelRow = Database['public']['Tables']['models']['Row'];
type SampleRow = Database['public']['Tables']['samples']['Row'];
type ImageRow  = Database['public']['Tables']['images']['Row'];

export default function ClientSideModel({ modelId }: ClientSideModelProps) {
  const supabase = createPagesBrowserClient<Database>();
  const [model, setModel] = useState<ModelRow | null>(null);
  const [samples, setSamples] = useState<SampleRow[]>([]);
  const [images, setImages]   = useState<ImageRow[]>([]);

  useEffect(() => {
    // load model
    supabase
      .from('models')
      .select('*')
      .eq('id', modelId)
      .single()
      .then(({ data, error }) => {
        if (!error && data) setModel(data);
      });

    // load samples
    supabase
      .from('samples')
      .select('*')
      .eq('modelId', modelId)
      .then(({ data, error }) => {
        if (!error && data) setSamples(data);
      });

    // load images
    supabase
      .from('images')
      .select('*')
      .eq('modelId', modelId)
      .then(({ data, error }) => {
        if (!error && data) setImages(data);
      });

    // subscribe to updates on all three tables
    const channel = supabase
      .channel(`public:models:id=eq.${modelId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'models', filter: `id=eq.${modelId}` },
        (payload) => setModel(payload.new as ModelRow)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'samples', filter: `modelId=eq.${modelId}` },
        async () => {
          const { data } = await supabase
            .from('samples')
            .select('*')
            .eq('modelId', modelId);
          if (data) setSamples(data);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'images', filter: `modelId=eq.${modelId}` },
        async () => {
          const { data } = await supabase
            .from('images')
            .select('*')
            .eq('modelId', modelId);
          if (data) setImages(data);
        }
      )
      .subscribe();

    return () => void supabase.removeChannel(channel);
  }, [modelId, supabase]);

  // Loading / status states
  if (!model) return <div>Loading…</div>;
  if (model.status !== 'finished') return <div>Training…</div>;

  // Finished: show images
  return (
    <div className="flex flex-col w-full lg:w-1/2 rounded-md p-4 bg-white shadow">
      <h2 className="text-xl font-semibold mb-4">Results</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((img) => (
          <img
            key={img.id}
            src={img.uri}
            alt="generated"
            className="rounded-md w-full h-auto object-cover"
          />
        ))}
      </div>
    </div>
  );
}
