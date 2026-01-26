"use client";

import { useHud } from "@/lib/hud-store";
import HomeScene from "./home/HomeScene";
import AboutScene from "./About/AboutScene";
import ProjectsScene from "./Projects/ProjectsScene";
import ContactScene from "./Contact/ContactScene";

export default function SceneRouter() {
  const { currentChannel } = useHud();

  switch (currentChannel) {
    case "about":
      return <AboutScene />;
    case "projects":
      return <ProjectsScene />;
    case "contact":
      return <ContactScene />;
    case "home":
    default:
      return <HomeScene />;
  }
}
