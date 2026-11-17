import { useContext } from "react";
import { PlayerContext, type PlayerContextValue } from "../context/player-context";

export const usePlayer = (): PlayerContextValue => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("PlayerProvider is missing from the application tree");
  }
  return context;
};
