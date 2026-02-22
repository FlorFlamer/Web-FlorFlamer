"use client";

import { useHud } from "@/lib/hud-store";
import HomeScene from "./home/HomeScene";
import AboutScene from "./about/AboutScene";
import ProjectsScene from "./projects/ProjectsScene";
import ContactScene from "./contact/ContactScene";

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
