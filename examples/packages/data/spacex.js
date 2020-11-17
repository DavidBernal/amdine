define(['http/fetch'], async function(fetch) {
  const url = 'https://ll.thespacedevs.com/2.0.0/launch/?format=json&mode=list&search=SpaceX'
  const data = await fetch(url);
  return data;
});
