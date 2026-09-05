/**
 * The data source for an on-premise deployment.
 *
 * The stock player gets everything from one call to the Personaliz API: the
 * video address, the overlay, the recipient's values and a session, all in a
 * single response. That is convenient for us and impossible for a client who
 * requires that nothing reach our servers.
 *
 * So the same information is split in two, and both halves are plain files
 * served from the host's own domain:
 *
 *   video_<campaign>.json   the overlay and the video address. No personal
 *                           data in it, identical for every recipient, safe to
 *                           cache forever.
 *   contact1.json           one recipient's values.
 *
 * Both are fetched at runtime rather than bundled, which is the point:
 * `fetchRecipient` is the single seam. Swap its body for a call to the host's
 * own API - passing the token already in the play URL - and the deployment is
 * live with real data. Nothing else in the player changes, because everything
 * downstream reads the returned map by name and does not care where it came
 * from.
 */

/**
 * Where the two files live, relative to wherever the player is hosted.
 *
 * The default is the real folder name, not a placeholder: a clone of this
 * repository has no .env of its own (they are gitignored, and rightly), so a
 * default that named anything else would 404 on both files and render an
 * empty player. Every setting in this build works the same way - correct with
 * no configuration, overridable when a host needs something different.
 */
const BASE = process.env.NEXT_PUBLIC_ONPREM_BASE || "/onprem";

/** Which recipient to load when the host has not wired their own API yet. */
const SAMPLE_RECIPIENT = "contact1";

async function getJson(url) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  return res.json();
}

/**
 * The campaign's overlay. One file, every recipient.
 * @param {string} campaignId  `id` in the play URL
 */
export function fetchCampaign(campaignId) {
  return getJson(`${BASE}/video_${campaignId}.json`);
}

/**
 * One recipient's values.
 *
 * THIS is the function a host replaces. It receives the token already present
 * in the play URL and must return `{ variables: { name: value, ... } }` - the
 * names being the ones the overlay references. Nothing else is required of it.
 *
 * @param {string} contactId  `uid` in the play URL
 */
export function fetchRecipient(contactId) {
  // Replace this line with a call to your own service, e.g.
  //   return getJson(`https://your-api/statement/${contactId}`);
  return getJson(`${BASE}/${SAMPLE_RECIPIENT}.json`);
}

/**
 * Assembles the response the player expects, from those two files.
 *
 * The shape is the stock API's, deliberately: the player is left untouched, so
 * it stays mergeable with upstream and there is one obvious place - here -
 * where an on-premise deployment differs.
 */
export async function loadFirstLoad(campaignId, contactId) {
  const [campaign, recipient] = await Promise.all([
    fetchCampaign(campaignId),
    fetchRecipient(contactId).catch(() => ({ variables: {} })),
  ]);

  const video = campaign.video_url;
  const question = {
    video_url: video,
    // Deliberately absent.
    //
    // personaliz_video_url is the per-recipient film the old render path
    // produced with ffmpeg. A web-overlay campaign has no such thing - the
    // template is the same for everyone and the personalisation is drawn over
    // it live. Populating it anyway mounts a second <video> above the first,
    // object-fit: cover, which crops a 16:9 film to the player box and takes
    // the overlay's measurements with it.
    personaliz_video_url: null,
    // The name matters: handleVideoError falls back to `original_s3url`, and
    // reading a field that is not there sets the src to the string
    // "undefined" - so a recoverable CDN hiccup turns into a dead player
    // rather than a retry. Same film either way; there is no second copy to
    // fall back to in this build.
    original_s3url: video,
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
      campaign_name: campaign.name || campaignId,
      // No session is created: there is no server to hold one.
      session_id: null,
      questions: question,
      dynamic_text_display: {
        type: campaign.dynamic_text_display?.type || "web",
        config: campaign.dynamic_text_display?.config || [],
        variables: recipient.variables || {},
        // Language variants, each carrying its own film and its own wording.
        // The switch button only renders when there is more than one, so a
        // single-language campaign is unaffected by this being passed through.
        languages: campaign.dynamic_text_display?.languages || [],
        defaultLang:
          campaign.defaultLang ||
          campaign.dynamic_text_display?.defaultLang ||
          null,
      },
      chapters: campaign.chapters || [],
      // GlobalStoreContext JSON.parse()s these and dereferences the result
      // without guarding, so they have to be present AND be JSON strings.
      videoConfig: {
        is_RTL: campaign.rtl ? 1 : 0,
        country_code: "AE",
        widget_view: JSON.stringify({
          desktop_video_view: {
            landing_page: { video_view: "landscape", display_options: "on_video" },
          },
        }),
        font_obj: JSON.stringify({ font_name: "Cairo" }),
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
      // The player tests this against the literal "none" - a falsy value is
      // not the same thing and still renders the bar. White-label is the
      // point here: the page belongs to the host, not to us.
      personaliz_branding: "none",
    },
  };
}
