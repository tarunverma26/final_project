import React from "react";
import WeatherAtmosphere from "./WeatherAtmosphere";

export default function RainLayer({ count = 35 }) {
  return <WeatherAtmosphere rainCount={count} />;
}
