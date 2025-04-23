import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

const ffmpeg = createFFmpeg({ log: true });

export const convertToMp3 = async (blob) => {
  if (!ffmpeg.isLoaded()) {
    console.log('[DEBUG] Cargando FFmpeg...');
    await ffmpeg.load();
  }

  ffmpeg.FS('writeFile', 'input.webm', await fetchFile(blob));
  await ffmpeg.run('-i', 'input.webm', '-codec:a', 'libmp3lame', 'output.mp3');
  const data = ffmpeg.FS('readFile', 'output.mp3');

  return new Blob([data.buffer], { type: 'audio/mp3' });
};
