import { useEffect, useState } from "react";
import { useFfmpeg } from "@muxit/hooks/useFfmpeg";
import "@muxit/css/App.css";
import type { UseFfmpegOptions } from "@muxit/models/useFfmpegOptions";
import type { Video } from "@muxit/models/video";
import Timeline from "@muxit/components/Timeline";

function App() {
  const [ errorMessage, setErrorMessage ] = useState<string>();
  const [ videos, setVideos ] = useState<Video[]>([]);
  const [ outputBlobUrl, setOutputBlobUrl ] = useState<string>();

  const useFfmpegOptions: UseFfmpegOptions = {
    onLog: (message: string) => console.log(`Log: ${message}`),
    onError: (message: string) => setErrorMessage(message),
    onProgress: (progress: number) => console.log(`Progress: ${progress}`)
  };

  const { ready, load, run, write, read, fetchFile } = useFfmpeg(useFfmpegOptions);

  useEffect(() => {
    load();
  }, [ load ]);

  const addVideos = (files: FileList | null) => {
    if (!files) {
      setErrorMessage("No videos were selected!");
      return;
    }

    const existingFileNames: string[] = videos.map(video => video.file.name);

    // I would much prefer to use a .filter followed by .map here, as this would be cleaner.  Sadly, FileLists don't support this.
    const newVideos: Video[] = [];
    let count: number = videos.length;
    for (const file of files) {
      if (existingFileNames.includes(file.name)) {
        continue;
      }

      newVideos.push({
        sanitized_temp_file_name: `${count}.mp4`, // TODO: Better handle different file extensions.
        file: file
      });

      count++;
    }

    setVideos((previous) => [ ...previous, ...newVideos ]);
  };

  const muxVideos = async () => {
    if (!videos || videos.length === 0) {
      setErrorMessage("No videos were selected!");
      return;
    }

    const videoListText: string = videos.map(video => `file '${video.sanitized_temp_file_name}'`)
                                        .join("\n");
    await write("videos.txt", new TextEncoder().encode(videoListText));

    // TODO: Modify the output to not force an MP4 container, as this may not match what the user has requested:
    const outputPath: string = "output.mp4";
    let args: string[] = [ "-f", "concat", "-safe", "0", "-i", "videos.txt", "-c", "copy", outputPath ];

    for (const video of videos) {
      await write(video.sanitized_temp_file_name, await fetchFile(video.file));
    }

    const isRunSuccessful: boolean = await run(args);
    if (!isRunSuccessful) {
      setErrorMessage("Failed to mux videos!");
      return;
    }

    const data: Uint8Array<ArrayBuffer> = await read(outputPath);
    const dataBlob: Blob = new Blob([data.buffer], { type: "video/mp4" });
    const blobUrl: string = URL.createObjectURL(dataBlob);

    setOutputBlobUrl(blobUrl);
  };

  return (
    <>
      <h1>MuxIt</h1>

      { errorMessage &&
        <p>{ `Error: ${errorMessage}` }</p>
      }

      { ready ?
        <>
          <h3>Add videos:</h3>
          <input
            type="file"
            accept="video/*"
            multiple
            onChange={ (e) => addVideos(e.target.files) }
          />

          { videos && videos.length > 1 && (
              <>
                <h3>Timeline (drag to re-order clips):</h3>
                <Timeline
                  videos={ videos }
                  onReorder={ (newOrder) => setVideos(newOrder) }
                />

                <button 
                  onClick={ (_) => muxVideos() }
                >
                  Mux videos
                </button>
              </>
            )
          }

          { outputBlobUrl &&
            <>
              <h3>Output video:</h3>
              <video 
                src={ outputBlobUrl }
                controls
              />
            </>
          }
        </> :
        <p>Loading Ffmpeg WASM.  This may take some time...</p>
      }
    </>
  );
}

export default App;
