// Listen for messages from the main script
self.onmessage = event => {
    try {
        const { headers, parameters, method } = event.data.options;
        const isUrlencoded =
            headers["Content-Type"] === "application/x-www-form-urlencoded";
        let { url, body } = event.data.options;

        if (Object.keys(parameters).length) {
            url += "?" + new URLSearchParams(parameters);
        }

        if (method === "HREF") {
            self.postMessage({ type: "redirect", url });
            return;
        }

        if (method === "POST" && isUrlencoded) {
            body = new URLSearchParams(body ?? {});
        }

        if (method === "POST" && !isUrlencoded) {
            body = JSON.stringify(body ?? null)
        }

        const options =
            method === "POST"
                ? {
                      headers,
                      body,
                      method,
                  }
                : { headers, method };

        const request = new Request(url, options);

        return fetch(request)
            .then(async res => {
                const clone = res.clone();
                const text = clone.text();

                try {
                    return [res.ok, await res.json()]
                } catch (_) {
                    return [res.ok, await text]
                }
            })
            .then(res => {
                // Process the response data
                if (res[0]) self.postMessage({ id: event.data.id, data: res[1] });
                else throw res[1];
            })
            // TODO: remove catch
            .catch(error => {
                self.postMessage({ id: event.data.id, error });
            });
    } catch (error) {
        self.postMessage({ id: event.data.id, error });
    }
};
