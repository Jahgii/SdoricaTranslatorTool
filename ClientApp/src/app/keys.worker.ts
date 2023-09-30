/// <reference lib="webworker" />

addEventListener('message', async ({ data }) => {
  while (data.keys.length > 0) {
    let keysSet = data.keys.splice(0, data.uploadStackSize);
    var promise = fetch(`api/${data.url}`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": `Bearer ${data.token}`
      },
      body: JSON.stringify(keysSet)
    });

    await promise.then(
      async r => {
        var message = { finish: false, keysUploaded: 0, keysReplaced: undefined, i: data.threadIndex };
        var replacedKeys = await r.json() as string[];
        message.keysUploaded = keysSet.length;
        message.keysReplaced = replacedKeys as any;
        postMessage(message);
      },
      error => {
      }
    );
  }
  var message = { finish: true, i: data.threadIndex };
  postMessage(message);
});
