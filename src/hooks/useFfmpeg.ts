import { useRef, useState, useCallback } from "react";
import { FFmpeg, type FFMessageLoadConfig } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import type { UseFfmpegOptions } from "@muxit/models/useFfmpegOptions";

export function useFfmpeg(options: UseFfmpegOptions) {
  const ffmpegRef = useRef<FFmpeg | null>(null);

  const [ ready, setReady ] = useState<boolean>(false);

  if (!ffmpegRef.current) {
    ffmpegRef.current = new FFmpeg();
  }

  const loadCallback = useCallback(async () => {
    if (ready) {
      return;
    }

    ffmpegRef.current!.on("log", ({ message }) => options.onLog(message));
    ffmpegRef.current!.on("progress", ({ progress }) => options.onProgress(progress));

    await ffmpegRef.current!.load(undefined); // Accepts FFMessageLoadConfig, though I have no current need for this.

    setReady(true);
  }, [ ready, options ]);


  const runCallback = useCallback(async (args: string[]): Promise<boolean> => {
    if (!ready) {
      options.onError("Cannot execute Ffmpeg command, as it's not ready");
      return false;
    }

    const argsString: string = args.join(" ");
    options.onLog(`Executing the following Ffmpeg WASM command: '${argsString}'`);

    const exitCode: number = await ffmpegRef.current!.exec(args);
    return !exitCode;
  }, [ ready ]);

  const writeCallback = useCallback(async (name: string, data: Uint8Array | ArrayBuffer) =>{
    const currentData = data instanceof Uint8Array ? data : new Uint8Array(data);
    await ffmpegRef.current!.writeFile(name, currentData);
  }, []);

  const readCallback = useCallback((name: string) => {
    return ffmpegRef.current!.readFile(name);
  }, []);

  return { ready, loadCallback, runCallback, writeCallback, readCallback, fetchFile };
}
