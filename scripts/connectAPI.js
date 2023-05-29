function connectApi(arrURL_objects, settings) {
  /**CHANGE 2 VALUES BELOW AND SAVE*/

  const cx = "62fa1c39e6b7f4a66"; //identeficator of programmatic seach engine
  const apiKey = "AIzaSyB6jxLovSRB87xAoxImfXzweaf3kKUWexg"; //your API key

  /**CHANGE 2 VALUES ABOVE AND SAVE*/

  const parameters = {};
  const request = `https://www.googleapis.com/customsearch/v1?[${parameters}]`;
  const exactTerms = "windows"; //define phrase contained in the search result
  const hl = "en"; //define language, optimize search speed and result
  const lr = "en"; //define search page language
  const linkSite = "techwibe.com";
  const q = ""; //request

  // const sites = ["techwibe.com", "hackread.com", "rswebsols.com", "macobserver.com", "cointiply.com", "lowendmac.com", "computertechreviews.com", "codecondo.com", "programminginsider.com", "dashtech.org", "computingforgeeks.com", "imcgrupo.com", "knowtechie.com", "marketbusinessnews.com"];
  const sites = ["techwibe.com", "hackread.com"];

  const searchInTitle = async (site) => {
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=intitle:%22windows%22%20site:${site}&fields=searchInformation`;
    const response = await fetch(url);
    const json = await response.json();
    console.log(
      site + " intitle:'windows'",
      json.searchInformation.totalResults
    );
    return json.searchInformation.totalResults;
  };

  const searchSite = async (site) => {
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=site:${site}&fields=searchInformation`;
    const response = await fetch(url);
    const json = await response.json();
    console.log(site, json.searchInformation.totalResults);
    return json.searchInformation.totalResults;
  };

  const calculateRatio = async () => {
    const ratios = [];
    for (const site of sites) {
      const windowsCount = await searchInTitle(site);
      const siteCount = await searchSite(site);
      const ratio = windowsCount / siteCount;
      ratios.push({ site, ratio });
    }
    return ratios;
  };

  calculateRatio()
    .then((ratios) => {
      console.table(ratios);
    })
    .catch((error) => {
      console.error(error);
    });

  return arrURL_objects;
}
