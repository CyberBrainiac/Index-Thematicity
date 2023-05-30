function connectApi(arrURL_objects, formData) {
  /**CHANGE 2 VALUES BELOW AND SAVE*/

  const cx = "62fa1c39e6b7f4a66"; //identeficator of programmatic seach engine
  const apiKey = "AIzaSyB6jxLovSRB87xAoxImfXzweaf3kKUWexg"; //your API key

  /**CHANGE 2 VALUES ABOVE AND SAVE*/

  const query = formData.get("inputQuery");
  const sites = JSON.parse(formData.get("url"));
  const errorContainer = document.querySelector(".errorContainer");

  while (errorContainer.firstChild) {
    errorContainer.removeChild(errorContainer.firstChild); //clear error container
  }

  calculateIndex()
    .then((arrURL_objects) => {
      asyncReturnValue(arrURL_objects);
    })
    .catch((error) => {
      alert("something broken ;(");
      console.error(error);
    });

  async function calculateIndex() {
    for (const site of sites) {
      await waitDONTspum();
      const targetPage = await searchWithQuery(site);
      let thematicIndex = 0;

      for (const obj of arrURL_objects) {
        if (obj.url === site) {
          if (targetPage === null) {
            obj.targetPage = "";
          } else {
            obj.targetPage = targetPage;
          }

          /**If we have totalPage value, we wont do one more request*/
          if (obj.totalPage) {
            thematicIndex = targetPage / obj.totalPage;
            let truncatedThematicIndex = Number(thematicIndex.toFixed(4));
            obj.thematicIndex = truncatedThematicIndex;
          } else {
            await waitDONTspum();
            const totalPage = await searchSite(site);

            if (totalPage === null) {
              obj.totalPage = "";
              obj.thematicIndex = "";
            } else {
              thematicIndex = targetPage / totalPage;
              let truncatedThematicIndex = Number(thematicIndex.toFixed(4));
              obj.thematicIndex = truncatedThematicIndex;
              obj.totalPage = totalPage;
            }
          }
        }
      }
      createTableRow(arrURL_objects); //update table in real time
    }

    return arrURL_objects;
  }

  async function searchWithQuery(site) {
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(
      query
    )}%20site:${site}&fields=searchInformation`;
    let response;

    try {
      response = await fetch(url);
    } catch (error) {
      console.error(error);
    }

    if (response.ok) {
      console.log(2);
      const json = await response.json();
      console.log(site, "target: ", json.searchInformation.totalResults);
      return json.searchInformation.totalResults;
    } else {
      checkHTTPError(response, site);
      return null;
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

    if (response.ok) {
      const json = await response.json();
      console.log(site, "total: ", json.searchInformation.totalResults);
      return json.searchInformation.totalResults;
    } else {
      checkHTTPError(response, site);
      return null;
    }
  }

  async function waitDONTspum() {
    setTimeout(() => {
      let a = "something";
    }, 100);
  }

  function checkHTTPError(response, site) {
    const errCode = response.status;
    let errorMessage = "";
    let paragraph = document.createElement("p");

    if (errCode === 429) {
      errorMessage = `Site: ${site}  ||  Error: quota for requests has run out`;
      console.log(errorMessage);
    } else if (errCode === 500) {
      errorMessage = `Site: ${site}  ||  Error: internal server error`;
      console.log(errorMessage);
    } else {
      errorMessage = `Site: ${site}  ||  Error code: ${errCode}`;
      console.error(errorMessage);
    }

    paragraph.textContent = errorMessage;
    errorContainer.appendChild(paragraph);
  }
}
