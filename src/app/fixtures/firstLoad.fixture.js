/**
 * A synthetic /video response — development only.
 *
 * Fixture mode blocks the Personaliz API, which keeps client data safe but also
 * leaves firstLoadData null. The overlay is gated on
 * `firstLoadData?.dynamic_text_display.type === "web"`, so with the API blocked
 * and nothing standing in for it the player renders no overlay at all: blocking
 * the call was never the same as answering it.
 *
 * This is the answer. It carries no client data - the campaign is invented and
 * the video is a local file.
 */

import { activeCaptions, activeFixtureName } from "./active.fixture";

const isStatement = activeFixtureName === "statement" || activeFixtureName === "statement-ar";
const isMohreAr = activeFixtureName === "mohre-ar";

/** All three masters live in public/. The two real films are gitignored: ~36MB each. */
const VIDEO = isMohreAr
  ? "/mohre-ar-base.mp4"
  : isStatement
  ? "/statement-base.mp4"
  : "/fixture-base.mp4";

export function fixtureFirstLoadResponse() {
  const question = {
    video_url: VIDEO,
    personaliz_video_url: VIDEO,
    original_s: VIDEO,
    type: "video",
    text: "",
    options: [],
    video_fit: "contain",
    delay_interaction: 0,
    is_firstquestion: true,
    isFirstQuestion: true,
    is_lead_trigger: false,
  };

  return {
    status: true,
    data: {
      campaign_name: isMohreAr
        ? "MOHRE Commitment POS AR (fixture)"
        : isStatement
        ? "Establishment Statement (fixture)"
        : "Overlay fixture",
      session_id: "fixture-session",
      questions: question,
      // The captions the player actually draws are taken from the fixture in
      // VideoContainer; this only has to pass the `type === "web"` gate.
      dynamic_text_display: { type: "web", config: activeCaptions },
      // GlobalStoreContext JSON.parse()s these five and dereferences the
      // result without guarding. An empty object therefore throws
      // `"undefined" is not valid JSON` before a <video> is ever mounted -
      // they have to be present AND be JSON strings, as the API sends them.
      videoConfig: {
        is_RTL: 0,
        country_code: "AE",
        widget_view: JSON.stringify({
          desktop_video_view: {
            landing_page: {
              video_view: "landscape",
              display_options: "on_video",
            },
          },
        }),
        font_obj: JSON.stringify({ font_name: "Montserrat" }),
        options_obj: JSON.stringify({}),
        numbered_list_obj: JSON.stringify({}),
        custom_header: JSON.stringify({}),
        end_screen: JSON.stringify({
          title: "",
          description: "",
          backgroundColor: "#ffffff",
          end_screen_logo: null,
        }),
      },
      website_scroll_config: null,
      show_restart_popup: false,
      translated_texts: null,
      video_consent: false,
      is_consent_video_url: false,
      personaliz_branding: false,
    },
  };
}

/** The contact lookup that runs before /video. */
export function fixtureContactResponse() {
  return { status: true, data: { contact_id: "fixture-contact" } };
}
