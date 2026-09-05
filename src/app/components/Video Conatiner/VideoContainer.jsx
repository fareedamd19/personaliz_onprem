import { useGlobalStoreContext } from "@/app/context/GlobalStoreContext";
import Image from "next/image";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./VideoContainer.module.css";
import { Tooltip } from "react-tooltip";
import { RiFullscreenFill } from "react-icons/ri";
import SubTitleContainer from "./SubTitleContainer";
import { isFixtureMode, installFixtureNetworkGuard } from "@/app/utils/fixtureMode";
import { ensureOverlayFonts } from "@/app/utils/overlayFonts";
import { fetchOverlayVariables, overlayVariablesEnabled } from "@/app/utils/overlayVariables";
import { checkIfParamsArePresent } from "@/app/utils/Functions";
// Aliased so the three use sites below stay untouched. Which fixture this
// resolves to is decided by NEXT_PUBLIC_FIXTURE_SET - see active.fixture.js.
import {
  activeCaptions as fixtureCaptions,
  activeVariables as fixtureVariables,
  activeFixtureRtl,
} from "@/app/fixtures/active.fixture";
import {
  sampleElement,
  shouldRender,
  hasKeyframes,
  normalizeKeyframes,
  resolveRef,
  safeHref,
  boundProportion,
  elementType,
  formatValue,
  expandRepeaters,
  chapterSkipTarget,
  normalizeVariants,
  pickVariant,
  mapTimeAcrossVariants,
} from "@/app/utils/overlayElement";

// Install fixture network guard at module load (client-side only)
if (typeof window !== "undefined") {
  installFixtureNetworkGuard();
}

const websiteSrollContPosition = {
  bottom_left: "bottom-[0.5rem] left-[0.5rem]",
  bottom_right: "bottom-[0.5rem] right-[0.5rem]",
  top_right: "top-[0.5rem] right-[0.5rem]",
  top_left: "top-[0.5rem] left-[0.5rem]",
};

const websiteSrollContShape = {
  circle: "rounded-[50%]",
  square: "rounded-md",
};

// Feature flag for overlay engine v2 — defaults to OFF (legacy engine)
const USE_OVERLAY_V2 = process.env.NEXT_PUBLIC_OVERLAY_V2 === "1";

