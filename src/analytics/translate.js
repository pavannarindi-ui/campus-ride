export async function translateText(text, targetLang) {

  const res = await fetch(
    `https://api.mymemory.translated.net/get?q=${text}&langpair=en|${targetLang}`
  );

  const data = await res.json();

  return data.responseData.translatedText;
}