const search = document.getElementById("search");
const searchButton = document.getElementById("button-search");
const form = document.getElementById("form");
const SEARCHPATH = "https://api.themoviedb.org/3/search/movie?&api_key=c5a20c861acf7bb8d9e987dcc7f1b558&query=";
const main = document.getElementById("main");
const IMGPATH = "https://image.tmdb.org/t/p/w1280";
const searchTitle = document.getElementById("search-title");

function getClassByRate(vote){
    if (vote >= 8) {
        return 'green';
    }
    else if (vote >= 5) {
        return 'orange';
    }
    else {
        return 'red';
    }
}

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const searchTerm = search.value.trim();

    if (searchTerm) {
        getMovies(SEARCHPATH + searchTerm);
        searchTitle.innerHTML = 'Search Results for: ' + searchTerm;
        search.value = '';
    }
    else {
        searchTitle.innerHTML = 'Please enter a search term.';
    }
});

searchButton.addEventListener('click', (e) => {
    e.preventDefault();
    const searchTerm = search.value;

    if (searchTerm) {
        getMovies(SEARCHPATH + searchTerm);
        searchTitle.innerHTML = 'Search Results for: ' + searchTerm;
        search.value = '';
    }
    else {
        searchTitle.innerHTML = 'Please enter a search term.';
    }
});

function calculateMoviesToDisplay() {
    const screenWidth = window.innerWidth;
    if (screenWidth <= 689.9) return 10;
    if (screenWidth <= 1021.24) return 20;
    if (screenWidth <= 1353.74) return 21;
    if (screenWidth <= 1684.9) return 20;
    if (screenWidth <= 2017.49) return 20;
    if (screenWidth <= 2349.99) return 18;
    if (screenWidth <= 2681.99) return 21;
    if (screenWidth <= 3014.49) return 24;
    if (screenWidth <= 3345.99) return 27;
    if (screenWidth <= 3677.99) return 20;
    if (screenWidth <= 4009.99) return 22;
    if (screenWidth <= 4340.99) return 24;
    if (screenWidth <= 4673.49) return 26;
    if (screenWidth <= 5005.99) return 28;
    if (screenWidth <= 5337.99) return 30;
    if (screenWidth <= 5669.99) return 32;
    if (screenWidth <= 6001.99) return 34;
    if (screenWidth <= 6333.99) return 36;
    if (screenWidth <= 6665.99) return 38;
    if (screenWidth <= 6997.99) return 40;
    if (screenWidth <= 7329.99) return 42;
    if (screenWidth <= 7661.99) return 44;
    if (screenWidth <= 7993.99) return 46;
    if (screenWidth <= 8325.99) return 48;
    return 20;
}

async function getMovies(url) {
    clearMovieDetails();
    const numberOfMovies = calculateMoviesToDisplay();
    const pagesToFetch = numberOfMovies <= 20 ? 1 : 2;
    let allMovies = [];

    for (let page = 1; page <= pagesToFetch; page++) {
        const response = await fetch(`${url}&page=${page}`);
        const data = await response.json();
        allMovies = allMovies.concat(data.results);
    }

    const popularityThreshold = 0.5;

    allMovies.sort((a, b) => {
        const popularityDifference = Math.abs(a.popularity - b.popularity);
        if (popularityDifference < popularityThreshold) {
            return b.vote_average - a.vote_average;
        }
        return b.popularity - a.popularity;
    });

    if (allMovies.length > 0) {
        showMovies(allMovies.slice(0, numberOfMovies));
        document.getElementById('clear-search-btn').style.display = 'block';
    }
    else {
        main.innerHTML = `<p>No movie with the specified search term found. Please try again.</p>`;
        document.getElementById('clear-search-btn').style.display = 'none';
    }
}

document.getElementById('clear-search-btn').addEventListener('click', () => {
    window.location.reload();
});

function clearMovieDetails() {
    const companyDetailsContainer = document.getElementById('company-details-container');
    if (companyDetailsContainer) {
        companyDetailsContainer.innerHTML = '';
    }
}

