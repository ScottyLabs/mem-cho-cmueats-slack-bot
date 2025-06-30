const sites = process.env.MONITORED_URLS?.split(",");
const checkSite = (
  url: string,
  onError: (error: any) => any,
  onSuccess: (data: any) => any
) => {
  console.log(`Running check for ${url}`);
  fetch(url, { signal: AbortSignal.timeout(3000) })
    .then(onSuccess)
    .catch(onError);
};
const isCurrentlyDown: Record<string, boolean> = {};

export const setUpUptimeChecker = (
  sendMessage: (msg: string) => Promise<any>
) => {
  setInterval(() => {
    sites?.forEach((site) =>
      checkSite(
        site,
        (error) => {
          console.log(`check failed for ${site}`);

          if (!isCurrentlyDown[site]) {
            sendMessage(
              `<!channel> ${site} is down with error "${error}"!! Sending <3`
            );
            isCurrentlyDown[site] = true;
          }
        },
        () => {
          console.log(`check successful for ${site}`);
          if (isCurrentlyDown[site]) {
            sendMessage(`${site} is back up!`);
            isCurrentlyDown[site] = false;
          }
        }
      )
    );
  }, 5000);
};
