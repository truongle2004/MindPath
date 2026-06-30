'use client';

import type {
  AppState,
  BinaryFiles,
  ExcalidrawInitialDataState,
  ExcalidrawProps,
} from '@excalidraw/excalidraw/types';
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

type ExcalidrawChangeHandler = NonNullable<ExcalidrawProps['onChange']>;

export type WhiteboardData = {
  elements: Parameters<ExcalidrawChangeHandler>[0];
  appState: AppState;
  files: BinaryFiles;
};

export function Whiteboard(props: {
  initialData?: ExcalidrawInitialDataState;
  onDataChange?: (data: WhiteboardData) => void;
}) {
  return (
    <div className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 px-4 text-base sm:px-6">
      <Card className="gap-0 py-0 shadow-xl">
        <CardContent className="h-[75vh] min-h-[32rem] p-0">
          <div className="size-full">
            <Excalidraw
              initialData={props.initialData}
              onChange={(elements, appState, files) => {
                props.onDataChange?.({ elements, appState, files });
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