function showMovies(movies){
    main.innerHTML = '';
    movies.forEach((movie) => {
        const { id, poster_path, title, vote_average, overview } = movie;
        const movieE1 = document.createElement('div');
        const voteAverage = vote_average.toFixed(1);
        movieE1.classList.add('movie');

        const movieImage = poster_path
            ? `<img src="${IMGPATH + poster_path}" alt="${title}" style="cursor: pointer;" />`
            : `<div class="no-image" style="text-align: center; padding: 20px;">Image Not Available</div>`;

        movieE1.innerHTML = `
            ${movieImage} 
            <div class="movie-info" style="cursor: pointer;">
                <h3>${title}</h3>
                <span class="${getClassByRate(vote_average)}">${voteAverage}</span>
            </div>
            <div class="overview" style="cursor: pointer;">
                <h4>Movie Overview: </h4>
                ${overview}
            </div>`;

        movieE1.addEventListener('click', () => {
            localStorage.setItem('selectedMovieId', id);
            window.location.href = 'movie-details.html';
        });

        main.appendChild(movieE1);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const companyId = localStorage.getItem('selectedCompanyId');
    if (companyId) {
        fetchCompanyDetails(companyId);
        fetchCompanyMovies(companyId);
    }
    else {
        const companyDetailsContainer = document.getElementById('company-details-container');
        companyDetailsContainer.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; text-align: center; width: 100vw;">
                <h2>Company details not found.</h2>
            </div>`;
    }
});

async function fetchCompanyDetails(companyId) {
    const url = `https://api.themoviedb.org/3/company/${companyId}?api_key=c5a20c861acf7bb8d9e987dcc7f1b558`;
    try {
        const response = await fetch(url);
        const company = await response.json();

        const logoImg = document.getElementById('company-logo');
        if (company.logo_path) {
            logoImg.src = `https://image.tmdb.org/t/p/w500${company.logo_path}`;
        }
        else {
            logoImg.style.display = 'none';
            const logoFallbackText = document.createElement('p');
            logoFallbackText.textContent = 'Logo Not Available';
            logoImg.parentNode.insertBefore(logoFallbackText, logoImg);
        }

        const fullCountryName = twoLetterCountryCodes.find(country => country.code === company.origin_country)?.name;

        document.getElementById('company-name').textContent = company.name || 'Name Not Available';
        document.getElementById('company-headquarters').textContent = company.headquarters || 'Headquarters Not Available';
        document.getElementById('company-country').textContent = fullCountryName || 'Country Not Available';
        document.title = `${company.name} - Company Details`;

        const homepage = company.homepage || '#';
        const companyWebsite = document.getElementById('company-website');
        if (homepage !== '#') {
            companyWebsite.href = homepage;
            companyWebsite.textContent = homepage;
        }
        else {
            companyWebsite.textContent = 'Website Not Available';
        }
    }
    catch (error) {
        console.error('Error fetching company details:', error);
        const companyDetailsContainer = document.getElementById('company-details-container');
        companyDetailsContainer.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; height: 100vh; text-align: center; width: 100vw;">
                <h2>Company details not found.</h2>
            </div>`;
    }
}

async function fetchCompanyMovies(companyId) {
    const url = `https://api.themoviedb.org/3/discover/movie?api_key=c5a20c861acf7bb8d9e987dcc7f1b558&with_companies=${companyId}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.results.length === 0) {
            const companyMoviesContainer = document.getElementById('company-movies-container');
            companyMoviesContainer.innerHTML = `<p>No movies found for this company.</p>`;
            return;
        }
        displayCompanyMovies(data.results);
    }
    catch (error) {
        console.error('Error fetching movies:', error);
    }
}

async function showMovieOfTheDay() {
    const year = new Date().getFullYear();
    const url = `https://api.themoviedb.org/3/discover/movie?api_key=c5a20c861acf7bb8d9e987dcc7f1b558&sort_by=vote_average.desc&vote_count.gte=100&primary_release_year=${year}&vote_average.gte=7`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        const movies = data.results;

        if (movies.length > 0) {
            const randomMovie = movies[Math.floor(Math.random() * movies.length)];
            localStorage.setItem('selectedMovieId', randomMovie.id);
            window.location.href = 'movie-details.html';
        }
        else {
            fallbackMovieSelection();
        }
    }
    catch (error) {
        console.error('Error fetching movie:', error);
        fallbackMovieSelection();
    }
}

let isSignedIn = JSON.parse(localStorage.getItem('isSignedIn')) || false;
updateSignInButton();

function handleSignInOut() {
    const signInOutButton = document.getElementById('googleSignInBtn');
    const signInOutText = signInOutButton.querySelector('span');
    const signInOutIcon = signInOutButton.querySelector('i');

    if (!isSignedIn) {
        signInOutText.textContent = 'Sign Out';
        signInOutIcon.className = 'fas fa-sign-out-alt';
        isSignedIn = true;
        localStorage.setItem('isSignedIn', isSignedIn);
        gapi.auth2.getAuthInstance().signIn();
    }
    else {
        signInOutText.textContent = 'Sign In';
        signInOutIcon.className = 'fas fa-sign-in-alt';
        isSignedIn = false;
        localStorage.setItem('isSignedIn', isSignedIn);
        gapi.auth2.getAuthInstance().signOut();
    }
}

function updateSignInButton() {
    const signInOutButton = document.getElementById('googleSignInBtn');
    const signInOutText = signInOutButton.querySelector('span');
    const signInOutIcon = signInOutButton.querySelector('i');
    if (isSignedIn) {
        signInOutText.textContent = 'Sign Out';
        signInOutIcon.className = 'fas fa-sign-out-alt';
    }
    else {
        signInOutText.textContent = 'Sign In';
        signInOutIcon.className = 'fas fa-sign-in-alt';
    }
}

function initClient() {
    gapi.load('auth2', function() {
        gapi.auth2.init({
            client_id: '154461832638-fpkleb6uhogkacq9k93721o8mjr2qc8t.apps.googleusercontent.com'
        });
    });
}

document.addEventListener("DOMContentLoaded", function() {
    updateSignInButton();
    initClient();
});

const twoLetterCountryCodes = [
    { name: 'Afghanistan', code: 'AF' },
    { name: 'Albania', code: 'AL' },
    { name: 'Algeria', code: 'DZ' },
    { name: 'American Samoa', code: 'AS' },
    { name: 'Andorra', code: 'AD' },
    { name: 'Angola', code: 'AO' },
    { name: 'Anguilla', code: 'AI' },
    { name: 'Antarctica', code: 'AQ' },
    { name: 'Antigua and Barbuda', code: 'AG' },
    { name: 'Argentina', code: 'AR' },
    { name: 'Armenia', code: 'AM' },
    { name: 'Aruba', code: 'AW' },
    { name: 'Australia', code: 'AU' },
    { name: 'Austria', code: 'AT' },
    { name: 'Azerbaijan', code: 'AZ' },
    { name: 'Bahamas', code: 'BS' },
    { name: 'Bahrain', code: 'BH' },
    { name: 'Bangladesh', code: 'BD' },
    { name: 'Barbados', code: 'BB' },
    { name: 'Belarus', code: 'BY' },
    { name: 'Belgium', code: 'BE' },
    { name: 'Belize', code: 'BZ' },
    { name: 'Benin', code: 'BJ' },
    { name: 'Bermuda', code: 'BM' },
    { name: 'Bhutan', code: 'BT' },
    { name: 'Bolivia', code: 'BO' },
    { name: 'Bonaire', code: 'BQ' },
    { name: 'Bosnia and Herzegovina', code: 'BA' },
    { name: 'Botswana', code: 'BW' },
    { name: 'Bouvet Island', code: 'BV' },
    { name: 'Brazil', code: 'BR' },
    { name: 'British Indian Ocean Territory', code: 'IO' },
    { name: 'Brunei Darussalam', code: 'BN' },
    { name: 'Bulgaria', code: 'BG' },
    { name: 'Burkina Faso', code: 'BF' },
    { name: 'Burundi', code: 'BI' },
    { name: 'Cambodia', code: 'KH' },
    { name: 'Cameroon', code: 'CM' },
    { name: 'Canada', code: 'CA' },
    { name: 'Cape Verde', code: 'CV' },
    { name: 'Cayman Islands', code: 'KY' },
    { name: 'Central African Republic', code: 'CF' },
    { name: 'Chad', code: 'TD' },
    { name: 'Chile', code: 'CL' },
    { name: 'China', code: 'CN' },
    { name: 'Christmas Island', code: 'CX' },
    { name: 'Cocos (Keeling) Islands', code: 'CC' },
    { name: 'Colombia', code: 'CO' },
    { name: 'Comoros', code: 'KM' },
    { name: 'Congo', code: 'CG' },
    { name: 'Congo, The Democratic Republic of the', code: 'CD' },
    { name: 'Cook Islands', code: 'CK' },
    { name: 'Costa Rica', code: 'CR' },
    { name: 'Cote D Ivoire', code: 'CI' },
    { name: 'Croatia', code: 'HR' },
    { name: 'Cuba', code: 'CU' },
    { name: 'Curacao', code: 'CW' },
    { name: 'Cyprus', code: 'CY' },
    { name: 'Czech Republic', code: 'CZ' },
    { name: 'Denmark', code: 'DK' },
    { name: 'Djibouti', code: 'DJ' },
    { name: 'Dominica', code: 'DM' },
    { name: 'Dominican Republic', code: 'DO' },
    { name: 'Ecuador', code: 'EC' },
    { name: 'Egypt', code: 'EG' },
    { name: 'El Salvador', code: 'SV' },
    { name: 'Equatorial Guinea', code: 'GQ' },
    { name: 'Eritrea', code: 'ER' },
    { name: 'Estonia', code: 'EE' },
    { name: 'Eswatini', code: 'SZ' },
    { name: 'Ethiopia', code: 'ET' },
    { name: 'Falkland Islands (Malvinas)', code: 'FK' },
    { name: 'Faroe Islands', code: 'FO' },
    { name: 'Fiji', code: 'FJ' },
    { name: 'Finland', code: 'FI' },
    { name: 'France', code: 'FR' },
    { name: 'French Guiana', code: 'GF' },
    { name: 'French Polynesia', code: 'PF' },
    { name: 'French Southern Territories', code: 'TF' },
    { name: 'Gabon', code: 'GA' },
    { name: 'Gambia', code: 'GM' },
    { name: 'Georgia', code: 'GE' },
    { name: 'Germany', code: 'DE' },
    { name: 'Ghana', code: 'GH' },
    { name: 'Gibraltar', code: 'GI' },
    { name: 'Greece', code: 'GR' },
    { name: 'Greenland', code: 'GL' },
    { name: 'Grenada', code: 'GD' },
    { name: 'Guadeloupe', code: 'GP' },
    { name: 'Guam', code: 'GU' },
    { name: 'Guatemala', code: 'GT' },
    { name: 'Guernsey', code: 'GG' },
    { name: 'Guinea', code: 'GN' },
    { name: 'Guinea-Bissau', code: 'GW' },
    { name: 'Guyana', code: 'GY' },
    { name: 'Haiti', code: 'HT' },
    { name: 'Heard Island and Mcdonald Islands', code: 'HM' },
    { name: 'Holy See (Vatican City State)', code: 'VA' },
    { name: 'Honduras', code: 'HN' },
    { name: 'Hong Kong', code: 'HK' },
    { name: 'Hungary', code: 'HU' },
    { name: 'Iceland', code: 'IS' },
    { name: 'India', code: 'IN' },
    { name: 'Indonesia', code: 'ID' },
    { name: 'Iran, Islamic Republic Of', code: 'IR' },
    { name: 'Iraq', code: 'IQ' },
    { name: 'Ireland', code: 'IE' },
    { name: 'Isle of Man', code: 'IM' },
    { name: 'Israel', code: 'IL' },
    { name: 'Italy', code: 'IT' },
    { name: 'Ivory Coast', code: 'CI' },
    { name: 'Jamaica', code: 'JM' },
    { name: 'Japan', code: 'JP' },
    { name: 'Jersey', code: 'JE' },
    { name: 'Jordan', code: 'JO' },
    { name: 'Kazakhstan', code: 'KZ' },
    { name: 'Kenya', code: 'KE' },
    { name: 'Kiribati', code: 'KI' },
    { name: 'DPR Korea', code: 'KP' },
    { name: 'South Korea', code: 'KR' },
    { name: 'Kuwait', code: 'KW' },
    { name: 'Kyrgyzstan', code: 'KG' },
    { name: 'Laos', code: 'LA' },
    { name: 'Latvia', code: 'LV' },
    { name: 'Lebanon', code: 'LB' },
    { name: 'Lesotho', code: 'LS' },
    { name: 'Liberia', code: 'LR' },
    { name: 'Libyan Arab Jamahiriya', code: 'LY' },
    { name: 'Liechtenstein', code: 'LI' },
    { name: 'Lithuania', code: 'LT' },
    { name: 'Luxembourg', code: 'LU' },
    { name: 'Macao', code: 'MO' },
    { name: 'Macedonia, The Former Yugoslav Republic of', code: 'MK' },
    { name: 'Madagascar', code: 'MG' },
    { name: 'Malawi', code: 'MW' },
    { name: 'Malaysia', code: 'MY' },
    { name: 'Maldives', code: 'MV' },
    { name: 'Mali', code: 'ML' },
    { name: 'Malta', code: 'MT' },
    { name: 'Marshall Islands', code: 'MH' },
    { name: 'Martinique', code: 'MQ' },
    { name: 'Mauritania', code: 'MR' },
    { name: 'Mauritius', code: 'MU' },
    { name: 'Mayotte', code: 'YT' },
    { name: 'Mexico', code: 'MX' },
    { name: 'Micronesia, Federated States of', code: 'FM' },
    { name: 'Moldova, Republic of', code: 'MD' },
    { name: 'Monaco', code: 'MC' },
    { name: 'Mongolia', code: 'MN' },
    { name: 'Montenegro', code: 'ME' },
    { name: 'Montserrat', code: 'MS' },
    { name: 'Morocco', code: 'MA' },
    { name: 'Mozambique', code: 'MZ' },
    { name: 'Myanmar', code: 'MM' },
    { name: 'Namibia', code: 'NA' },
    { name: 'Nauru', code: 'NR' },
    { name: 'Nepal', code: 'NP' },
    { name: 'Netherlands', code: 'NL' },
    { name: 'Netherlands Antilles', code: 'AN' },
    { name: 'New Caledonia', code: 'NC' },
    { name: 'New Zealand', code: 'NZ' },
    { name: 'Nicaragua', code: 'NI' },
    { name: 'Niger', code: 'NE' },
    { name: 'Nigeria', code: 'NG' },
    { name: 'Niue', code: 'NU' },
    { name: 'Norfolk Island', code: 'NF' },
    { name: 'Northern Mariana Islands', code: 'MP' },
    { name: 'Norway', code: 'NO' },
    { name: 'Oman', code: 'OM' },
    { name: 'Pakistan', code: 'PK' },
    { name: 'Palau', code: 'PW' },
    { name: 'Palestinian Territory, Occupied', code: 'PS' },
    { name: 'Panama', code: 'PA' },
    { name: 'Papua New Guinea', code: 'PG' },
    { name: 'Paraguay', code: 'PY' },
    { name: 'Peru', code: 'PE' },
    { name: 'Philippines', code: 'PH' },
    { name: 'Pitcairn', code: 'PN' },
    { name: 'Poland', code: 'PL' },
    { name: 'Portugal', code: 'PT' },
    { name: 'Puerto Rico', code: 'PR' },
    { name: 'Qatar', code: 'QA' },
    { name: 'RWANDA', code: 'RW' },
    { name: 'Reunion', code: 'RE' },
    { name: 'Romania', code: 'RO' },
    { name: 'Russian Federation', code: 'RU' },
    { name: 'Saint Barthelemy', code: 'BL' },
    { name: 'Saint Helena', code: 'SH' },
    { name: 'Saint Kitts and Nevis', code: 'KN' },
    { name: 'Saint Lucia', code: 'LC' },
    { name: 'Saint Martin', code: 'MF' },
    { name: 'Saint Pierre and Miquelon', code: 'PM' },
    { name: 'Saint Vincent and the Grenadines', code: 'VC' },
    { name: 'Samoa', code: 'WS' },
    { name: 'San Marino', code: 'SM' },
    { name: 'Sao Tome and Principe', code: 'ST' },
    { name: 'Saudi Arabia', code: 'SA' },
    { name: 'Senegal', code: 'SN' },
    { name: 'Serbia', code: 'RS' },
    { name: 'Seychelles', code: 'SC' },
    { name: 'Sierra Leone', code: 'SL' },
    { name: 'Singapore', code: 'SG' },
    { name: 'Sint Maarten', code: 'SX' },
    { name: 'Slovakia', code: 'SK' },
    { name: 'Slovenia', code: 'SI' },
    { name: 'Solomon Islands', code: 'SB' },
    { name: 'Somalia', code: 'SO' },
    { name: 'South Africa', code: 'ZA' },
    { name: 'South Georgia and the South Sandwich Islands', code: 'GS' },
    { name: 'South Sudan', code: 'SS' },
    { name: 'Spain', code: 'ES' },
    { name: 'Sri Lanka', code: 'LK' },
    { name: 'Sudan', code: 'SD' },
    { name: 'Suriname', code: 'SR' },
    { name: 'Svalbard and Jan Mayen', code: 'SJ' },
    { name: 'Swaziland', code: 'SZ' },
    { name: 'Sweden', code: 'SE' },
    { name: 'Switzerland', code: 'CH' },
    { name: 'Syrian Arab Republic', code: 'SY' },
    { name: 'Taiwan', code: 'TW' },
    { name: 'Tajikistan', code: 'TJ' },
    { name: 'Tanzania, United Republic of', code: 'TZ' },
    { name: 'Thailand', code: 'TH' },
    { name: 'Timor-Leste', code: 'TL' },
    { name: 'Togo', code: 'TG' },
    { name: 'Tokelau', code: 'TK' },
    { name: 'Tonga', code: 'TO' },
    { name: 'Trinidad and Tobago', code: 'TT' },
    { name: 'Tunisia', code: 'TN' },
    { name: 'Turkey', code: 'TR' },
    { name: 'Turkmenistan', code: 'TM' },
    { name: 'Turks and Caicos Islands', code: 'TC' },
    { name: 'Tuvalu', code: 'TV' },
    { name: 'Uganda', code: 'UG' },
    { name: 'Ukraine', code: 'UA' },
    { name: 'United Arab Emirates', code: 'AE' },
    { name: 'United Kingdom', code: 'GB' },
    { name: 'United States', code: 'US' },
    { name: 'United States Minor Outlying Islands', code: 'UM' },
    { name: 'Uruguay', code: 'UY' },
    { name: 'Uzbekistan', code: 'UZ' },
    { name: 'Vanuatu', code: 'VU' },
    { name: 'Venezuela', code: 'VE' },
    { name: 'Viet Nam', code: 'VN' },
    { name: 'Vietnam', code: 'VN' },
    { name: 'Virgin Islands, British', code: 'VG' },
    { name: 'Virgin Islands, U.S.', code: 'VI' },
    { name: 'Wallis and Futuna', code: 'WF' },
    { name: 'Western Sahara', code: 'EH' },
    { name: 'Yemen', code: 'YE' },
    { name: 'Zambia', code: 'ZM' },
    { name: 'Zimbabwe', code: 'ZW' },
    { name: 'Åland Islands', code: 'AX' },
];

function fallbackMovieSelection() {
    const fallbackMovies = [432413, 299534, 1726, 562, 118340, 455207, 493922, 447332, 22970, 530385, 27205, 264660, 120467, 603, 577922, 76341, 539, 419704, 515001, 118340, 424, 98];
    const randomFallbackMovie = fallbackMovies[Math.floor(Math.random() * fallbackMovies.length)];
    localStorage.setItem('selectedMovieId', randomFallbackMovie);
    window.location.href = 'movie-details.html';
}

function displayCompanyMovies(movies) {
    const moviesList = document.getElementById('company-movies-list');
    movies.forEach((movie, index) => {
        const movieContainer = document.createElement('span');

        const movieLink = document.createElement('span');
        movieLink.textContent = movie.title;
        movieLink.style.cursor = 'pointer';
        movieLink.style.textDecoration = 'underline';
        movieLink.addEventListener('mouseenter', () => {
            movieLink.style.color = '#f509d9';
        });
        movieLink.addEventListener('mouseleave', () => {
            movieLink.style.color = 'white';
        });
        movieLink.addEventListener('click', () => {
            localStorage.setItem('selectedMovieId', movie.id);
            window.location.href = 'movie-details.html';
        });

        movieContainer.appendChild(movieLink);

        if (index < movies.length - 1) {
            movieContainer.appendChild(document.createTextNode(','));
        }

        moviesList.appendChild(movieContainer);
    });
}

function updateClock() {
    var now = new Date();
    var hours = now.getHours();
    var minutes = now.getMinutes();
    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var timeString = hours + ':' + minutes;
    document.getElementById('clock').innerHTML = timeString;
}

setInterval(updateClock, 1000);
window.onload = updateClock;
