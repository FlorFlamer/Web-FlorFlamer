"use client";

import { useHud } from "@/lib/hud-store";
import HomeScene from "./home/homescene";
import AboutScene from "./About/aboutscene";
import ProjectsScene from "./Projects/projectscene";
import ContactScene from "./Contact/contactscene";

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
