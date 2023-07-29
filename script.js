
// States 
let currentPage = 1;
let lastPage = 100

let movies = [];


// SELECTOR 

const movieCardContainer = document.getElementById("movies-card-container");
const prevButton = document.getElementById("prev-button");
const nextButton = document.getElementById("next-button");
const pageNumberButton = document.getElementById("current-page-button");

// --- search selector

const searchButton  = document.getElementById("search-button");
const searchInput = document.getElementById("search-input");
const sortByDateButton = document.getElementById("sort-by-date");
const sortByRatingButton = document.getElementById("sort-by-rating");

//  --- tab selector 

const allTabButton = document.getElementById("all-tab")
const favTabButton = document.getElementById("favorites-tab")


// ------------- LOCAL HOST GET AND SET MOVIES ------------- 


function getMovesFromLocalStorage() {
    const allTheFavMovieString = JSON.parse(localStorage.getItem("favMovie"))

    if(allTheFavMovieString === null || allTheFavMovieString === undefined) {
        return [];
    } else {
        return allTheFavMovieString;
    }

}


function setMoviesToLocalStorage(movie) {
    const allFavMovie = getMovesFromLocalStorage()

    const arrayOfMovies = [...allFavMovie, movie]

    localStorage.setItem("favMovie", JSON.stringify(arrayOfMovies))
}

function removeFavMovieFromLocalStorage(id) {
    const favMoviesid = getMovesFromLocalStorage();
    const filteredMovies = favMoviesid.filter((movieId) => movieId != id)
    localStorage.setItem("favMovie", JSON.stringify(filteredMovies))
}


//----  Fetch the movies from certain page..

async function fetchMovieWithId(id) {
    const url = `https://api.themoviedb.org/3/movie/${id}?api_key=1d74637b7e220a87c6b16fdf4f4422bc`
    const response = await fetch(url)
    const dataList = await response.json();
    console.log(dataList);

        return {
            title: dataList.title,
            voteAverage: dataList.vote_average,
            posterPath: dataList.poster_path,
            popularity: dataList.popularity,
            id: dataList.id,
            
        }
}

async function fetchAllMovie(pageNumber) {
    try {

        const options = {
            method: 'GET',
            headers: {
              accept: 'application/json',
              Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxZDc0NjM3YjdlMjIwYTg3YzZiMTZmZGY0ZjQ0MjJiYyIsInN1YiI6IjY0OTI5NTIxNGJhNTIyMDEzOTM4NjgwZCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.BbAuKH_x-5TD-ZbNVyLN8CHKZHmkZSqaH_369-Otv3k'
            }
          };

        const url = `https://api.themoviedb.org/3/movie/top_rated?language=en-US&page=${pageNumber}`
        const response = await fetch(url, options)
        let data = await response.json();

        // Lets set the Last Page Value

        const {total_pages} = data
        lastPage =total_pages;
    

        const changedData = remapData(data)
        
        movies = changedData;
        
        renderMovies(changedData)
        return changedData;


    } catch(error) {
        console.log("error is here");
    }
}

function remapData(data) {
    const moviesList = data.results;
    const modifiedMovieList = moviesList.map(movie => {
        return {
            title: movie.title,
            voteAverage: movie.vote_average,
            posterPath: movie.poster_path,
            popularity: movie.popularity,
            id: movie.id
        }
    })
    return modifiedMovieList;
}

fetchAllMovie(currentPage)


// ----- rendering the movies (All) ----------- 

function clearMovieContainer() {
    movieCardContainer.innerHTML = ""
}

function renderMovies(moviesList) {

    const favMovieList = getMovesFromLocalStorage(); 
    console.log(favMovieList, "favMovieList debug")
     
    clearMovieContainer()

    console.log("movie List", moviesList) 
    moviesList.forEach(movie => {
        const {popularity, posterPath, title, voteAverage, id} = movie

        const isfavMovie = favMovieList.indexOf(id+"") > -1
        
        const cardDiv = document.createElement("div");
        cardDiv.classList.add('card')

        const posterUrl = 'https://image.tmdb.org/t/p/original'+posterPath

        const img_section=document.createElement("img")

        img_section.src = posterUrl;
        img_section.classList.add('poster');

        const card_body=document.createElement("p");
        card_body.classList.add("title");
        //card_body.innerHTML=title
        
        cardDiv.appendChild(img_section)
        cardDiv.appendChild(card_body)

        const votesfavorites=document.createElement('div');
        votesfavorites.classList.add('votes-favorites');

        const votes=document.createElement("div");
        votes.classList.add('votes');

        const overviewp1=document.createElement('p')//2
        overviewp1.classList.add('card-content')
        overviewp1.innerHTML=`Votes: ${voteAverage}`
        const overviewp2=document.createElement('p')//2
        overviewp2.classList.add('card-content')
        overviewp2.innerHTML=`Rating: ${popularity}`


        votes.appendChild(overviewp1);
        votes.appendChild(overviewp2);


        const favorites=document.createElement('div');
        favorites.classList.add('favorites');
        favorites.innerHTML=` <i id="${id}" class="fa-regular fa-heart ${isfavMovie ? 'fa-solid' : ''}"></i>`

        
        votesfavorites.appendChild(votes);
        votesfavorites.appendChild(favorites);
        
        cardDiv.appendChild(votesfavorites);
        


        const gridContainer = document.getElementById("movies-card-container");
        
        gridContainer.appendChild(cardDiv);


      
        const favItemButton = document.getElementById(id);

        favItemButton.addEventListener("click", (event) => {
            const hearSignElement = event.target
            const {id} = hearSignElement

         
            if(favItemButton.classList.contains('fa-solid')){

                removeFavMovieFromLocalStorage(id)

                favItemButton.classList.remove("fa-solid")

            } else {
                setMoviesToLocalStorage(id);

                favItemButton.classList.add('fa-solid')
            }
        })


        

    })
}