const VideoContainer = () => {
  const {
    currentQuestionData,
    website_scroll_config,
    target_video_element,
    personaliz_branding,
    isVideoClickedOnFirstLoad,
    handleQuestionConatinerUpOrDown,
    questionContainerHeight,
    configData,
    max_video_watch_time,
    captureUserExit,
    isQuestionOnTopOfVideo,
    firstLoadData,
    handleTrackEvent,
  } = useGlobalStoreContext();

  const personalizVideoSetInterval = useRef(null);
  const videoElm = useRef(null);
  const personalizedVideoRef = useRef(null);
  const scrollVideoElm = useRef(null);
  const videoTimerRef = useRef(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const posterUrl =
    personaliz_branding === "none"
      ? "/onprem/chrome/Personaliz_Logo_ANimation_For_Video_Poster.gif"
      : "/onprem/chrome/Personaliz_Logo_ANimation_For_Video_Poster.gif";
  const alreadyAutomaticallyMovedUp = useRef(false);

  const subtitile_data = currentQuestionData?.current?.subtitle_data ?? null;

  function getVideoElementToTarget() {
    let video;
    if (website_scroll_config) {
      video = scrollVideoElm.current;
    } else {
      video = videoElm.current;
    }
    target_video_element.current = video;
    if (isVideoClickedOnFirstLoad.current) {
      video.muted = false;
      setIsVideoPlaying(true);
      setIsMuted(false);
    }
    if (!isVideoClickedOnFirstLoad.current && !+configData?.auto_play) {
      if (video) {
        video.pause();
      }
    }
    return video;
  }

  function getDuration(time = 0) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.round(time - minutes * 60);
    if (isNaN(minutes) || isNaN(seconds)) {
      return `00:00`;
    } else return `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
  }

  useEffect(() => {
    if (!currentQuestionData.current?.video_url) {
      return;
    }
    let video = getVideoElementToTarget();
    if (video) {
      startVideoTracking(video);
    }
    return () => {
      removeVideoTracking();
    };
  }, [videoElm?.current?.src, scrollVideoElm?.current?.src, configData]);

  const updatePersonalizedVideoTime = () => {
    if (
      videoElm &&
      personalizedVideoRef &&
      personalizedVideoRef?.current?.duration
    ) {
      const videoElement = videoElm.current;
      const currentTime = videoElement.currentTime;

      const personalizedVideoElement = personalizedVideoRef.current;
      const personalizedVideoDuration = personalizedVideoElement.duration;

      if (currentTime < personalizedVideoDuration) {
        videoElement.muted = true;
        personalizedVideoElement.muted = isMuted;

        if (!videoElement.paused) personalizedVideoElement.play();
        else personalizedVideoElement.pause();

        personalizedVideoElement.style.zIndex = "10";

        personalizedVideoElement.currentTime = currentTime;
      } else {
        personalizedVideoElement.muted = true;
        videoElement.muted = isMuted;

        personalizedVideoElement.pause();
        personalizedVideoElement.style.zIndex = "-10";
      }
    }
  };

  useEffect(() => {
    updatePersonalizedVideoTime();
  }, [isMuted, videoElm?.current?.paused]);

  function startVideoTracking(video) {
    personalizVideoSetInterval.current = setInterval(() => {
      handleCheckForAutomaticallyMoveUp(video);
      setVideoProgress((video.currentTime / video.duration) * 100);
      videoTimerRef.current.innerHTML = `${getDuration(
        Number(video.currentTime)
      )} / ${getDuration(Number(video.duration))}`;
      if (video.currentTime >= video.duration) {
        setIsVideoPlaying(false);
        if (website_scroll_config) {
          if (videoElm.current) {
            videoElm.current.pause();
          }
        }
      }
      if (video.paused) {
        setIsVideoPlaying(false);
      } else {
        if (isVideoClickedOnFirstLoad.current) {
          setIsVideoPlaying(true);
        } else {
          setIsVideoPlaying(false);
        }
      }
    }, 20);
  }
  function removeVideoTracking() {
    clearInterval(personalizVideoSetInterval.current);
  }

  function handleVideoClick() {
    if (!isVideoPlaying) {
      personalizPlayVideoFunction();
    } else {
      if (!isVideoClickedOnFirstLoad.current) {
        personalizPlayVideoFunction();
      } else {
        personalizPauseVideoFunction();
      }
    }
  }

  function personalizPlayVideoFunction() {
    setIsVideoPlaying(true);
    if (!isVideoClickedOnFirstLoad.current) {
      isVideoClickedOnFirstLoad.current = true;
      alreadyAutomaticallyMovedUp.current = false;
      handleQuestionConatinerUpOrDown("down");
      setIsMuted(false);
      videoElm.current.currentTime = 0;
      if (website_scroll_config) {
        if (scrollVideoElm.current) {
          scrollVideoElm.current.muted = false;
          scrollVideoElm.current.currentTime = 0;
        }
      } else {
        videoElm.current.muted = false;
      }
    }
    if (website_scroll_config) {
      if (scrollVideoElm.current) {
        if (videoElm.current.currentTime >= videoElm.current.duration) {
          if (
            scrollVideoElm.current.currentTime >=
            scrollVideoElm.current.duration
          ) {
            videoElm.current.play();
          }
        } else {
          videoElm.current.play();
        }
        scrollVideoElm.current.play();
      }
    } else {
      videoElm.current.play();
    }
  }

  function personalizPauseVideoFunction() {
    setIsVideoPlaying(false);
    videoElm.current.pause();
    if (website_scroll_config) {
      if (scrollVideoElm.current) {
        scrollVideoElm.current.pause();
      }
    }
  }

  function handleSeekVideo(e) {
    let video = getVideoElementToTarget();

    const mainTarget = document.querySelector(`.${styles.prgressBarOuterCont}`);
    const width = mainTarget.clientWidth;
    const offsetX = e.nativeEvent.offsetX;
    const percentage = offsetX / width;
    let interactlyCurrentRange = percentage * video.duration;

    if (scrollVideoElm.current) {
      scrollVideoElm.current.currentTime = interactlyCurrentRange;
    } else {
      videoElm.current.currentTime = interactlyCurrentRange;
    }

    updatePersonalizedVideoTime();
  }

  function handleCheckForAutomaticallyMoveUp(video) {
    const videoPopupTimer = +currentQuestionData.current?.delay_interaction;
    const maximizeOptionPannel = +configData?.maximize_option_panel;
    const isLeadTriggeredType = +currentQuestionData.current?.is_lead_trigger;
    const currentTime = video.currentTime;
    const videoTotalDuration = video.duration;

    if (
      currentTime >=
      (videoPopupTimer >= videoTotalDuration
        ? videoTotalDuration
        : videoPopupTimer)
    ) {
      if (
        questionContainerHeight === "bottom" &&
        !alreadyAutomaticallyMovedUp.current
      ) {
        if (maximizeOptionPannel) {
          if (isLeadTriggeredType) {
            handleQuestionConatinerUpOrDown("top");
            alreadyAutomaticallyMovedUp.current = true;
          } else {
            handleQuestionConatinerUpOrDown("up");
            alreadyAutomaticallyMovedUp.current = true;
          }
        } else {
          handleQuestionConatinerUpOrDown("up");
          alreadyAutomaticallyMovedUp.current = true;
        }
      }
    }
  }

  function handleRestartVideoClick() {
    if (!isVideoClickedOnFirstLoad.current) {
      isVideoClickedOnFirstLoad.current = true;
    }
    max_video_watch_time.current = Math.max(
      max_video_watch_time.current,
      target_video_element.current.currentTime
    );
    setIsMuted(false);
    if (website_scroll_config) {
      if (scrollVideoElm.current) {
        scrollVideoElm.current.currentTime = 0;
        scrollVideoElm.current.play();
        scrollVideoElm.current.muted = false;
      }
    }
    videoElm.current.currentTime = 0;
    videoElm.current.play();
    if (!website_scroll_config) {
      videoElm.current.muted = false;
    }

    updatePersonalizedVideoTime();
  }

  function handleRestartSessionClick() {
    captureUserExit();
    window.location.reload();
  }
  function handleToggleSound() {
    if (!isVideoClickedOnFirstLoad.current) {
      isVideoClickedOnFirstLoad.current = true;
    }
    if (isMuted) {
      setIsMuted(false);
      if (website_scroll_config) {
        scrollVideoElm.current.muted = false;
      } else {
        videoElm.current.muted = false;
      }
    } else {
      setIsMuted(true);
      if (website_scroll_config) {
        scrollVideoElm.current.muted = true;
      } else {
        videoElm.current.muted = true;
      }
    }
  }
  function handleFullscreen() {
    const personaliz_video_outer_conatiner = document.querySelector(
      `.${styles.videoOuterConatiner}`
    );
    if (document.fullscreenElement === personaliz_video_outer_conatiner) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else if (document.webkitFullscreenElement) {
        document.webkitCancelFullScreen();
      } else if (document.mozFullScreenElement) {
        document.mozCancelFullScreen();
      } else if (document.msFullscreenElement) {
        document.msExitFullscreen();
      }
    } else if (personaliz_video_outer_conatiner.requestFullscreen) {
      personaliz_video_outer_conatiner.requestFullscreen();
    } else if (personaliz_video_outer_conatiner.mozRequestFullScreen) {
      personaliz_video_outer_conatiner.mozRequestFullScreen();
    } else if (personaliz_video_outer_conatiner.webkitRequestFullscreen) {
      personaliz_video_outer_conatiner.webkitRequestFullscreen();
    } else if (personaliz_video_outer_conatiner.msRequestFullscreen) {
      personaliz_video_outer_conatiner.msRequestFullscreen();
    } else if (videoElm.current.webkitEnterFullScreen) {
      videoElm.current.webkitEnterFullScreen();
    }
  }

  function handleVideoError(event) {
    event.target.src = `${currentQuestionData.current?.original_s3url}#t=0.001`;
  }

  function handleWebsiteScrollVideoError(event) {
    event.target.src = `${website_scroll_config?.original_s3_url}#t=0.001`;
  }

  const isFirstQuestion =
    currentQuestionData.current?.isFirstQuestion ||
    Boolean(+currentQuestionData.current?.is_firstquestion);

  return (
    <section className={`${styles.videoOuterConatiner} w-full h-full relative`}>
      {/* MAIN VIDEO */}

      {isFirstQuestion &&
        firstLoadData?.dynamic_text_display.type === "web" && USE_OVERLAY_V2 && (
          <VideoCaptioner
            currentQuestionData={currentQuestionData}
            videoSrc={`${currentQuestionData.current?.video_url}#t=0.001`}
            captions={
              isFixtureMode()
                ? fixtureCaptions
                : firstLoadData?.dynamic_text_display.config
            }
            overlayVariables={firstLoadData?.dynamic_text_display?.variables}
            languages={firstLoadData?.dynamic_text_display?.languages}
            defaultLang={firstLoadData?.dynamic_text_display?.defaultLang}
            videoRef={videoElm}
            personalizedVideoRef={personalizedVideoRef}
            posterUrl={posterUrl}
            handleVideoClick={handleVideoClick}
            handleVideoError={handleVideoError}
            updatePersonalizedVideoTime={updatePersonalizedVideoTime}
            onLinkClick={(element, href) =>
              handleTrackEvent?.({
                is_overlay_link_clicked: "1",
                overlay_element: element,
                overlay_href: href,
              })
            }
          />
        )}

      {isFirstQuestion &&
        firstLoadData?.dynamic_text_display.type === "web" && !USE_OVERLAY_V2 && (
          <VideoCaptionerLegacy
            currentQuestionData={currentQuestionData}
            videoSrc={`${currentQuestionData.current?.video_url}#t=0.001`}
            captions={
              isFixtureMode()
                ? fixtureCaptions
                : firstLoadData?.dynamic_text_display.config
            }
            videoRef={videoElm}
            personalizedVideoRef={personalizedVideoRef}
            posterUrl={posterUrl}
            handleVideoClick={handleVideoClick}
            handleVideoError={handleVideoError}
            updatePersonalizedVideoTime={updatePersonalizedVideoTime}
          />
        )}

      {(!isFirstQuestion ||
        firstLoadData?.dynamic_text_display.type === "render") &&
        currentQuestionData.current?.video_url && (
          <video
            onClick={handleVideoClick}
            muted
            autoPlay
            ref={videoElm}
            poster={posterUrl}
            onError={handleVideoError}
            className={`w-full h-full ${
              currentQuestionData.current?.video_fit === "zoomed"
                ? "object-cover"
                : "object-contain"
            }`}
            src={`${currentQuestionData.current?.video_url}#t=0.001`}
            playsInline
            preload="auto"
            allowFullScreen
          ></video>
        )}

      {/* WEBSITE SCROLL VIDEO */}
      {website_scroll_config && (
        <div
          className={`${styles.scrollVideoOuterCont} ${
            websiteSrollContPosition[website_scroll_config?.position]
          } ${websiteSrollContShape[website_scroll_config?.shape]}`}
        >
          <video
            className={`h-full w-full object-cover object-center ${
              websiteSrollContShape[website_scroll_config?.shape]
            }`}
            muted
            autoPlay
            playsInline
            preload="auto"
            allowFullScreen
            ref={scrollVideoElm}
            src={`${website_scroll_config?.dyn_video_url}#t=0.001`}
            poster={posterUrl}
            onError={handleWebsiteScrollVideoError}
          ></video>
        </div>
      )}

      {/* SUBTITLE CONTAINER */}
      {subtitile_data && <SubTitleContainer subtitile_data={subtitile_data} />}

      {/* PLAY ICON */}
      {!isVideoPlaying && (
        <img
          onClick={handleVideoClick}
          className="absolute z-[999] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer"
          src="/onprem/chrome/personaliz_play_Icon.svg"
          height={80}
          width={80}
          alt="personaliz play icon"
        />
      )}

      <div
        className={`bg-black bg-opacity-10 w-full flex flex-col absolute top-0 z-[999] ${
          !isVideoPlaying ? "block" : "hidden"
        } transition-all`}
      >
        {/* VIDEO PROGRESS BAR */}
        <div
          onClick={handleSeekVideo}
          className={`${styles.prgressBarOuterCont} cursor-pointer w-full h-[0.75rem] bg-[#6b7280]`}
        >
          <p
            style={{ width: `${videoProgress}%` }}
            className="w-0 bg-black h-full"
          ></p>
        </div>

        {/* VIDEO CONTROLS BAR */}
        <div className="w-full px-1 py-1 mt-1 flex items-center">
          <div className="flex items-center gap-3 w-max ml-2">
            <span
              onClick={handleRestartVideoClick}
              id="restart_video_tooltip_id"
              className="cursor-pointer border border-white rounded-md p-1 bg-black bg-opacity-30"
            >
              <img
                src="/onprem/chrome/Replay_Icon.svg"
                width={20}
                height={20}
                alt="replay icon"
              />
            </span>
            <Tooltip
              style={{ borderRadius: "5px" }}
              anchorId="restart_video_tooltip_id"
              place="bottom"
              content={"Restart video"}
            />
            <span
              onClick={handleRestartSessionClick}
              id="restart_session_tooltip_id"
              className="cursor-pointer border border-white rounded-md p-1 bg-black bg-opacity-30"
            >
              <img
                src="/onprem/chrome/Restart_Icon.svg"
                width={20}
                height={20}
                alt="replay icon"
              />
            </span>
            <Tooltip
              style={{ borderRadius: "5px" }}
              anchorId="restart_session_tooltip_id"
              place="bottom"
              content={"Restart session"}
            />
            <span
              ref={videoTimerRef}
              className="cursor-default border border-white rounded-md p-1 bg-black bg-opacity-30 text-white text-sm"
            >{`00:00 / 00:00`}</span>
          </div>

          <div className="flex items-center gap-3 w-max ml-auto">
            <span
              onClick={handleToggleSound}
              className="cursor-pointer border border-white rounded-md p-1 bg-black bg-opacity-30"
            >
              {isMuted ? (
                <img
                  className="w-[20px] h-[20px] aspect-auto"
                  src="/onprem/chrome/Mute_icon.svg"
                  width={20}
                  height={20}
                  alt="mute icon"
                />
              ) : (
                <img
                  src="/onprem/chrome/Sound_icon.svg"
                  width={20}
                  height={20}
                  alt="sound icon"
                />
              )}
            </span>
            <span
              onClick={handleFullscreen}
              className="cursor-pointer border border-white rounded-md p-1 bg-black bg-opacity-30"
            >
              <RiFullscreenFill className="text-white text-xl" />
            </span>
          </div>
        </div>
      </div>

      {/* COMPANY BRAND LOGO */}
      {personaliz_branding !== "none" && (
        <a
          target="_blank"
          href={process.env.NEXT_PUBLIC_PERSONALIZ_URL}
          style={{
            display:
              isQuestionOnTopOfVideo && questionContainerHeight === "bottom"
                ? "none"
                : "",
          }}
          className="bg-black bg-opacity-50 text-white text-lg font-sans font-bold w-full h-[35px] absolute right-0 bottom-0 flex items-center justify-center gap-2 z-50"
        >
          <em>Powered by</em>
          <img
            className="size-[30px]"
            src="/onprem/chrome/Personaliz_white_logo.png"
            alt="brandLogo"
            width={30}
            height={30}
          />{" "}
          <em>Personaliz.ai</em>
        </a>
      )}
    </section>
  );
};

