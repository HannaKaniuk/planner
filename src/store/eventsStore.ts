import { useStore } from "./store";

export const useEvents = () => {
  const events = useStore((state) => state.events);
  const setEvents = useStore((state) => state.setEvents);
  const addEvent = useStore((state) => state.addEvent);
  const updateEvent = useStore((state) => state.updateEvent);

  return { events, setEvents, addEvent, updateEvent };
};
