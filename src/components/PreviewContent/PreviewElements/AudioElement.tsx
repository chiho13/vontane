import { useEffect, useState, useMemo } from "react";
import styled from "styled-components";
import AudioPlayer from "@/components/AudioPlayer";
import { useTextSpeech } from "@/contexts/TextSpeechContext";
import { api } from "@/utils/api";
import { useRouter } from "next/router";

export function AudioElement({ element }) {
  return (
    <div
      data-id={element.id}
      className="flex items-center"
      contentEditable={false}
      key={element.id}
    >
      <AudioPlayer audioURL={element.audio_url} fileName={element.file_name} />
    </div>
  );
}
