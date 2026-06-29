'use client';

import dynamic from 'next/dynamic';
import '@excalidraw/excalidraw/index.css';
import { Card, CardContent } from '@/components/ui/card';

const Excalidraw = dynamic(
  async () => {
    const excalidrawModule = await import('@excalidraw/excalidraw');
    return excalidrawModule.Excalidraw;
  },
  { ssr: false },
);

export function Whiteboard() {
  return (
    <div className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 px-4 text-base sm:px-6">
      <Card className="gap-0 py-0 shadow-xl">
        <CardContent className="h-[75vh] min-h-[32rem] p-0">
          <div className="size-full">
            <Excalidraw />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
