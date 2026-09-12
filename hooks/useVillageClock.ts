import { useEffect, useState } from "react";
import { AppState } from "react-native";
import { nightAmount } from "../store/model";
export function useVillageClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const update = () => setNow(new Date());
    const timer = setInterval(update, 15000);
    const sub = AppState.addEventListener("change", (s) => {
      if (s === "active") update();
    });
    return () => {
      clearInterval(timer);
      sub.remove();
    };
  }, []);
  return { now, night: nightAmount(now) };
}
