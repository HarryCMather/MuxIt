export type UseFfmpegOptions = {
  onLog: (message: string) => void;
  onError: (message: string) => void;
  onProgress: (progress: number) => void;
};
