import { useGlobalStoreContext } from "@/app/context/GlobalStoreContext";
import React, { useEffect, useRef } from "react";

const SubTitleContainer = ({ subtitile_data }) => {
  const { target_video_element, website_scroll_config } =
    useGlobalStoreContext();

  const subtitleOuterCont = useRef(null);
  const subtitleInnerCont = useRef(null);

  function integrateSubtitle() {
    const videoPlayerForSubtitle = target_video_element.current;

    const personaliz_player_video_track = document.createElement("track");
    personaliz_player_video_track.id = "personaliz_video_track";
    videoPlayerForSubtitle.appendChild(personaliz_player_video_track);
    //GET URL AND CONVERT IT INTO BLOB AND GET URL FROM THAT
    fetch(subtitile_data?.url)
      .then((res) => res.blob()) // Gets the response and returns it as a blob
      .then((blob) => {
        let objectURL = URL.createObjectURL(blob);
        personaliz_player_video_track.src = objectURL;
      });

    personaliz_player_video_track.label = subtitile_data?.language;
    personaliz_player_video_track.kind = "Subtitles";
    personaliz_player_video_track.srclang = subtitile_data?.lang_id;
    personaliz_player_video_track.default = true;
    personaliz_player_video_track.mode = "hidden";

    videoPlayerForSubtitle.addEventListener("play", function () {
      subtitleOuterCont.current.style.display = "flex";
    });

    videoPlayerForSubtitle.addEventListener("ended", function () {
      subtitleOuterCont.current.style.display = "none";
    });

    // Wait for the 'loadedmetadata' event to ensure the TextTrack is available
    videoPlayerForSubtitle.addEventListener("loadedmetadata", () => {
      subtitleOuterCont.current.style.display = "flex";
      // Get the TextTrack representing the subtitles
      const subtitlesTrack = videoPlayerForSubtitle.textTracks[0];
      if (subtitlesTrack) {
        subtitlesTrack.mode = "hidden";

        // Add a listener for the 'cuechange' event to detect when cues change (active cues change)
        subtitlesTrack.addEventListener("cuechange", () => {
          //   Get the currently active cues
          const activeCues = subtitlesTrack.activeCues;
          // Loop through the active cues and apply custom styles
          for (const cue of activeCues) {
            subtitleInnerCont.current.innerHTML = cue.text;
          }
        });
      }
    });
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      integrateSubtitle();
    }, 1000);

    return () => {
      clearTimeout(timer);
      const personaliz_player_video_track_previous = document.getElementById(
        "personaliz_video_track"
      );
      if (personaliz_player_video_track_previous) {
        personaliz_player_video_track_previous.remove();
      }
    };
    //eslint-disable-next-line
  }, []);

  return (
    <div
      className={`hidden absolute bottom-8 ${
        website_scroll_config
          ? "w-[calc(100%-13rem)] right-0"
          : "w-[97%] left-1 md:left-2"
      }`}
      ref={subtitleOuterCont}
    >
      <div
        className="my-0 mx-auto bg-white text-black rounded text-xl text-justify leading-7 "
        ref={subtitleInnerCont}
      ></div>
    </div>
  );
};

export default SubTitleContainer;