async function renderFavMovies() {
    clearMovieContainer()

    const favMovieList = getMovesFromLocalStorage(); // id[240, 290]

    const favMovieListData = [];

    for (let index = 0; index < favMovieList.length; index++) {
        const movieId = favMovieList[index];

        const response = await fetchMovieWithId(movieId)

        favMovieListData.push(response);

        
    }

    console.log(favMovieListData, "favMovieListData debug")

    renderMovies(favMovieListData) 

}

async function searchMovies(movieName) {
    try {

        const url = `https://api.themoviedb.org/3/search/movie?query=${movieName}&api_key=1d74637b7e220a87c6b16fdf4f4422bc`

        const response = await fetch(url)
        const data = await response.json();

        const changedData = remapData(data)
        renderMovies(changedData)

    } catch(error) {
        console.log("error iss here");
    }
}

function displayMovies() {

    if (favTabButton.classList.contains('active-tab')) {
        sortByDateButton.style.display = "none";
        sortByRatingButton.style.display = "none";

        renderFavMovies()
    } else if(allTabButton.classList.contains('active-tab')) {
        sortByDateButton.style.display = "inline-block";
        sortByRatingButton.style.display = "inline-block";
        renderMovies(movies)
    }
}


// Favourites Tab

function showFav(favMovie) {

    const {popularity, posterPath, title, voteAverage} = favMovie


    const cardDiv = document.createElement("div");
        cardDiv.classList.add('card')

        const posterUrl = 'https://image.tmdb.org/t/p/original'+posterPath

        const img_section=document.createElement("img")

        img_section.src = posterUrl;
        img_section.classList.add('poster');

        const card_body=document.createElement("p");
        card_body.classList.add("title");
        card_body.innerHTML=title
        
        cardDiv.appendChild(img_section)
        cardDiv.appendChild(card_body)

        const votesfavorites=document.createElement('div');
        votesfavorites.classList.add('votes-favorites');

        const votes=document.createElement("div");
        votes.classList.add('votes');

        const overviewp1=document.createElement('p')//2
        overviewp1.classList.add('card-content')
        overviewp1.innerHTML=`Votes: ${voteAverage}`
        const overviewp2=document.createElement('p')//2
        overviewp2.classList.add('card-content')
        overviewp2.innerHTML=`Rating: ${popularity}`


        votes.appendChild(overviewp1);
        votes.appendChild(overviewp2);


        const favorites=document.createElement('div');
        favorites.classList.add('favorites');
        favorites.innerHTML=` <i id="${id}" class="fa-regular fa-heart ${isfavMovie ? 'fa-solid' : ''}"></i>`

        
        votesfavorites.appendChild(votes);
        votesfavorites.appendChild(favorites);
        
        cardDiv.appendChild(votesfavorites);


}

function switchTab(event) {
    allTabButton.classList.remove("active-tab");
    favTabButton.classList.remove("active-tab");

    const whoClickedMe = event.target;
    whoClickedMe.classList.add('active-tab');

    displayMovies()
}



// Listners 

prevButton.disabled = true;


nextButton.addEventListener("click", () => {

    currentPage++;

    // Work 1: call API for new Page.

    fetchAllMovie(currentPage);

    // Work 2: update the page number in the HTML

    pageNumberButton.innerHTML = ` Current Page: ${currentPage}`
    

    if(currentPage === 1) {
        prevButton.disabled = true;
    } else if (currentPage === 2) {
        prevButton.disabled = false;
    } else if(currentPage === lastPage) {
        nextButton.disabled = true;
    }
    

});

prevButton.addEventListener("click", () => {
    currentPage--;
    console.log("current Page Debug", currentPage, lastPage)

    fetchAllMovie(currentPage);

    pageNumberButton.innerHTML = ` Current Page: ${currentPage}`    


    if(currentPage === 1) {
        prevButton.disabled = true;
    } else if (currentPage === 2 && currentPage !== lastPage -1) {
        prevButton.disabled = false;
    } else if (currentPage === lastPage -1) {
        nextButton.disabled = false;
    }

});


const searchButtonCallbackFunction =  () => {
    const query = searchInput.value;
    searchInput.value = "";

    searchMovies(query)

}

const debouncedSearchButtonCallbackFunction =  searchButtonCallbackFunction // This is what you need to implement

searchButton.addEventListener("click", debouncedSearchButtonCallbackFunction)

//======= Sorting =========

sortByRatingButton.addEventListener("click", async () => {
    const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: 'Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxZDc0NjM3YjdlMjIwYTg3YzZiMTZmZGY0ZjQ0MjJiYyIsInN1YiI6IjY0OTI5NTIxNGJhNTIyMDEzOTM4NjgwZCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.BbAuKH_x-5TD-ZbNVyLN8CHKZHmkZSqaH_369-Otv3k'
 }
      };
      
      const response = await fetch('https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc', options);
      const data = await response.json()
       
      const changedData = remapData(data)
      renderMovies(changedData)
})

// --- Fav and all tab 

allTabButton.addEventListener("click", switchTab );
favTabButton.addEventListener("click", switchTab );


movieCardContainer.addEventListener("click", (event) => {
    console.dir(movieCardContainer)
})