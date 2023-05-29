let arrURL_objects = [];

function handleFile(input) {
  const file = input.files[0];
  const reader = new FileReader();
  const selectFileButton = document.querySelector(".selectFile > button");
  const checkbox = document.getElementById("myCheckbox");
  const searchForm__inputUrl = document.querySelector(".searchForm__inputUrl");
  const searchForm__inputQuery = document.querySelector(
    ".searchForm__inputQuery"
  );
  const searchForm__button = document.querySelector(".searchForm__button");

  if (!file) {
    alert("Select file");
    return null;
  }

  selectFileButton.textContent = file.name;
  searchForm__button.addEventListener("click", searchForm_handler);

  /**Read File.xlsx*/
  reader.onload = function (event) {
    const data = new Uint8Array(event.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]; //Excel tab 1
    const tableData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    const tableBody = document.querySelector(".outputTable__body");

    /**Create objects with URL and data*/
    const headerURL_index = tableData[0].findIndex(
      (elem) => elem.toLowerCase() === "url"
    );

    tableData.forEach((row, index) => {
      if (index !== 0) {
        arrURL_objects.push({
          [Symbol("addedIndex")]: index.toString(),
          url: row[headerURL_index],
          totalPage: 0,
          targetPage: 0,
          thematicIndex: index,
        });
      }
    });

    /**Create and fill row in table*/
    createTableRow(arrURL_objects);
    console.log(arrURL_objects);

    /**Enable inputs field*/
    checkbox.disabled = false;
    searchForm__inputUrl.disabled = false;
    searchForm__inputQuery.disabled = false;
    searchForm__button.disabled = false;

    /**Filter table column*/
    checkbox.addEventListener("change", (ev) => {
      while (tableBody.firstChild) {
        tableBody.removeChild(tableBody.firstChild); //clear table
      }

      if (ev.target.checked) {
        //is checkbox active?
        let sortedArrURL_objects = [...arrURL_objects].sort(compareURLObject);
        createTableRow(sortedArrURL_objects);
      } else {
        createTableRow(arrURL_objects);
      }
    });
  };
  reader.onerror = (err) => {
    console.log("File reader Error:", err);
  };
  reader.readAsArrayBuffer(file);
}

function searchForm_handler(ev) {
  const formData = new FormData(ev.target);
  const searchForm__inputUrl = document.querySelector(".searchForm__inputUrl");

  ev.preventDefault();

  /**Input validate*/
  if (formData.get("searchForm__inputUrl")) {
    let allObjValues = [];

    for (const urlObj of arrURL_objects) {
      allObjValues.push(Object.values(urlObj));
    }
    if (allObjValues.includes(formData.get("searchForm__inputUrl"))) {
      formData.set("urlQueryCount", "oneUrl");
      searchForm__inputUrl.classList.remove("unvalid");
      searchForm__inputUrl.setCustomValidity("");
    } else {
      searchForm__inputUrl.classList.add("unvalid");
      searchForm__inputUrl.setCustomValidity("this URL is not in the table");
      return null;
    }
  } else {
    formData.set("urlQueryCount", "all");
  }
}

function createTableRow(arrURL_objects) {
  const tableBody = document.querySelector(".outputTable__body");

  for (const row of arrURL_objects) {
    const tableRow = document.createElement("tr");

    for (const [key, value] of Object.entries(row)) {
      const tableCell = document.createElement("td");
      tableCell.textContent = value;
      tableCell.addEventListener("click", userClickOnCell_handler);
      tableRow.appendChild(tableCell);
    }
    tableBody.appendChild(tableRow);
  }
}

function userClickOnCell_handler(ev) {
  const text = ev.target.textContent;
  navigator.clipboard.writeText(text);

  ev.target.classList.toggle("highlight");
  setTimeout(() => {
    ev.target.classList.remove("highlight");
  }, 1000);
}

function compareURLObject(a, b) {
  return b.thematicIndex - a.thematicIndex;
}
