/**
 *      const pause = Pause(100);
 *      await pause.start();
 *
 * @param ms milliseconds
 * @returns
 */
export const Pause = (ms: number) => {
    const controller = new AbortController();
    const signal = controller.signal;
    const promise = new Promise<void>(function (resolve) {
        let timeoutHandle = 0;

        function handleAbortEvent() {
            if (timeoutHandle !== null) {
                clearTimeout(timeoutHandle);
            }
            signal.removeEventListener("abort", handleAbortEvent);
            resolve(signal.reason);
        }

        if (signal.aborted) {
            resolve(signal.reason);
        }

        signal.addEventListener("abort", handleAbortEvent, {
            once: true,
        });

        timeoutHandle = setTimeout(function () {
            signal.removeEventListener("abort", handleAbortEvent);

            resolve();
        }, ms) as unknown as number;
    });
    return { start: () => promise, cancel: () => controller.abort("cancel") };
}
