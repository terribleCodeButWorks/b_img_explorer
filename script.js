const makeQuery = (pageNumber, nPerPage) => {
  return {
    "v": 3,
    "q": {
      "find": {
        "out.s1": "19HxigV4QyBv3tHpQVcUEQyq1pzZVdoAut",
        "out.s3": {
          "$regex": "^image"
        }
      },
      "skip": pageNumber > 0 ? ((pageNumber - 1) * nPerPage) : 0,
      "limit": 2
    },
    "r": {
      "f": "[.[] | { lb2: .out[0].lb2, s3: .out[0].s3 }]"
    }
  }
};
const LoadingStatus = document.querySelector('#status')
const toB64 = (q) => {
  return btoa(JSON.stringify(q))
}
const N_PER_PAGE = 3

const makeURL = (pageNumber) => {
  return "https://genesis.bitdb.network/q/1FnauZ9aUH2Bex6JzdcV4eNX7oLSSEbxtN/" + toB64(makeQuery(pageNumber, N_PER_PAGE))
}
const Gallery = document.querySelector("#elements")
const TheHole = document.querySelector('#theHole')

var header = {
  headers: {
    key: "1KJPjd3p8khnWZTkjhDYnywLB2yE1w5BmU"
  }
};

let CurrentPage = 0
let LatestPage = 0

async function fetchData() {
  let p = CurrentPage += 1
  LoadingStatus.innerHTML = 'Fetching...'
  await fetch(makeURL(p), header)
    .then(function(r) {
      return r.json()
    })
    .then(function(r) {
      var result = r.c;
      result.forEach((a) => {
        if (!!a.lb2) {
          let src = "data:" + a.s3 + ";base64, " + a.lb2
          let e = makeElement(a.s3, src, p)

          Gallery.insertAdjacentHTML('beforeend', e)
        }
      })
    })
  LatestPage += 1

  LoadingStatus.innerHTML = 'Done:)'
}

function makeElement(type, src, page) {
  if (type === 'image/svg+xml') { // can not render svg correctly now
    return '<embed class="page_' + page + '" width="100%" >'
  }
  let e = '<embed class="page_' + page + '" src="' + src + '" width="100%" >'
  return e
}

window.onscroll = () => {
  let secondLatestImg = Gallery.lastChild.previousElementSibling.previousElementSibling.previousElementSibling// earlier fetching for better UX
  let secondLatestPage = secondLatestImg.className.split("_")[1]
  if (secondLatestPage <= CurrentPage) { // 2nd latest fetching done
    if (secondLatestImg.getBoundingClientRect().top < window.screen.height) { // when 2nd latest image appear in screen
      if (CurrentPage - LatestPage < 10) { // max pending fetch is 10
        fetchData()
      }
    }
  }
}

let main = async function() {
  await fetchData()
  await fetchData()
}

main()
