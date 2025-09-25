import { z, ZodType, ZodTypeAny } from "zod";
const generalLocationSchema = z.object({
  properties: z.object({
    forecast: z.string(),
  }),
});
const forecastSchema = z.object({
  properties: z.object({
    periods: z.array(
      z.object({
        name: z.string(),
        detailedForecast: z.string(),
      })
    ),
  }),
});
const rootApiURL = "https://api.weather.gov/points/40.4442,-79.9396";
const fetchData = async <UWU extends ZodTypeAny>(
  url: string,
  schema: UWU,
  retriesLeft = 3
) => {
  try {
    const data = schema.parse(await (await fetch(url)).json()) as z.infer<UWU>;
    return data;
  } catch (e) {
    if (retriesLeft === 1) throw e;
    return fetchData(url, schema, retriesLeft - 1);
  }
};
export async function getTodaysWeather() {
  const generalLocationData = await fetchData(
    rootApiURL,
    generalLocationSchema
  );
  const forecastURL = generalLocationData.properties.forecast;
  const forecast = await fetchData(forecastURL, forecastSchema);
  let weatherToday: string | undefined, weatherTonight: string | undefined;
  for (const entry of forecast.properties.periods) {
    if (entry.name === "Today") {
      weatherToday = entry.detailedForecast;
    }
    if (entry.name === "Tonight") {
      weatherTonight = entry.detailedForecast;
    }
  }
  return `おはよう! Here's today's weather forecast for CMU, Pittsburgh\n\n*Today:* ${
    weatherToday ?? "Unavailable"
  }\n\n*Tonight:* ${weatherTonight ?? "Unavailable"}`;
}