export default VideoContainer;

export function VideoCaptioner({
  currentQuestionData,
  videoSrc,
  captions,
  videoRef,
  personalizedVideoRef,
  posterUrl,
  handleVideoClick,
  handleVideoError,
  updatePersonalizedVideoTime,
  onLinkClick,
  chapters,
  overlayVariables,
  languages,
  defaultLang,
}) {
  const [currentTime, setCurrentTime] = useState(0);
  const [videoHeight, setVideoHeight] = useState(1);
  const [videoWidth, setVideoWidth] = useState(1);
  // The master's own aspect, read from its metadata. Null until it loads.
  const [videoAspect, setVideoAspect] = useState(null);
  // The rectangle the picture actually occupies once letterboxed into the
  // space available. The overlay's fractions are relative to this, so it has
  // to be the box the caption layer lives in - not the space it was offered.
  const [pictureBox, setPictureBox] = useState(null);
  const hostRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || !videoAspect) return;

    const fit = () => {
      const w = host.clientWidth;
      const h = host.clientHeight;
      if (!w || !h) return;
      // Contain, computed rather than delegated: CSS aspect-ratio loses to an
      // explicit height, which silently left the box at the container's shape.
      const box =
        w / h > videoAspect
          ? { w: Math.round(h * videoAspect), h }
          : { w, h: Math.round(w / videoAspect) };
      setPictureBox((prev) =>
        prev && prev.w === box.w && prev.h === box.h ? prev : box
      );
    };

    fit();
    let observer;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(fit);
      observer.observe(host);
    }
    window.addEventListener("resize", fit);
    return () => {
      if (observer) observer.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, [videoAspect]);

  const personalizedVideoUrl =
    currentQuestionData.current?.personaliz_video_url;

  /* ---------------------------------------------------------- language switch */

  // The same campaign carried in more than one language. Only the film changes:
  // the overlay above it is one element set, shared by every language, so
  // nothing here touches `captions`, `elements` or `variables`.
  //
  // The master element - videoRef, the one below with id webRenderVideo - stays
  // the overlay's clock at ALL times, whichever language is showing. That is
  // the whole design. The keyframe loop reads videoRef.current, and repointing
  // it mid-play would restart every animated element against a different
  // timeline. So the second language is a follower: it comes to the front and
  // takes the audio while the master keeps running, silent, behind it.
  //
  // Nothing below acts until someone presses the button, so a campaign with no
  // variants behaves exactly as it did before this existed.
  const altVideoRef = useRef(null);

  const variants = useMemo(
    () => normalizeVariants({ variants: languages }),
    [languages]
  );

  const baseLang = defaultLang || variants[0]?.lang || null;

  const [activeLang, setActiveLang] = useState(() => {
    const opening = pickVariant(variants, null, baseLang);
    return opening ? opening.lang : null;
  });

  // Until the viewer presses the button, the master's muted state is left
  // exactly as the rest of the player set it. Unmuting on mount would break
  // autoplay, which browsers only permit while a video is silent.
  const [hasSwitched, setHasSwitched] = useState(false);

  // The follower is not mounted until the master is playing, so nothing about
  // the second language competes with getting the first frame on screen. Once
  // mounted it costs a metadata request and nothing more - see the preload note
  // on the element itself.
  const [altMounted, setAltMounted] = useState(false);

  // Only a language whose film lives on THIS campaign can be a follower. One
  // that points at another campaign is a navigation, so there is nothing to
  // preload and no second element to mount for it.
  const altCandidate = useMemo(
    () => variants.find((v) => v.lang !== baseLang && v.videoUrl) || null,
    [variants, baseLang]
  );

  // Which film the follower carries. It holds the selected language whenever
  // that is not the default, so switching back and forth never reloads it.
  const altVariant = useMemo(() => {
    if (!altCandidate) return null;
    if (activeLang && activeLang !== baseLang) {
      // Guarded on videoUrl: a language reached by navigation never becomes the
      // active one here, but if it ever did, mounting a video element with no
      // source would black out the picture.
      const chosen = variants.find((v) => v.lang === activeLang);
      return chosen && chosen.videoUrl ? chosen : altCandidate;
    }
    return altCandidate;
  }, [variants, activeLang, baseLang, altCandidate]);

  const isAltShowing = Boolean(
    altVariant && activeLang && activeLang === altVariant.lang
  );

  // The overlay for the language being shown.
  //
  // A variant that was given its own wording arrives with its text already
  // substituted for this recipient, exactly as the campaign's own overlay is.
  // One that was not carries no config, and every language shares the
  // campaign's - which is the film-only switch.
  //
  // This is derived from activeLang in the same render as the video swap, so
  // the film, the wording and the direction can never disagree: a swap that
  // changed the film but kept the previous language's overlay would put
  // English captions under Arabic speech.
  const activeVariant = useMemo(() => {
    if (!variants.length || !activeLang) return null;
    return variants.find((v) => v.lang === activeLang) || null;
  }, [variants, activeLang]);

  const activeCaptions =
    activeVariant && Array.isArray(activeVariant.config) && activeVariant.config.length
      ? activeVariant.config
      : captions;

  // In fixture mode there is no campaign and so no variant; the chosen fixture
  // says which way it reads instead. That is what lets the Arabic layout be
  // checked with no backend, no Arabic film and no data from the ministry.
  const isRtl = isFixtureMode()
    ? Boolean(activeFixtureRtl)
    : Boolean(activeVariant?.rtl);

  // Two ways a language is reached, and the variant says which.
  //
  // A language on another campaign is a different link, so it is a navigation:
  // the campaign id in the URL changes and the recipient id does not. That
  // works because a recipient id identifies the person, not their place on a
  // campaign - the same uid opens the same person's statement on either one,
  // and their variables are held against the person too, so the Arabic
  // campaign renders the same recipient's own data.
  //
  // The page reloads and the video restarts. That is inherent to the language
  // being a separate campaign; only a variant on this campaign can keep the
  // viewer's position.
  const switchLanguage = useCallback(
    (lang) => {
      const target = variants.find((v) => v.lang === lang);

      if (target?.campaignId) {
        try {
          const url = new URL(window.location.href);
          // Some links carry both ids in one parameter, as ?d=<campaign>_<uid>,
          // for trackers that truncate at the first '&'. Rewriting `id` alone
          // would leave that pair intact and put the viewer straight back on
          // the campaign they just left - so it is unpacked first, and the
          // recipient carried across explicitly.
          const combined = url.searchParams.get("d");
          if (combined) {
            const sep = combined.indexOf("_");
            if (sep !== -1) {
              url.searchParams.set("uid", combined.slice(sep + 1));
            }
            url.searchParams.delete("d");
          }
          url.searchParams.set("id", target.campaignId);
          window.location.assign(url.toString());
        } catch (error) {
          /* a failed navigation must not take the player down with it */
        }
        return;
      }

      setHasSwitched(true);
      setActiveLang(lang);
    },
    [variants]
  );

  useEffect(() => {
    const master = videoRef.current;
    if (!master || !altCandidate) return;
    const arm = () => setAltMounted(true);
    if (!master.paused) {
      arm();
      return;
    }
    master.addEventListener("playing", arm, { once: true });
    return () => master.removeEventListener("playing", arm);
  }, [videoRef, altCandidate]);

  // Carry the master's position onto the follower.
  //
  // Proportionally, because the two cuts are usually the same edit in another
  // language but rarely the same length.
  const alignFollower = useCallback(() => {
    const master = videoRef.current;
    const alt = altVideoRef.current;
    if (!master || !alt || !master.duration || !alt.duration) return;
    const want = mapTimeAcrossVariants(
      master.currentTime,
      master.duration,
      alt.duration
    );
    // Corrected on drift rather than on every tick: assigning currentTime to a
    // playing element stutters it, and "timeupdate" fires about four times a
    // second, which would be visible.
    if (Math.abs(alt.currentTime - want) > 0.3) alt.currentTime = want;
  }, [videoRef]);

  // Keep the follower aligned with the master - but only once it is actually
  // being watched.
  //
  // The follower is deliberately NOT played alongside the master from the
  // start. Doing that keeps it perfectly in step, but it also streams a second
  // film for every viewer, including the majority who never press the button,
  // which doubles the bandwidth of an ordinary view. It stays paused and
  // buffering instead, and is started on the first switch. The cost is a short
  // wait the first time someone chooses another language, which is the one
  // moment a viewer has asked for something and will tolerate one.
  useEffect(() => {
    const master = videoRef.current;
    const alt = altVideoRef.current;
    if (!master || !alt || !altVariant || !isAltShowing) return;

    const follow = () => {
      alignFollower();
      if (master.paused && !alt.paused) alt.pause();
      else if (!master.paused && alt.paused) alt.play().catch(() => {});
    };

    follow();
    master.addEventListener("timeupdate", follow);
    master.addEventListener("seeked", follow);
    master.addEventListener("play", follow);
    master.addEventListener("pause", follow);
    return () => {
      master.removeEventListener("timeupdate", follow);
      master.removeEventListener("seeked", follow);
      master.removeEventListener("play", follow);
      master.removeEventListener("pause", follow);
    };
  }, [videoRef, altVariant, altMounted, isAltShowing, alignFollower]);

  // Move the audio to whichever film is in front.
  useEffect(() => {
    if (!hasSwitched) return;
    const master = videoRef.current;
    const alt = altVideoRef.current;
    if (!master) return;

    if (alt && isAltShowing) {
      // Seek before playing: while it was behind it was buffering, not
      // following, so its position is wherever it was last left.
      alignFollower();
      master.muted = true;
      alt.muted = false;
      if (!master.paused) alt.play().catch(() => {});
    } else {
      if (alt) {
        alt.muted = true;
        alt.pause();
      }
      master.muted = false;
    }
  }, [hasSwitched, isAltShowing, videoRef, alignFollower]);

  // Recipient variable map, used for conditions and data-bound elements.
  //
  // Text arrives already substituted, so it never needed this. Charts do: with
  // an empty map boundProportion returns 0 and a gauge draws its ring at zero
  // however its data actually reads.
  //
  // Fetched rather than baked in, because the substituted text in this config
  // cannot carry a number a chart can compute a fraction from. Behind a flag,
  // so with the API unset this is exactly the empty map it has always been.
  const [fetchedVariables, setFetchedVariables] = useState(null);

  useEffect(() => {
    // The first-load map makes this request redundant.
    if (isFixtureMode() || overlayVariables || !overlayVariablesEnabled()) return;
    let cancelled = false;
    try {
      const { campaignId, contact_id } = checkIfParamsArePresent() || {};
      fetchOverlayVariables(campaignId, contact_id).then((vars) => {
        if (!cancelled) setFetchedVariables(vars);
      });
    } catch {
      // Reading the URL must never stop the video playing.
    }
    return () => {
      cancelled = true;
    };
  }, []);

  // Three sources, in the order they should win:
  //
  //   overlayVariables   the map the play API sends in first load. One request,
  //                      already authenticated, already scoped to this contact.
  //   fetchedVariables   the separate /overlay/variables call, for a backend
  //                      that does not send the map yet.
  //   {}                 an older backend still. Conditions fail open and
  //                      render, which is how this behaved before either
  //                      source existed.
  //
  // Once every environment sends the map in first load, the fetch and the
  // route behind it can both go - see overlay_public.js, which says the same.
  const variables = isFixtureMode()
    ? fixtureVariables
    : overlayVariables || fetchedVariables || {};

  // Naming a font family in CSS does nothing unless the file is fetched, so the
  // families this config asks for are requested as soon as it arrives.
  //
  // Keyed on the overlay actually being shown, so an Arabic variant naming
  // Cairo or Tajawal has it fetched the moment that language is chosen. The
  // request is made once per family, so returning to a language already seen
  // costs nothing.
  useEffect(() => {
    ensureOverlayFonts(activeCaptions);
  }, [activeCaptions]);

  // Repeating rows are expanded to individual elements before anything else
  // runs, so keyframes, conditions, links and formatting all treat a repeated
  // cell exactly like a hand-placed one.
  const elements = useMemo(
    () => expandRepeaters(activeCaptions, variables),
    [activeCaptions, variables]
  );

  // Keyframed elements are animated imperatively against the video clock.
  //
  // Two reasons this does not go through React state: the "timeupdate" event
  // fires only about four times a second, which is far too coarse for smooth
  // movement, and re-rendering every overlay element at 60fps does not scale to
  // the element counts this engine now has to carry. Elements WITHOUT keyframes
  // are untouched by this and keep rendering through React exactly as before.
  const elRefs = useRef([]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !Array.isArray(elements)) return;

    const animated = elements
      .map((c, i) => ({ c, i }))
      .filter(({ c }) => hasKeyframes(c));

    const hasChapters = Array.isArray(chapters) && chapters.length > 0;
    if (animated.length === 0 && !hasChapters) return;

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let frame;
    let lastSeekTarget = null;

    const tick = () => {
      const t = video.currentTime;

      // Jump over chapters this recipient should not see. Adjacent skips are
      // collapsed upstream into a single target, so playback never lands inside
      // another excluded range.
      if (hasChapters) {
        const target = chapterSkipTarget(chapters, t, variables);
        if (target !== null && Math.abs(t - target) > 0.01) {
          // Guard against re-issuing the same seek every frame while the browser
          // is still servicing it.
          if (lastSeekTarget !== target || t < target - 0.25) {
            lastSeekTarget = target;
            video.currentTime = target;
          }
          frame = requestAnimationFrame(tick);
          return;
        }
        if (target === null) lastSeekTarget = null;
      }

      for (const { c, i } of animated) {
        const node = elRefs.current[i];
        if (!node) continue;

        // With reduced motion, hold the final keyframe instead of travelling.
        const kfs = normalizeKeyframes(c);
        const sampleTime = reduceMotion ? kfs[kfs.length - 1].t : t;
        const sample = sampleElement(c, sampleTime);

        node.style.top = `${sample.y * videoHeight}px`;
        node.style.left = `${sample.x * videoWidth}px`;
        node.style.width = `${sample.w * 100}%`;
        node.style.height = `${sample.h * 100}%`;
        node.style.opacity = String(sample.opacity);

        // Data-driven fill for bar and arc: how far the value reaches (bind)
        // multiplied by how far the animation has run (progress).
        const bound = boundProportion(c, variables);
        if (bound > 0) {
          node.style.setProperty("--p", String(bound * sample.progress));
        }
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [elements, videoRef, videoHeight, videoWidth, variables, chapters]);


  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const handleTimeUpdate = () => {
        setCurrentTime(video.currentTime);
      };
      video.addEventListener("timeupdate", handleTimeUpdate);
      return () => video.removeEventListener("timeupdate", handleTimeUpdate);
    }
  }, [videoRef]);

  // Overlay positions are stored as fractions of the RENDERED video box, so the
  // box must be re-measured whenever it changes size. Measuring once on load (the
  // previous behaviour) left every element misplaced after a resize or rotation.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const measure = () => {
      const w = video.clientWidth;
      const h = video.clientHeight;
      // Ignore transient zero sizes while the element is laying out.
      if (w > 0 && h > 0) {
        setVideoWidth((prev) => (prev === w ? prev : w));
        setVideoHeight((prev) => (prev === h ? prev : h));
      }
    };

    measure();

    let observer;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(measure);
      observer.observe(video);
    } else {
      window.addEventListener("resize", measure);
    }

    video.addEventListener("loadedmetadata", measure);
    video.addEventListener("loadeddata", measure);
    window.addEventListener("orientationchange", measure);

    return () => {
      if (observer) observer.disconnect();
      else window.removeEventListener("resize", measure);
      video.removeEventListener("loadedmetadata", measure);
      video.removeEventListener("loadeddata", measure);
      window.removeEventListener("orientationchange", measure);
    };
  }, [videoRef]);

  // Body of a single overlay element, chosen by type. Unknown types fall back to
  // text so an unrecognised config can never render as a blank box.
  const renderElementBody = (caption) => {
    const type = elementType(caption);

    if (type === "box") return null;

    if (type === "image") {
      const src = resolveRef(caption.src, variables);
      if (!src) return null;
      return (
        <img
          src={src}
          alt={caption.alt || ""}
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
          onError={(e) => {
            // A missing image must not leave a broken icon over the film.
            e.currentTarget.style.display = "none";
          }}
        />
      );
    }

    if (type === "bar") {
      const vertical = caption.orientation !== "horizontal";
      return (
        <span
          style={{
            position: "absolute",
            background: caption.boxcolor || "#B2832Cff",
            ...(vertical
              ? { left: 0, right: 0, bottom: 0, height: "calc(var(--p, 0) * 100%)" }
              : { left: 0, top: 0, bottom: 0, width: "calc(var(--p, 0) * 100%)" }),
          }}
        />
      );
    }

    if (type === "arc") {
      // What the ring fills to and what it reads in the middle are not always
      // the same quantity. A workforce donut fills by the share that is
      // limited-skill and reads the headcount - binding one to the other makes
      // it impossible to show both.
      //
      // So an explicit `text` wins for the label, with its {placeholders}
      // resolved like any other text, and `bind` is left to drive the fill.
      // Without a `text` this behaves exactly as before: the bound value,
      // formatted, which is what every gauge that only shows its own reading
      // already relies on.
      const gaugeBound = caption.bind
        ? resolveRef({ var: caption.bind.value }, variables)
        : undefined;

      const explicitLabel =
        typeof caption.text === "string" && caption.text
          ? caption.text.replace(/\{(\w+)\}/g, (whole, name) =>
              variables[name] !== undefined ? String(variables[name]) : whole
            )
          : undefined;

      const gaugeLabel =
        explicitLabel !== undefined
          ? explicitLabel
          : gaugeBound !== undefined && gaugeBound !== null && gaugeBound !== ""
          ? formatValue(gaugeBound, caption.format)
          : caption.text;

      // Circumference of r=45 in a 100x100 viewBox, used as the dash length so
      // stroke-dashoffset can express progress as a fraction.
      const CIRC = 2 * Math.PI * 45;
      return (
        <svg
          viewBox="0 0 100 100"
          style={{ width: "100%", height: "100%", overflow: "visible" }}
          aria-hidden="true"
        >
          <circle
            cx="50" cy="50" r="45"
            fill="none"
            stroke={caption.trackcolor || "#00000018"}
            strokeWidth={(caption.strokewidth || 0.02) * 500}
          />
          <circle
            cx="50" cy="50" r="45"
            fill="none"
            stroke={caption.strokecolor || "#B2832Cff"}
            strokeWidth={(caption.strokewidth || 0.02) * 500}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
            style={{
              strokeDasharray: CIRC,
              strokeDashoffset: `calc(${CIRC} * (1 - var(--p, 0)))`,
            }}
          />
          {/* The reading inside the ring. Without it a gauge drew its arc and
              showed no number at all, which is the one thing a gauge is for.
              Rendered only when there is something to show, so an arc with no
              bound value and no label is unchanged. */}
          {gaugeLabel !== "" && gaugeLabel !== undefined && gaugeLabel !== null && (
            <text
              x="50"
              y="50"
              textAnchor="middle"
              dominantBaseline="central"
              fill={caption.fontcolor || "#111111"}
              fontFamily={caption.fontname || undefined}
              fontWeight={caption?.textStyle?.B ? "bold" : undefined}
              // The viewBox is 100 units tall whatever the element's real size,
              // so the stored share-of-video font size is scaled into it.
              fontSize={
                caption.textbox_h
                  ? Math.max(6, (Number(caption.fontsize) / Number(caption.textbox_h)) * 100)
                  : 22
              }
            >
              {gaugeLabel}
            </text>
          )}
        </svg>
      );
    }

    // text and link
    const bound = caption.bind ? resolveRef({ var: caption.bind.value }, variables) : undefined;
    if (bound !== undefined) return formatValue(bound, caption.format);

    // Text usually arrives already substituted, because generation resolves it
    // per recipient. Two cases reach here unresolved:
    //
    //   a repeated row, where expandRepeaters sets text to the column's
    //   variable NAME - printing "owner1_name" instead of the person
    //
    //   a {placeholder} written by hand, which nothing downstream expands
    //
    // Both are only resolvable once the variable map exists, which it now does.
    // A name or placeholder with no matching value is left exactly as it is,
    // so nothing that works today changes.
    const text = caption.text;
    if (typeof text === "string" && text) {
      if (/\{\w+\}/.test(text)) {
        return text.replace(/\{(\w+)\}/g, (whole, name) =>
          variables[name] !== undefined ? String(variables[name]) : whole
        );
      }
      if (text === caption.variable_name && variables[text] !== undefined) {
        return formatValue(variables[text], caption.format);
      }
    }
    return text;
  };

  const renderCaptions = () => {
    return elements.map((caption, index) => {
      // A failing condition removes the element entirely rather than hiding it.
      if (!shouldRender(caption, variables)) return null;

      const s = sampleElement(caption, currentTime);

      // Destinations come from per-recipient data, so they are validated before
      // reaching the DOM. Anything not http(s) renders as plain text instead.
      const href = safeHref(resolveRef(caption.href, variables));
      const isLink = Boolean(href);
      const Tag = isLink ? "a" : "div";

      const linkProps = isLink
        ? {
            href,
            target: "_blank",
            rel: "noopener noreferrer",
            // Deliberately does NOT call pauseAllVideos(): that is the option
            // panel's behaviour. An overlay link must not interrupt playback.
            onClick: (e) => {
              e.stopPropagation();
              // Reporting must never be able to break navigation.
              try {
                onLinkClick?.(caption.variable_name, href);
              } catch {
                /* ignore */
              }
            },
          }
        : {};

      return (
        <Tag
          key={index}
          className={isLink ? styles.overlayLink : undefined}
          {...linkProps}
          ref={(node) => {
            elRefs.current[index] = node;
          }}
          style={{
            // The layer stays click-through except where a link exists.
            pointerEvents: isLink ? "auto" : "none",
            cursor: isLink ? "pointer" : undefined,
            userSelect: "none",
            position: "absolute",
            zIndex: caption.z || 0,
            fontSize: `${caption.fontsize * videoHeight}px`,
            top: `${s.y * videoHeight}px`,
            left: `${s.x * videoWidth}px`,
            height: `${s.h * 100}%`,
            width: `${s.w * 100}%`,
            color: caption.fontcolor,
            background:
              elementType(caption) === "bar" || elementType(caption) === "arc"
                ? "transparent"
                : caption.boxcolor,
            textAlign: caption.alignment,
            opacity: s.opacity,
            // The editor offers a font picker and a wrap toggle. Both were
            // stored and neither was applied here, so a config that looked
            // right in the editor arrived in a different typeface, and Wrap
            // Text did nothing at all.
            fontFamily: caption.fontname || undefined,
            whiteSpace: caption.wrap_text ? "normal" : "nowrap",
            // radius is a fraction of the element's own height, resolved here
            // against the rendered height so rounding scales with the video.
            borderRadius: `${(Number(caption.radius) || 0) * s.h * videoHeight}px`,
            // Without this a rounded card would still show square corners on
            // whatever it contains - an image, or a bar's fill.
            overflow: Number(caption.radius) > 0 ? "hidden" : undefined,
            fontWeight: `${caption?.textStyle?.B}`,
            fontStyle: `${caption?.textStyle?.I}`,
            // An anchor underlines itself, and the template above yields the string
            // "undefined" when no style is set - which overrides nothing.
            textDecoration: caption?.textStyle?.U || "none",
          }}
        >
          {renderElementBody(caption)}
        </Tag>
      );
    });
  };

