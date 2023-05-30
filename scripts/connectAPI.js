function connectApi(arrURL_objects, formData) {
  /**CHANGE 2 VALUES BELOW AND SAVE*/

  const cx = "62fa1c39e6b7f4a66"; //identeficator of programmatic seach engine
  const apiKey = "AIzaSyB6jxLovSRB87xAoxImfXzweaf3kKUWexg"; //your API key

  /**CHANGE 2 VALUES ABOVE AND SAVE*/


  const query = formData.get('inputQuery');
  const sites = JSON.parse(formData.get('url'));

  calculateRatio().then((arrURL_objects) => {
    asyncReturnValue(arrURL_objects);
  })
  .catch((error) => {
    alert("something broken ;(");
    console.error(error);
  });

  async function calculateRatio() {
    for (const site of sites) {

      await waitDONTspum();
      const targetPage = await searchWithQuery(site);
      let thematicIndex = 0;

      for (const obj of arrURL_objects) {
        if(obj.url === site) {
          obj.targetPage = targetPage;

          /**If we have totalPage value, we wont do one more request*/
          if(obj.totalPage) {
            thematicIndex = targetPage / obj.totalPage;
            let truncatedThematicIndex = Number(thematicIndex.toFixed(4));
            obj.thematicIndex = truncatedThematicIndex;

          } else {
            await waitDONTspum();
            const totalPage = await searchSite(site);
            thematicIndex = targetPage / totalPage;
            let truncatedThematicIndex = Number(thematicIndex.toFixed(4));
            obj.thematicIndex = truncatedThematicIndex;
            obj.totalPage = totalPage;
          }
        }
      }
      createTableRow(arrURL_objects) //update table in real time
    }

    return arrURL_objects;
  };

  async function searchWithQuery(site) {
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}%20site:${site}&fields=searchInformation`;
    let response;

    try {
      response = await fetch(url);
    } catch (error) {
      console.error(error);
    }

    if(response.ok) {
      console.log(2);
      const json = await response.json();
      console.log(
        site,
        "target: ",
        json.searchInformation.totalResults
      );
      return json.searchInformation.totalResults;
    } else {
      checkHTTPError(response.status);
      return '';
    }
  }

  async function searchSite(site) {
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=site:${site}&fields=searchInformation`;
    let response;

    try {
      response = await fetch(url);
    } catch (error) {
      console.error(error);
    }

    if(response.ok) {
      const json = await response.json();
      console.log(
        site, 
        "total: ",
        json.searchInformation.totalResults
      );
      return json.searchInformation.totalResults;
    } else {
      checkHTTPError(response.status);
      return '';
    }
  }

  async function waitDONTspum() {
    setTimeout(() => console.log("wait 500"), 500);
  }

  function checkHTTPError(errCode) {
    if(errCode === 429) {
      console.log("Error: too many request to google API");
    }
    else if(errCode === 500) {
      console.log("Error: internal server error");
    }
    else {
      console.error(`Error code: ${errCode}`);
    }
  }
}
