import { useEffect, useState } from "react";
import { useFfmpeg } from "@muxit/hooks/useFfmpeg";
import "@muxit/css/App.css";
import type { FileData } from "@ffmpeg/ffmpeg";
import type { UseFfmpegOptions } from "@muxit/models/useFfmpegOptions";
import type { Video } from "@muxit/models/video";
import Timeline from "./components/Timeline";

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
    
    // TODO : Verify which scenarios actually allow multiple files to be selected.
    // If multiple files are never selected, the foreach is redundant.
    for (const file of files) {
      if (existingFileNames.includes(file.name)) {
        continue;
      }

      const video: Video = {
        sanitized_temp_file_name: `${videos.length}.mp4`, // TODO: Better handle different file extensions.
        file: file
      };
      setVideos([ ...videos, video ]);
    }
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

    const outputData: FileData = await read(outputPath);

    // Converting to unknown does feel like a code smell here, but TS is complaining and the Ffmpeg WASM documentation suggests doing this:
    const data: Uint8Array<ArrayBuffer> = new Uint8Array((outputData as unknown) as ArrayBuffer);
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
            onChange={ (e) => addVideos(e.target.files) }
          />

          { videos && videos.length > 0 && (
              <>
                <h3>Timeline (drag to re-order clips):</h3>
                <Timeline
                  videos={ videos }
                  onReorder={ (newOrder) => setVideos(newOrder) }
                />

                { videos.length > 1 && (
                    <button 
                      onClick={ (_) => muxVideos() }
                    >
                      Mux videos
                    </button>
                  )
                }
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
