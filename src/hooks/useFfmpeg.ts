import { useRef, useState, useCallback } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import type { UseFfmpegOptions } from "@muxit/models/useFfmpegOptions";

export function useFfmpeg(options: UseFfmpegOptions) {
  const ffmpegRef = useRef<FFmpeg | null>(null);

  const [ ready, setReady ] = useState<boolean>(false);

  if (!ffmpegRef.current) {
    ffmpegRef.current = new FFmpeg();
  }

  const load = useCallback(async () => {
    if (ready) {
      return;
    }

    ffmpegRef.current!.on("log", ({ message }) => options.onLog(message));
    ffmpegRef.current!.on("progress", (progress) => options.onProgress(progress.progress));

    // The 'load' method accepts FFMessageLoadConfig, though I have no current need for this:
    await ffmpegRef.current!.load(undefined);

    setReady(true);
  }, [ ready, options ]);


  const run = useCallback(async (args: string[]): Promise<boolean> => {
    if (!ready) {
      options.onError("Cannot execute Ffmpeg command, as it's not ready");
      return false;
    }

    const argsString: string = args.join(" ");
    options.onLog(`Executing the following Ffmpeg WASM command: '${argsString}'`);

    const exitCode: number = await ffmpegRef.current!.exec(args);

    // Success exit code would be 0, so I want to invert the truthy/falsy check to check if the run was successful:
    const isSuccessful: boolean = !Boolean(exitCode);
    return isSuccessful;
  }, [ ready ]);

  const write = useCallback(async (name: string, data: Uint8Array | ArrayBuffer) =>{
    const currentData = data instanceof Uint8Array ? data : new Uint8Array(data);
    await ffmpegRef.current!.writeFile(name, currentData);
  }, []);

  const read = useCallback(async (name: string) => {
    const fileData = await ffmpegRef.current!.readFile(name);

    // Converting to unknown does feel like a code smell here, but TS is complaining and the Ffmpeg WASM documentation suggests doing this:
    const data: Uint8Array<ArrayBuffer> = new Uint8Array((fileData as unknown) as ArrayBuffer);
    return data;
  }, []);

  return { ready, load, run, write, read, fetchFile };
}