return (
    <div ref={hostRef} className="flex justify-center items-center h-full">
      <div
        style={{
          // Sized to the picture, not to the space available. The caption
          // layer is a child of this box and the overlay's fractions are
          // relative to it, so letterbox bars left inside here put every
          // element off by the height of the bars.
          ...(pictureBox
            ? { width: pictureBox.w + "px", height: pictureBox.h + "px" }
            : { height: "100%" }),
          overflow: "hidden",
          position: "relative",
          display: "flex",
          alignItem: "center",
          justifyContent: "center",
        }}
      >
        {personalizedVideoUrl && (
          <video
            ref={personalizedVideoRef}
            src={`${personalizedVideoUrl}#t=0.001`}
            className="h-full object-cover absolute top-0 bottom-0 z-[-10]"
            poster={posterUrl}
            onClick={handleVideoClick}
            onError={handleVideoError}
            onEnded={updatePersonalizedVideoTime}
            onLoadedMetadata={updatePersonalizedVideoTime}
            muted
            playsInline
            preload="auto"
            allowFullScreen
          />
        )}

        {/* Main Video */}
        {/*
          Overlay positions are fractions of the video ELEMENT box, measured
          with clientWidth/clientHeight above. `object-cover` made that box and
          the picture inside it two different rectangles: the picture was
          cropped to fill, so elements landed where the viewer could not see
          them. Portrait campaigns hid this for as long as they ran, because
          their box aspect already matched the video; a 16:9 master does not.

          The wrapper is now sized to the picture, so filling it here leaves
          box and picture identical - which is what the fractions always
          assumed. Where the two already agreed, nothing changes.
        */}
        <video
          id="webRenderVideo"
          ref={videoRef}
          src={videoSrc}
          className="w-full h-full"
          style={{ objectFit: "contain" }}
          onLoadedMetadata={(e) => {
            const v = e.currentTarget;
            if (v.videoWidth && v.videoHeight) {
              setVideoAspect(v.videoWidth / v.videoHeight);
            }
          }}
          poster={posterUrl}
          onClick={handleVideoClick}
          onError={handleVideoError}
          muted
          autoPlay
          playsInline
          preload="auto"
          allowFullScreen
        />

        {/*
          The alternate-language film.

          Always muted in markup and brought forward only by the effects above,
          so it can never autoplay audibly on top of the master. It sits above
          the master but below the personalized intro clip, which keeps its own
          priority for the window in which it plays, and below the captions.

          Preload is "metadata" until this film is the one being watched, which
          is the whole bandwidth story: "auto" would pull a second complete film
          down for every viewer, and the majority never press the button.
          Metadata rather than "none" because the proportional position mapping
          needs this film's duration, and that arrives with the header alone.
        */}
        {altVariant && altMounted && (
          <video
            ref={altVideoRef}
            src={`${altVariant.videoUrl}#t=0.001`}
            className="w-full h-full absolute top-0 left-0"
            style={{
              objectFit: "contain",
              zIndex: isAltShowing ? 5 : -20,
            }}
            poster={posterUrl}
            onClick={handleVideoClick}
            onError={handleVideoError}
            muted
            playsInline
            preload={isAltShowing ? "auto" : "metadata"}
          />
        )}

        {/* dir is set from the variant being shown, not from the page, so a
            right-to-left overlay stays right-to-left only while its own
            language is selected. Element positions are fractions of the video
            box and are unaffected; this governs how the words inside each box
            are ordered and aligned. */}
        <div className="caption-container z-[999]" dir={isRtl ? "rtl" : "ltr"}>
          {renderCaptions()}
        </div>

        {/* Shown only when the campaign actually carries more than one
            language, so every existing campaign looks exactly as it did. */}
        {variants.length > 1 && (
          <div
            className="absolute bottom-3 right-3 flex gap-1 rounded-md bg-black/60 p-1"
            style={{ zIndex: 1000 }}
          >
            {variants.map((v) => (
              <button
                key={v.lang}
                type="button"
                lang={v.lang}
                dir={v.rtl ? "rtl" : "ltr"}
                aria-pressed={activeLang === v.lang}
                onClick={() => switchLanguage(v.lang)}
                className={`rounded px-2 py-1 text-xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                  activeLang === v.lang
                    ? "bg-white text-black"
                    : "text-white hover:bg-white/20"
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Legacy VideoCaptioner — preserved exactly as it was before overlay engine v2 */
/* -------------------------------------------------------------------------- */
export function VideoCaptionerLegacy({
  currentQuestionData,
  videoSrc,
  captions,
  videoRef,
  personalizedVideoRef,
  posterUrl,
  handleVideoClick,
  handleVideoError,
  updatePersonalizedVideoTime,
}) {
  const [currentTime, setCurrentTime] = useState(0);
  const [videoHeight, setVideoHeight] = useState(1);
  const [videoWidth, setVideoWidth] = useState(1);

  const personalizedVideoUrl =
    currentQuestionData.current?.personaliz_video_url;

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const handleTimeUpdate = () => {
        setCurrentTime(video.currentTime);
      };
      video.addEventListener("timeupdate", handleTimeUpdate);
      return () => video.removeEventListener("timeupdate", handleTimeUpdate);
    }
  }, [videoRef]);

  const renderCaptions = () => {
    return captions.map((caption, index) => {
      const shouldShow =
        currentTime >= caption.start_time && currentTime <= caption.end_time;

      return (
        <div
          key={index}
          style={{
            pointerEvents: "none",
            userSelect: "none",
            position: "absolute",
            fontSize: `${caption.fontsize * videoHeight}px`,
            top: `${caption.textbox_y * videoHeight}px`,
            left: `${caption.textbox_x * videoWidth}px`,
            height: `${caption.textbox_h * 100}%`,
            width: `${caption.textbox_w * 100}%`,
            color: caption.fontcolor,
            background: caption.boxcolor,
            textAlign: caption.alignment,
            opacity: `${shouldShow ? "1" : "0"}`,
            fontWeight: `${caption?.textStyle?.B}`,
            fontStyle: `${caption?.textStyle?.I}`,
            // An anchor underlines itself, and the template above yields the string
            // "undefined" when no style is set - which overrides nothing.
            textDecoration: caption?.textStyle?.U || "none",
          }}
        >
          {caption.text}
        </div>
      );
    });
  };

  return (
    <div className="flex justify-center h-full">
      <div
        style={{
          height: "100%",
          overflow: "hidden",
          position: "relative",
          display: "flex",
          alignItem: "center",
          justifyContent: "center",
        }}
      >
        {personalizedVideoUrl && (
          <video
            ref={personalizedVideoRef}
            src={`${personalizedVideoUrl}#t=0.001`}
            className="h-full object-cover absolute top-0 bottom-0 z-[-10]"
            poster={posterUrl}
            onClick={handleVideoClick}
            onError={handleVideoError}
            onEnded={updatePersonalizedVideoTime}
            onLoadedMetadata={updatePersonalizedVideoTime}
            muted
            playsInline
            preload="auto"
            allowFullScreen
          />
        )}

        {/* Main Video */}
        <video
          id="webRenderVideo"
          ref={videoRef}
          src={videoSrc}
          className="h-full object-cover"
          poster={posterUrl}
          onClick={handleVideoClick}
          onError={handleVideoError}
          muted
          autoPlay
          playsInline
          preload="auto"
          allowFullScreen
          onLoadedData={() => {
            const videoElement = document.getElementById("webRenderVideo");
            if (videoElement) {
              setVideoHeight(1 * videoElement.clientHeight);
              setVideoWidth(1 * videoElement.clientWidth);
            }
          }}
        />

        <div className="caption-container z-[999]">{renderCaptions()}</div>
      </div>
    </div>
  );
}