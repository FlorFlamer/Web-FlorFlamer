import NavBar from "./navbar";
import ChannelDisplay from "./channeldisplay";
import HelpButton from "./helpbutton";
import SettingsButton from "./settingsbutton";
import MusicToggle from "./musicbutton";

const styles = {
  bottomLeftCluster: {
    position: "fixed" as const,
    left: 24,
    bottom: 24,
    display: "flex",
    alignItems: "center",
    gap: 12,
    pointerEvents: "auto" as const,
  },
  bottomRight: {
    position: "fixed" as const,
    right: 24,
    bottom: 24,
    pointerEvents: "auto" as const,
  },
};

export default function Hud() {
  return (
    <>
      <NavBar />

      <div style={styles.bottomLeftCluster}>
        <SettingsButton />
        <HelpButton />
        <MusicToggle />
      </div>

      <div style={styles.bottomRight}>
        <ChannelDisplay />
      </div>
    </>
  );
}
