import { useState, useEffect } from "react";

/**
 * useDeviceId — generate/read UUID from localStorage key 'istoria_device_id'.
 * Used by Freedom Board for device-based daily posting limit.
 */
export function useDeviceId(): string {
  const [deviceId, setDeviceId] = useState("");

  useEffect(() => {
    let id = localStorage.getItem("istoria_device_id");
    if (!id) {
      // Generate a simple UUID
      id = crypto.randomUUID();
      localStorage.setItem("istoria_device_id", id);
    }
    setDeviceId(id);
  }, []);

  return deviceId;
}
