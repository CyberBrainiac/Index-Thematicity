const searchForm__button = document.querySelector(".searchForm__button");
const searchForm = document.querySelector(".searchForm");
const searchForm__helps = document.querySelectorAll(".searchForm__help");

let arrURL_objects = [];
searchForm.addEventListener("submit", searchForm_handler);
searchForm__helps.forEach((elem) => {
  elem.addEventListener("click", searchForm__help_handler);
});

function handleFile(input) {
  const file = input.files[0];
  const reader = new FileReader();
  const selectFileButton = document.querySelector(".selectFile > button");
  const checkbox = document.getElementById("myCheckbox");
  const searchForm__inputUrl = document.querySelector(".searchForm__inputUrl");
  const searchForm__inputQuery = document.querySelector(
    ".searchForm__inputQuery"
  );

  if (!file) {
    alert("Select file");
    return null;
  }

  selectFileButton.textContent = file.name;

  /**Read File.xlsx*/
  reader.onload = function (event) {
    const data = new Uint8Array(event.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]; //Excel tab 1
    const tableData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    /**Create objects with URL and data*/
    const headerURL_index = tableData[0].findIndex(
      (elem) => elem.toLowerCase() === "url"
    );

    tableData.forEach((row, index) => {
      if (index !== 0) {
        arrURL_objects.push({
          [Symbol("addedIndex")]: index.toString(),
          url: row[headerURL_index],
          totalPage: '',
          targetPage: '',
          thematicIndex: '',
        });
      }
    });

    /**Create and fill row in table*/
    createTableRow(arrURL_objects);

    /**Enable inputs field*/
    checkbox.disabled = false;
    searchForm__inputUrl.disabled = false;
    searchForm__inputQuery.disabled = false;
    searchForm__button.disabled = false;

    /**Filter table column*/
    checkbox.addEventListener("change", sortThematicIndex); 
  };

  reader.onerror = (err) => {
    console.log("File reader Error:", err);
  };
  reader.readAsArrayBuffer(file);
}

function searchForm_handler(ev) {
  ev.preventDefault();
  const formData = new FormData(this);
  const searchForm__inputUrl = document.querySelector(".searchForm__inputUrl");
  let urlArr = [];

  for (const urlObj of arrURL_objects) {
    Object.entries(urlObj).forEach( ([key, value]) => {if(key === 'url') urlArr.push(value)});
  }

  /**Input validate*/
  // if(formData.get("inputQuery")) {
  //   searchForm__inputUrl.classList.remove("unvalid");
  //   searchForm__inputQuery.setCustomValidity('');
  // } else {
  //   searchForm__inputUrl.classList.add("unvalid");
  //   searchForm__inputQuery.setCustomValidity('Write query to Google');
  // }

  if (formData.get("inputUrl")) {
    if (urlArr.includes(formData.get("inputUrl"))) {
      formData.set("url", JSON.stringify( [formData.get("inputUrl")]));
      searchForm__inputUrl.classList.remove("unvalid");
    } else {
      searchForm__inputUrl.classList.add("unvalid");
      alert("This URL is not in file.xlxs");
      return null;
    }
  } else {
    formData.set("url", JSON.stringify(urlArr));
  }

  /**Call Google API*/
  searchForm__button.disabled = true;
  arrURL_objects = connectApi(arrURL_objects, formData);
}

function sortThematicIndex(ev) {
  if (ev.target.checked) {
    //is checkbox active?

    let sortedArrURL_objects = [...arrURL_objects].sort(compareURLObject);
    createTableRow(sortedArrURL_objects);
  } else {
    createTableRow(arrURL_objects);
  }
}

function searchForm__help_handler() {
  const searchForm__help_information = this.children[1];
  searchForm__help_information.classList.toggle('activeInformation');
}

function createTableRow(arrURL_objects) {
  const tableBody = document.querySelector(".outputTable__body");

  /**Clear table row*/
  while (tableBody.firstChild) {
    tableBody.removeChild(tableBody.firstChild); //clear table
  }

  /**Create table row*/
  for (const urlObj of arrURL_objects) {
    const tableRow = document.createElement("tr");

    for (const [key, value] of Object.entries(urlObj)) {
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

/**Async connectAPI answer*/
function asyncReturnValue(arrURL) {
  const checkbox = document.getElementById("myCheckbox");

  checkbox.checked = false;
  arrURL_objects = arrURL;

  createTableRow(arrURL_objects);
  searchForm__button.disabled = false;
}
