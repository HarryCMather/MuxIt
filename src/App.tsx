import { useEffect, useState } from "react";
import { useFfmpeg } from "@muxit/hooks/useFfmpeg";
import "@muxit/css/App.css";
import type { FileData } from "@ffmpeg/ffmpeg";

function App() {
  const { ready, log, loadCallback, runCallback, writeCallback, readCallback, fetchFile } = useFfmpeg();
  
  const [ errorMessage, setErrorMessage ] = useState<string>();
  const [ videos, setVideos ] = useState<File[]>([]);
  const [ outputBlobUrl, setOutputBlobUrl ] = useState<string>();

  useEffect(() => {
    loadCallback();
  }, [ loadCallback ]);

  const addVideos = (files: FileList | null) => {
    if (!files) {
      setErrorMessage("No videos were selected!");
      return;
    }

    const existingFileNames: string[] = videos.map(video => video.name);
    
    for (const file of files) {
      if (existingFileNames.includes(file.name)) {
        continue;
      }

      setVideos([ ...videos, file ]);
    }
  };

  const muxVideos = async () => {
    if (!videos || videos.length === 0) {
      setErrorMessage("No videos were selected!");
      return;
    }

    let args: string[] = [ "-i" ];
    let concatArg: string = "concat:";
    let isFirst: boolean = false;

    for (const video of videos) {
      await writeCallback(video.name, await fetchFile(video));

      if (!isFirst) {
        concatArg += "|";
      }
      else {
        isFirst = false;
      }

      concatArg += video.name;
    }

    // TODO: Modify the output to not force an MP4 container, as this may not match what the user has requested:
    const outputPath: string = "output.mp4";
    args = [ ...args, "-c", "copy", outputPath ];

    await runCallback(args);

    const outputData: FileData = await readCallback(outputPath);

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

          { videos && videos.length > 0 &&
            <>
              <ul>
                { videos.map( (video) => (
                    <li key={ video.name }>
                      { video.name }
                    </li>
                  ))
                }
              </ul>
              
              <button
                onClick={ (e) => muxVideos() }
              >
                Mux videos
              </button>
            </>
          }

          { outputBlobUrl &&
            <>
              <h3>Output video:</h3>
              <video 
                src="{ outputBlobUrl }"
                controls
              />
            </>
          }
        </> :
        <p>Loading Ffmpeg WASM.  This may take some time...</p>
      }

      {/* <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div> */}
    </>
  );
}

export default App;
