const content = document.querySelector("#content")
const btnClick = document.querySelector("#btnSearch");
const contentSearch = document.querySelector("#contentSearch");
let copyWord = "";
const partOfSpeeches = [
  {
    name : "verb",
    abbreviation : "v",
    styleColor : "text-primary"
  },
  {
    name : "noun",
    abbreviation : "n",
    styleColor : "text-secondary"
  },
  {
    name : "adjective",
    abbreviation : "adj",
    styleColor : "text-success"
  },
  {
    name : "adverb",
    abbreviation : "adv",
    styleColor : "text-danger"
  },
  {
    name : "conjunction",
    abbreviation : "conjunction",
    styleColor : "text-warning"
  },
  {
    name : "determiner",
    abbreviation : "determiner",
    styleColor : "text-info"
  },
  {
    name : "preposition",
    abbreviation : "prep",
    styleColor : "text-dark"
  },
  {
    name : "pronoun",
    abbreviation : "pronoun",
    styleColor : "text-black-50"
  },
  {
    name : "interjection",
    abbreviation : "interjection",
    styleColor : "text-black-50"
  },
  {
    name : "exclamation",
    abbreviation : "exclamation",
    styleColor : "text-black-50"
  }
]
function setClipboard(text) {
  var type = "text/plain";
  var blob = new Blob([text], { type });
  var data = [new ClipboardItem({ [type]: blob })];

  navigator.clipboard.write(data).then(
      function () {
        const btnCopy = document.querySelector("#btnCopy")
        btnCopy.classList.add("btn-success");
        btnCopy.textContent = "copied!"
      },
      function () {
        alert("copying is failure")
      }
  );
}
function getDataFromAPI(word){
  fetch(`https://api.dictionaryapi.dev/api/v2/entries/en_US/${word}`)
  .then(data => {
    if(!data.ok){
      throw new Error("notFound")
    }
    else{
      return data.json();
    }
  })
  .then(data=>{ 
    renderContent(data)
  })
  .catch(err=>{
    console.log(err)
  })
}
function renderContent(data){
  copyWord = copyWord + data[0].word +" /"+ data[0].phonetic +"/ ";
  let meanings = data[0].meanings.reduce((total,value)=>{
    let partOfSpeech = partOfSpeeches.find((partOfSpeech)=>{
      let regexPartOfSpeech = new RegExp(value.partOfSpeech,"i")
      return regexPartOfSpeech.test(partOfSpeech.name.trim()) === true;
    })
    copyWord = copyWord + ` (${partOfSpeech.abbreviation}) `
    let div = `
    <div class="p-2">
      <h3 class="${partOfSpeech.styleColor}">${partOfSpeech.name}</h3>
      <ul class="list-group">
        ${
          value.definitions.reduce((previousValue,currentValue)=>{
            return (previousValue+`<li class="list-group-item">${currentValue.definition}</li>`)
          },"")
        }
      </ul>
    </div>`
    return (total+div)
  },"")
  let contentHTML = `
      <div class="d-flex flex-row justify-content-between align-items-center">
        <h1 class="m-0">${data[0].word}</h1>
        <div class="btn-group">
          <button id="btnPlay" class="btn btn-info">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-volume-up" viewBox="0 0 16 16">
              <path d="M11.536 14.01A8.473 8.473 0 0 0 14.026 8a8.473 8.473 0 0 0-2.49-6.01l-.708.707A7.476 7.476 0 0 1 13.025 8c0 2.071-.84 3.946-2.197 5.303l.708.707z"/>
              <path d="M10.121 12.596A6.48 6.48 0 0 0 12.025 8a6.48 6.48 0 0 0-1.904-4.596l-.707.707A5.483 5.483 0 0 1 11.025 8a5.483 5.483 0 0 1-1.61 3.89l.706.706z"/>
              <path d="M10.025 8a4.486 4.486 0 0 1-1.318 3.182L8 10.475A3.489 3.489 0 0 0 9.025 8c0-.966-.392-1.841-1.025-2.475l.707-.707A4.486 4.486 0 0 1 10.025 8zM7 4a.5.5 0 0 0-.812-.39L3.825 5.5H1.5A.5.5 0 0 0 1 6v4a.5.5 0 0 0 .5.5h2.325l2.363 1.89A.5.5 0 0 0 7 12V4zM4.312 6.39 6 5.04v5.92L4.312 9.61A.5.5 0 0 0 4 9.5H2v-3h2a.5.5 0 0 0 .312-.11z"/>
            </svg>
          </button>
          <audio id="audioPhonetic">
            <source src="https://${data[0].phonetics[0].audio}" type="audio/mpeg">
          </audio>
          <button class="btn" id="btnCopy">copy</button>
        </div>
      </div>
      <div style="height:2px;background-color:#333" class="m-1"></div>
    <h3>phonetic: /${data[0].phonetic}/</h2>
    ${meanings}
  `
  content.innerHTML = contentHTML;
  const btnPlay = document.querySelector("#btnPlay")
  const audioPhonetic = document.querySelector("#audioPhonetic")
  const btnCopy = document.querySelector("#btnCopy");
  btnPlay.addEventListener("click",(event)=>{
    audioPhonetic.play()
  })
  btnCopy.addEventListener("click",(event)=>{
    setClipboard(copyWord)
  })  
}
btnClick.addEventListener("click",(event)=>{
  copyWord = "";
  getDataFromAPI(contentSearch.value.trim());
})  
contentSearch.addEventListener("keypress",(event)=>{
  if(event.keyCode === 13){
    copyWord = ""
    getDataFromAPI(contentSearch.value.trim()) 
  }
    
})
chrome.tabs.query({active: true, currentWindow: true}, tabs => {
  chrome.tabs.sendMessage(tabs[0].id,"getSelection",function(res){
    if(res !== ""){
      getDataFromAPI(res)
    }
  })
});