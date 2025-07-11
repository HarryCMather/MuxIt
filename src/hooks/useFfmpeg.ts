import { useRef, useState, useCallback } from "react";
import { FFmpeg, type FFMessageLoadConfig } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

export function useFfmpeg(options?: FFMessageLoadConfig) {
  const ffmpegRef = useRef<FFmpeg | null>(null);

  const [ ready, setReady ] = useState<boolean>(false);
  const [ log, setLog ] = useState<string>("");

  if (!ffmpegRef.current) {
    ffmpegRef.current = new FFmpeg();
  }

  const loadCallback = useCallback(async () => {
    if (ready) {
      return;
    }

    ffmpegRef.current!.on("log", ({ message }) => setLog(message));
    await ffmpegRef.current!.load(options);

    setReady(true);
  }, [ ready, options ]);


  const runCallback = useCallback((args: string[]) => {
    if (!ready) {
        setLog("Cannot execute Ffmpeg command, as it's not ready");
        return;
    }

    return ffmpegRef.current!.exec(args);
  }, [ ready ]);

  const writeCallback = useCallback(async (name: string, data: Uint8Array | ArrayBuffer) =>{
    const currentData = data instanceof Uint8Array ? data : new Uint8Array(data);
    await ffmpegRef.current!.writeFile(name, currentData);
  }, []);

  const readCallback = useCallback((name: string) => {
    return ffmpegRef.current!.readFile(name);
  }, []);

  return { ready, log, loadCallback, runCallback, writeCallback, readCallback, fetchFile };
}
