import react, { memo } from "react";
import SampleAudioVoice from "../SampleAudioVoice";
import { capitalize } from "../../api/util";

export function VoiceRow({ voice, index, playAudio, stopAudio }) {
  const MemoizedSampleAudioVoice = memo(SampleAudioVoice);
  return (
    <tr
      key={index}
      onClick={(e) => handleVoiceSelection(voice.voiceId, voice.name)}
      className="voiceItemContainer"
    >
      <td className="voiceSampleAndName flex items-center">
        <MemoizedSampleAudioVoice
          previewUrl={voice.sample}
          setAudioElement={setSampleAudioElement}
          isPlaying={playingStates[index]}
          playAudio={(e) => {
            e.stopPropagation();
            playAudio(index);
          }}
          stopAudio={(e) => {
            e.stopPropagation();
            stopAudio(index);
          }}
        />
        {voice.name}
      </td>
      <td>{capitalize(voice.accent)}</td>
      <td>{capitalize(voice.age)}</td>
      <td>{capitalize(voice.style)}</td>
      <td>{capitalize(voice.tempo)}</td>
    </tr>
  );
}
