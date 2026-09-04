import MainEntryPoint from "./components/Main Entry Point/MainEntryPoint";
import { AlertProvider } from "./context/AlertContext";

/**
 * Static metadata, on purpose.
 *
 * The stock player builds this per recipient: `generateMetadata` reads the
 * query string, asks our API for that campaign's thumbnail and branding, and
 * returns an OpenGraph card so a shared link previews with the right image.
 *
 * Two reasons it cannot stay:
 *
 *   - It runs on the server and reads searchParams, which forces Next to
 *     render this route dynamically. A statically exported build - the whole
 *     point of an on-premise hand-over - is then impossible.
 *   - It would be a call to Personaliz on every page load, which is exactly
 *     what this deployment exists to remove.
 *
 * What is lost is the personalised link preview. For a statutory report that
 * is arguably a gain: nothing about the recipient leaks into a WhatsApp or
 * email preview card.
 */
export const metadata = {
  title: "Establishment Executive Summary",
  description: "Your establishment's statement.",
};

export default function Home() {
  // "none" rather than null: the loader and the player both test for that
  // exact string, and anything else shows the Personaliz bar. The deployment
  // is white-label - the page is the host's.
  return (
    <AlertProvider>
      <MainEntryPoint server_personaliz_branding="none" />
    </AlertProvider>
  );
}
