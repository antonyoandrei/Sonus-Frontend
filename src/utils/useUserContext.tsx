import { useContext } from "react";
import { userContext } from "../context/user-context";

export const useUserContext = () => useContext(userContext);
